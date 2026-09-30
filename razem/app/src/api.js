// Backend client: Supabase RPC over plain fetch (no SDK). Configured in /config.js.
const cfg = (typeof window !== 'undefined' && window.RAZEM_CONFIG) || {};
export const BACKEND = !!(cfg.supabaseUrl && cfg.supabaseAnonKey);

export async function rpc(fn, args) {
  const r = await fetch(cfg.supabaseUrl.replace(/\/+$/, '') + '/rest/v1/rpc/' + fn, {
    method: 'POST',
    headers: { apikey: cfg.supabaseAnonKey, Authorization: 'Bearer ' + cfg.supabaseAnonKey, 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  });
  if (!r.ok) throw new Error('rpc ' + fn + ' ' + r.status);
  return r.json();
}

export function deviceId() {
  try {
    let id = localStorage.getItem('razem.device');
    if (!id) { id = crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random(); localStorage.setItem('razem.device', id); }
    return id;
  } catch { return 'nostorage-' + Date.now(); }
}

export function deviceLabel() {
  const ua = navigator.userAgent;
  const os = /iPhone|iPad/.test(ua) ? 'iPhone/iPad' : /Android/.test(ua) ? 'Android' : /Mac/.test(ua) ? 'Mac' : /Windows/.test(ua) ? 'Windows' : 'Web';
  return os + ' · ' + new Date().toISOString().slice(0, 10);
}
