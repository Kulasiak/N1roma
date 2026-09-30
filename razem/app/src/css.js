// Parses an inline CSS string (as written in the design prototype) into a React style object.
const cache = new Map();
const camel = (p) => p.startsWith('--') ? p : p.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

export function css(str) {
  let o = cache.get(str);
  if (o) return o;
  o = {};
  let depth = 0, quote = null, buf = '';
  const decls = [];
  for (const ch of str) {
    if (quote) { if (ch === quote) quote = null; }
    else if (ch === '"' || ch === "'") quote = ch;
    else if (ch === '(') depth++;
    else if (ch === ')') depth--;
    else if (ch === ';' && depth === 0) { decls.push(buf); buf = ''; continue; }
    buf += ch;
  }
  decls.push(buf);
  for (const d of decls) {
    const i = d.indexOf(':');
    if (i < 0) continue;
    const k = d.slice(0, i).trim(), val = d.slice(i + 1).trim();
    if (k) o[camel(k)] = val;
  }
  if (cache.size > 4000) cache.clear();
  cache.set(str, o);
  return o;
}
