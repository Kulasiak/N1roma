// One-off converter: turns the prototype's <x-dc> template (phone 1a) into JSX.
// Output is committed as src/View.generated.jsx and then hand-adapted into src/View.jsx.
import { readFileSync, writeFileSync } from 'node:fs';
import { parseDocument } from 'htmlparser2';

const src = readFileSync(new URL('../../project/Razem App.dc.html', import.meta.url), 'utf8');
const lines = src.split('\n');
// Lines 18–744: the screen <div ref="{{ screenRef }}"> … </div> of prototype 1a.
const tpl = lines.slice(17, 744).join('\n');
const doc = parseDocument(tpl, { lowerCaseAttributeNames: false, lowerCaseTags: false, recognizeSelfClosing: true, decodeEntities: true });

const VOID = new Set(['input', 'br', 'img']);
const expr = (s, scope) => {
  const e = s.trim();
  const root = e.split('.')[0];
  return scope.has(root) ? e : 'v.' + e;
};
const interp = (str, scope) => {
  const parts = [];
  let last = 0;
  for (const m of str.matchAll(/\{\{\s*([^}]+?)\s*\}\}/g)) {
    if (m.index > last) parts.push({ lit: str.slice(last, m.index) });
    parts.push({ e: expr(m[1], scope) });
    last = m.index + m[0].length;
  }
  if (last < str.length) parts.push({ lit: str.slice(last) });
  return parts;
};
const onlyExpr = (str) => /^\s*\{\{[^}]+\}\}\s*$/.test(str);
const tplLit = (parts) => '`' + parts.map(p => p.lit !== undefined ? p.lit.replace(/[`\\]/g, '\\$&').replace(/\$\{/g, '\\${') : '${' + p.e + '}').join('') + '`';

function attrs(el, scope) {
  const out = [];
  for (const [k, val] of Object.entries(el.attribs)) {
    if (k.startsWith('hint-') || k === 'style-hover') continue;
    if (k === 'style') {
      const parts = interp(val, scope);
      out.push(parts.some(p => p.e) ? `style={css(${tplLit(parts)})}` : `style={css(${JSON.stringify(val)})}`);
      continue;
    }
    if (onlyExpr(val)) { out.push(`${k}={${interp(val, scope)[0].e}}`); continue; }
    const parts = interp(val, scope);
    out.push(parts.some(p => p.e) ? `${k}={${tplLit(parts)}}` : `${k}=${JSON.stringify(val)}`);
  }
  return out.length ? ' ' + out.join(' ') : '';
}

function text(t, scope) {
  if (!t.trim()) return t.includes('\n') ? '\n' : (t ? ' ' : '');
  return interp(t, scope).map(p => p.e ? `{${p.e}}` : (/[{}<>]/.test(p.lit) || /^\s|\s$/.test(p.lit) ? `{${JSON.stringify(p.lit)}}` : p.lit)).join('');
}

function node(n, scope, ind) {
  if (n.type === 'text') return text(n.data, scope);
  if (n.type === 'comment') return '';
  const kids = (sc) => n.children.map(c => node(c, sc, ind + 1)).join('');
  if (n.name === 'sc-if') {
    return `{${interp(n.attribs.value, scope)[0].e} && (<>${kids(scope)}</>)}`;
  }
  if (n.name === 'sc-for') {
    const as = n.attribs.as;
    const sc = new Set(scope); sc.add(as);
    return `{${interp(n.attribs.list, scope)[0].e}.map((${as}, i_${as}) => (<Fragment key={i_${as}}>${kids(sc)}</Fragment>))}`;
  }
  const a = attrs(n, scope);
  if (VOID.has(n.name)) return `<${n.name}${a} />`;
  return `<${n.name}${a}>${kids(scope)}</${n.name}>`;
}

const body = doc.children.map(c => node(c, new Set(), 0)).join('');
writeFileSync(new URL('../src/View.generated.jsx', import.meta.url),
  `import { Fragment } from 'react';\nimport { css } from './css.js';\n\nexport default function View({ v }) {\n  return (<>${body}</>);\n}\n`);
console.log('ok', body.length);
