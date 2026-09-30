// Access control: the app opens only with a trip code issued by the agency.
// Codes live in access-codes.json as SHA-256 hashes with an expiry date; manage them with scripts/add-code.mjs.
// This is a client-side gate: it keeps casual users out, but real enforcement (revoking codes, device limits)
// needs the booking backend described in the design handoff.
import cfg from './access-codes.json';

export const SHOW_DEMO = !!cfg.showDemoButton;
export const DEMO_CODE = 'RZM-2481';
export const normCode = (c) => (c || '').toUpperCase().replace(/\s+/g, '');

async function sha256(s) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}

// -> { ok:true, entry } | { ok:false, reason:'invalid'|'expired' }
export async function checkCode(code) {
  const h = await sha256('razem:' + normCode(code));
  const entry = cfg.codes.find(c => c.hash === h);
  if (!entry) return { ok: false, reason: 'invalid' };
  if (new Date() > new Date(entry.until + 'T23:59:59')) return { ok: false, reason: 'expired' };
  return { ok: true, entry };
}
