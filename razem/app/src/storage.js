// On-device persistence.
// - App state: localStorage (small JSON).
// - Document vault: IndexedDB, photos encrypted with AES-GCM using a non-extractable key that never leaves the device.
const KEY = 'razem.state.v1';

export function loadState() {
  try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch { return null; }
}
export function saveState(obj) {
  try { localStorage.setItem(KEY, JSON.stringify(obj)); } catch {}
}

let dbp = null;
function db() {
  if (!dbp) dbp = new Promise((res, rej) => {
    const r = indexedDB.open('razem', 1);
    r.onupgradeneeded = () => { r.result.createObjectStore('keys'); r.result.createObjectStore('docs'); };
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
  return dbp;
}
async function tx(store, mode, fn) {
  const d = await db();
  return new Promise((res, rej) => {
    const t = d.transaction(store, mode), req = fn(t.objectStore(store));
    t.oncomplete = () => res(req && req.result);
    t.onerror = () => rej(t.error);
  });
}
async function vaultKey() {
  let k = await tx('keys', 'readonly', s => s.get('vault'));
  if (!k) {
    k = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
    await tx('keys', 'readwrite', s => s.put(k, 'vault'));
  }
  return k;
}

// Downscale a camera photo so the vault stays small, then encrypt it.
async function toJpeg(file, max = 1600) {
  const bmp = await createImageBitmap(file);
  const r = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas');
  c.width = Math.round(bmp.width * r); c.height = Math.round(bmp.height * r);
  c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
  return new Promise(res => c.toBlob(b => res(b), 'image/jpeg', 0.85));
}

export async function saveDoc(id, file) {
  let blob = file;
  try { blob = await toJpeg(file); } catch {}
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await vaultKey(), await blob.arrayBuffer());
  await tx('docs', 'readwrite', s => s.put({ iv, data, type: blob.type || 'image/jpeg' }, id));
  return URL.createObjectURL(blob);
}

export async function loadDocs(ids) {
  const out = {};
  const key = await vaultKey();
  for (const id of ids) {
    const rec = await tx('docs', 'readonly', s => s.get(id));
    if (!rec) continue;
    try {
      const buf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: rec.iv }, key, rec.data);
      out[id] = URL.createObjectURL(new Blob([buf], { type: rec.type }));
    } catch {}
  }
  return out;
}

export async function wipeAll() {
  try { localStorage.removeItem(KEY); } catch {}
  try { await tx('docs', 'readwrite', s => s.clear()); await tx('keys', 'readwrite', s => s.clear()); } catch {}
}
