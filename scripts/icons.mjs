/** Genera le icone dell'app (PWA + iOS). Uso: node scripts/icons.mjs */
import { chromium } from 'playwright'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'icons')
mkdirSync(OUT, { recursive: true })

/** `padding` è la zona di sicurezza richiesta dalle icone maskable Android. */
const mark = ({ size, radius, padding = 0 }) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#7A3763"/><stop offset="55%" stop-color="#A47864"/><stop offset="100%" stop-color="#E8946A"/>
  </linearGradient></defs>
  <rect width="${size}" height="${size}" rx="${radius}" fill="url(#g)"/>
  <g transform="translate(${padding} ${padding}) scale(${(size - padding * 2) / 64})">
    <path d="M12 40c5-9 10-9 15 0s10 9 15 0" fill="none" stroke="#FDFAF7" stroke-width="4.5" stroke-linecap="round"/>
    <path d="M12 27c5-9 10-9 15 0s10 9 15 0" fill="none" stroke="#FDFAF7" stroke-width="4.5" stroke-linecap="round" opacity=".55"/>
  </g></svg>`

const TARGETS = [
  { file: 'icon-192.png', size: 192, radius: 42 },
  { file: 'icon-512.png', size: 512, radius: 112 },
  { file: 'icon-maskable-512.png', size: 512, radius: 0, padding: 96 },
  { file: 'apple-touch-icon.png', size: 180, radius: 40 },
]

const browser = await chromium.launch()
const page = await browser.newPage()
for (const t of TARGETS) {
  const svg = mark(t)
  writeFileSync(join(OUT, t.file.replace('.png', '.svg')), svg)
  await page.setViewportSize({ width: t.size, height: t.size })
  await page.setContent(`<body style="margin:0">${svg}</body>`, { waitUntil: 'load' })
  await page.screenshot({ path: join(OUT, t.file) })
  console.log('  ✓', t.file)
}
await browser.close()
