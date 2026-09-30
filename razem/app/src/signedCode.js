// Signed trip codes: the agency signs {expiry, id} with its private key (agency page);
// the app verifies with the public key only, offline. No server and no rebuild per code.
// Format: "RZM1." + base64url( ver(1) | expiryDay(2, days since 2024-01-01) | id(4) | ECDSA-P256 signature(64) )
export const PREFIX = 'RZM1.';
const EPOCH = Date.UTC(2024, 0, 1), DAY = 86400000;
const ALG = { name: 'ECDSA', namedCurve: 'P-256' }, SIG = { name: 'ECDSA', hash: 'SHA-256' };

const b64u = (bytes) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64u = (s) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4)), c => c.charCodeAt(0));
const B32 = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const idLabel = (id) => { let n = ((id[0] << 24) | (id[1] << 16) | (id[2] << 8) | id[3]) >>> 0, s = ''; for (let i = 0; i < 6; i++) { s = B32[n % 32] + s; n = Math.floor(n / 32); } return 'RZM-' + s; };
const toDay = (iso) => Math.round((Date.parse(iso + 'T00:00:00Z') - EPOCH) / DAY);
const fromDay = (d) => new Date(EPOCH + d * DAY).toISOString().slice(0, 10);

export const isSigned = (code) => (code || '').startsWith(PREFIX);

export async function signCode(privateKey, untilIso) {
  const body = new Uint8Array(7), id = crypto.getRandomValues(new Uint8Array(4)), d = toDay(untilIso);
  body[0] = 1; body[1] = d >> 8; body[2] = d & 255; body.set(id, 3);
  const sig = new Uint8Array(await crypto.subtle.sign(SIG, privateKey, body));
  const all = new Uint8Array(71); all.set(body); all.set(sig, 7);
  return { code: PREFIX + b64u(all), label: idLabel(id), until: untilIso };
}

// -> { valid:boolean, until, label }
export async function verifyCode(publicJwk, code) {
  try {
    const all = unb64u(code.slice(PREFIX.length));
    if (all.length !== 71 || all[0] !== 1) return { valid: false };
    const key = await crypto.subtle.importKey('jwk', publicJwk, ALG, false, ['verify']);
    const valid = await crypto.subtle.verify(SIG, key, all.slice(7), all.slice(0, 7));
    return { valid, until: fromDay((all[1] << 8) | all[2]), label: idLabel(all.slice(3, 7)) };
  } catch { return { valid: false }; }
}

// Agency private key is shipped only in encrypted form; the agency password unlocks it.
async function pwKey(password, salt) {
  const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: 310000, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}
export async function encryptPrivateKey(pkcs8, password) {
  const salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
  const data = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await pwKey(password, salt), pkcs8));
  return { salt: b64u(salt), iv: b64u(iv), data: b64u(data) };
}
export async function unlockPrivateKey(enc, password) {
  const pkcs8 = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64u(enc.iv) }, await pwKey(password, unb64u(enc.salt)), unb64u(enc.data));
  return crypto.subtle.importKey('pkcs8', pkcs8, ALG, false, ['sign']);
}
export { ALG };
