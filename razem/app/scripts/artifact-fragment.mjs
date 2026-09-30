// Turns dist-artifact/artifact.html into a page fragment (the host adds doctype/head/body) at dist-artifact/razem.html.
import { readFileSync, writeFileSync } from 'node:fs';
const agency = process.env.RZ_ENTRY === 'agency';
const dir = agency ? 'dist-artifact-agency' : 'dist-artifact', src = agency ? 'artifact-agency.html' : 'artifact.html', out = agency ? 'razem-agenzia.html' : 'razem.html', title = agency ? 'Razem Agenzia' : 'Razem';
const h = readFileSync(dir + '/' + src, 'utf8');
const head = h.slice(h.indexOf('<head>') + 6, h.indexOf('</head>'));
const body = h.slice(h.indexOf('<body>') + 6, h.lastIndexOf('</body>'));
const keep = head.replace(/<meta charset[^>]*>/i, '').replace(/<meta name="viewport"[^>]*>/i, '').replace(/<title>[^<]*<\/title>/i, '');
writeFileSync(dir + '/' + out, '<title>' + title + '</title>\n' + keep.trim() + '\n' + body.trim() + '\n');
console.log('ok', (readFileSync(dir + '/' + out).length / 1e6).toFixed(2) + ' MB');
