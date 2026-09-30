// Turns dist-artifact/artifact.html into a page fragment (the host adds doctype/head/body) at dist-artifact/razem.html.
import { readFileSync, writeFileSync } from 'node:fs';
const h = readFileSync('dist-artifact/artifact.html', 'utf8');
const head = h.slice(h.indexOf('<head>') + 6, h.indexOf('</head>'));
const body = h.slice(h.indexOf('<body>') + 6, h.lastIndexOf('</body>'));
const keep = head.replace(/<meta charset[^>]*>/i, '').replace(/<meta name="viewport"[^>]*>/i, '').replace(/<title>[^<]*<\/title>/i, '');
writeFileSync('dist-artifact/razem.html', '<title>Razem</title>\n' + keep.trim() + '\n' + body.trim() + '\n');
console.log('ok', (readFileSync('dist-artifact/razem.html').length / 1e6).toFixed(2) + ' MB');
