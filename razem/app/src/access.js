// Access control: the app opens only with a trip code issued by the agency.
// 1) Signed codes (normal case): created on the agency page (/agenzia.html), sent as a link/QR,
//    verified offline with the public key in access-keys.json. Expiry is inside the code.
// 2) Fixed codes (optional): SHA-256 hashes in access-codes.json, managed with scripts/add-code.mjs.
// Revoke a signed code by adding its label (e.g. "RZM-AB12CD") to "revoked" in access-codes.json and republishing.
// Client-side gate: real enforcement (device limits, instant revocation) needs the booking backend.
import cfg from './access-codes.json';
import keys from './access-keys.json';
import { isSigned, verifyCode } from './signedCode.js';

export const SHOW_DEMO = !!cfg.showDemoButton;
export const DEMO_CODE = 'RZM-2481';

// Accepts a code, or a whole invitation link (…/#k=RZM1.xxxx) pasted from a message.
export function normCode(c) {
  const s = (c || '').replace(/[\s\u200B-\u200D\uFEFF\u00A0]+/g, '');
  const m = s.match(/[#?&][kc]=([A-Za-z0-9._-]+)/);
  if (m) return m[1].startsWith('RZM1.') ? m[1] : m[1].toUpperCase();
  const sig = s.match(/RZM1\.[A-Za-z0-9_-]+/i);
  if (sig) return 'RZM1.' + sig[0].slice(5);
  return s.toUpperCase().replace(/\s+/g, '');
}

async function sha256(s) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}
const expired = (until) => new Date() > new Date(until + 'T23:59:59');

// -> { ok:true, until, label } | { ok:false, reason:'invalid'|'expired' }
export async function checkCode(code) {
  const c = normCode(code);
  if (isSigned(c)) {
    const r = await verifyCode(keys.publicKey, c);
    if (!r.valid || (cfg.revoked || []).includes(r.label)) return { ok: false, reason: 'invalid' };
    if (expired(r.until)) return { ok: false, reason: 'expired' };
    return { ok: true, until: r.until, label: r.label };
  }
  if (/^RZM-[A-Z0-9]{6}$/.test(c) && !cfg.codes.length) return { ok: false, reason: 'short' };
  const h = await sha256('razem:' + c);
  const entry = cfg.codes.find(e => e.hash === h);
  if (!entry) return { ok: false, reason: 'invalid' };
  if (expired(entry.until)) return { ok: false, reason: 'expired' };
  return { ok: true, until: entry.until, label: c };
}
