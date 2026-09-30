// Adds a trip access code to src/access-codes.json (stored only as a SHA-256 hash).
// Usage:
//   node scripts/add-code.mjs <CODE|new> <valid-until YYYY-MM-DD> [agency] [note]
//   node scripts/add-code.mjs new 2026-11-15 "Wakacje z Rzymem" "Nowak x2"   -> generates a random RZM-XXXX-XXXX code
// Then rebuild (npm run build) and republish.
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash, randomInt } from 'node:crypto';

const [codeArg, until, agency = '', note = ''] = process.argv.slice(2);
if (!codeArg || !/^\d{4}-\d{2}-\d{2}$/.test(until || '')) {
  console.error('Usage: node scripts/add-code.mjs <CODE|new> <YYYY-MM-DD> [agency] [note]');
  process.exit(1);
}
const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const part = () => Array.from({ length: 4 }, () => A[randomInt(A.length)]).join('');
const code = codeArg === 'new' ? `RZM-${part()}-${part()}` : codeArg;
const norm = code.toUpperCase().replace(/\s+/g, '');
const hash = createHash('sha256').update('razem:' + norm).digest('hex');

const file = new URL('../src/access-codes.json', import.meta.url);
const cfg = JSON.parse(readFileSync(file, 'utf8'));
cfg.codes = cfg.codes.filter(c => c.hash !== hash);
cfg.codes.push({ hash, until, agency, note });
writeFileSync(file, JSON.stringify(cfg, null, 2) + '\n');
console.log(`Added ${norm} (valid until ${until}). Give this code to the traveller.`);
