// One-time setup (or to change the agency password): creates the signing key pair.
//   node scripts/setup-keys.mjs "<agency password>"          -> new key pair (all previously issued links stop working)
//   node scripts/setup-keys.mjs "<new password>" --rekey-from "<old password>"   -> same keys, new password
// Writes src/access-keys.json (public key + password-encrypted private key). Rebuild and republish after running.
import { readFileSync, writeFileSync } from 'node:fs';
import { webcrypto } from 'node:crypto';
if (!globalThis.crypto) globalThis.crypto = webcrypto;
const { encryptPrivateKey, unlockPrivateKey, ALG } = await import('../src/signedCode.js');
globalThis.btoa ??= (s) => Buffer.from(s, 'binary').toString('base64');
globalThis.atob ??= (s) => Buffer.from(s, 'base64').toString('binary');

const [password, flag, oldPw] = process.argv.slice(2);
if (!password || password.length < 10) { console.error('Password of at least 10 characters required.'); process.exit(1); }
const file = new URL('../src/access-keys.json', import.meta.url);
let publicKey, pkcs8;
if (flag === '--rekey-from') {
  const cur = JSON.parse(readFileSync(file, 'utf8'));
  // re-derive: decrypt with old password (needs extractable import)
  const { subtle } = crypto;
  const dec = await (async () => {
    const u = (s) => Uint8Array.from(Buffer.from(s, 'base64url'));
    const base = await subtle.importKey('raw', new TextEncoder().encode(oldPw), 'PBKDF2', false, ['deriveKey']);
    const k = await subtle.deriveKey({ name: 'PBKDF2', salt: u(cur.encPrivateKey.salt), iterations: 310000, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
    return subtle.decrypt({ name: 'AES-GCM', iv: u(cur.encPrivateKey.iv) }, k, u(cur.encPrivateKey.data));
  })();
  publicKey = cur.publicKey; pkcs8 = dec;
} else {
  const kp = await crypto.subtle.generateKey(ALG, true, ['sign', 'verify']);
  publicKey = await crypto.subtle.exportKey('jwk', kp.publicKey);
  pkcs8 = await crypto.subtle.exportKey('pkcs8', kp.privateKey);
}
const encPrivateKey = await encryptPrivateKey(pkcs8, password);
await unlockPrivateKey(encPrivateKey, password); // self-check
writeFileSync(file, JSON.stringify({ publicKey: { kty: publicKey.kty, crv: publicKey.crv, x: publicKey.x, y: publicKey.y }, encPrivateKey }, null, 2) + '\n');
console.log('Keys written to src/access-keys.json. Rebuild and republish.');
