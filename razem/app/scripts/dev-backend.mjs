// Local stand-in for Supabase, for development and tests only:
// in-process Postgres (PGlite) + the same /rest/v1/rpc/<fn> HTTP API that Supabase exposes.
//   node scripts/dev-backend.mjs            -> http://localhost:54321  (agency: demo@razem.test / demo-password-123)
import { PGlite } from '@electric-sql/pglite';
import { pgcrypto } from '@electric-sql/pglite/contrib/pgcrypto';
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';

const PORT = +(process.env.PORT || 54321);
const db = await PGlite.create({ extensions: { pgcrypto } });
await db.exec(`create role anon nologin; create role authenticated nologin; grant usage on schema public to anon;`);
await db.exec(readFileSync(new URL('../supabase/schema.sql', import.meta.url), 'utf8'));
await db.exec(`grant usage on schema extensions to anon;`);
await db.query(`select razem_create_agency('Wakacje z Rzymem', 'demo@razem.test', 'demo-password-123')`);
if (process.env.EXPIRED_TEST) await db.exec(process.env.EXPIRED_TEST);

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'apikey, authorization, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
createServer(async (req, res) => {
  if (req.method === 'OPTIONS') { res.writeHead(204, cors); return res.end(); }
  const m = req.url.match(/^\/rest\/v1\/rpc\/([a-z_]+)$/);
  if (req.method === 'POST' && m && req.url.startsWith('/rest/v1/rpc/__sql') === false) {
    let body = ''; for await (const c of req) body += c;
    try {
      const args = JSON.parse(body || '{}'), keys = Object.keys(args);
      const sql = `select ${m[1]}(${keys.map((k, i) => `${k} => $${i + 1}`).join(', ')}) as r`;
      // Run as the public "anon" role, like Supabase does for the anon key.
      const out = await db.transaction(async tx => { await tx.exec('set local role anon'); return tx.query(sql, keys.map(k => typeof args[k] === 'object' && args[k] !== null ? JSON.stringify(args[k]) : args[k])); });
      res.writeHead(200, { ...cors, 'Content-Type': 'application/json' }); res.end(JSON.stringify(out.rows[0].r));
    } catch (e) { res.writeHead(400, { ...cors, 'Content-Type': 'application/json' }); res.end(JSON.stringify({ message: e.message })); }
    return;
  }
  // test-only: run SQL as admin
  if (req.method === 'POST' && req.url === '/__admin_sql') { let b = ''; for await (const c of req) b += c; try { const r = await db.exec(b); res.writeHead(200, cors); res.end(JSON.stringify(r.map(x => x.rows))); } catch (e) { res.writeHead(400, cors); res.end(e.message); } return; }
  res.writeHead(404, cors); res.end('{}');
}).listen(PORT, () => console.log('razem dev backend on http://localhost:' + PORT));
