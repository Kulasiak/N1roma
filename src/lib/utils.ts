/** Utility condivise: classi, date localizzate, valuta, formattazioni. */

export function cn(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ')
}

export function uid(prefix = 'id'): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`
}

/** PRNG deterministico (mulberry32): dati demo riproducibili. */
export function makeRng(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function pick<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)]
}

export function randInt(rng: () => number, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1))
}

/* ------------------------------------------------------------- locale */

let activeLocale = 'it-IT'

export function setFormatLocale(locale: string): void {
  activeLocale = locale
}

/* ------------------------------------------------------------- valuta */

export function money(value: number): string {
  return new Intl.NumberFormat(activeLocale, {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(value)
}

export function moneyShort(value: number): string {
  if (Math.abs(value) >= 1000) {
    return `${(value / 1000).toLocaleString(activeLocale, { maximumFractionDigits: 1 })}k €`
  }
  return `${Math.round(value)} €`
}

export function pct(value: number, digits = 0): string {
  return `${value.toLocaleString(activeLocale, { maximumFractionDigits: digits })}%`
}

/* --------------------------------------------------------------- date */

/** Il 4 gennaio 1970 era una domenica: base per i nomi dei giorni. */
function weekdayRef(day: number): Date {
  return new Date(1970, 0, 4 + day)
}

export function weekdayShort(day: number): string {
  const s = weekdayRef(day).toLocaleDateString(activeLocale, { weekday: 'short' })
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/\.$/, '')
}

export function weekdayLong(day: number): string {
  const s = weekdayRef(day).toLocaleDateString(activeLocale, { weekday: 'long' })
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function dayKey(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function parseDayKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function startOfDay(d: Date): Date {
  const c = new Date(d)
  c.setHours(0, 0, 0, 0)
  return c
}

export function addDays(d: Date, n: number): Date {
  const c = new Date(d)
  c.setDate(c.getDate() + n)
  return c
}

export function startOfWeek(d: Date): Date {
  const c = startOfDay(d)
  return addDays(c, -((c.getDay() + 6) % 7))
}

export function isSameDay(a: Date | string, b: Date | string): boolean {
  return dayKey(a) === dayKey(b)
}

export function isToday(d: Date | string): boolean {
  return isSameDay(d, new Date())
}

export function formatTime(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d
  return date.toLocaleTimeString(activeLocale, { hour: '2-digit', minute: '2-digit' })
}

export function formatDateShort(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d
  return date.toLocaleDateString(activeLocale, { weekday: 'short', day: 'numeric', month: 'short' })
}

export function formatDateLong(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d
  const s = date.toLocaleDateString(activeLocale, {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function dayOffset(d: Date | string): number {
  const target = startOfDay(typeof d === 'string' ? new Date(d) : d)
  return Math.round((target.getTime() - startOfDay(new Date()).getTime()) / 86400000)
}

export function relativeDay(d: Date | string): string {
  return new Intl.RelativeTimeFormat(activeLocale, { numeric: 'auto' }).format(dayOffset(d), 'day')
}

export function hhmmToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + (m || 0)
}

export function minutesToHhmm(mins: number): string {
  return `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`
}

export function atTime(day: Date, hhmm: string): Date {
  const c = startOfDay(day)
  c.setMinutes(hhmmToMinutes(hhmm))
  return c
}

export function formatDuration(mins: number): string {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h === 0) return `${m} min`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

/** "fra 12 min", "adesso", "8 min fa" — per la bacheca del personale. */
export function relativeMinutes(target: Date, now: Date): string {
  const diff = Math.round((target.getTime() - now.getTime()) / 60000)
  if (Math.abs(diff) < 1) return '—'
  const rtf = new Intl.RelativeTimeFormat(activeLocale, { numeric: 'auto' })
  if (Math.abs(diff) >= 60) return rtf.format(Math.round(diff / 60), 'hour')
  return rtf.format(diff, 'minute')
}

/* --------------------------------------------------------------- varie */

export function fullName(c: { firstName: string; lastName: string }): string {
  return `${c.firstName} ${c.lastName}`.trim()
}

export function normalize(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

export function matchesQuery(haystack: string, query: string): boolean {
  const q = normalize(query.trim())
  if (!q) return true
  return q.split(/\s+/).every((token) => normalize(haystack).includes(token))
}

export function sum<T>(items: T[], get: (item: T) => number): number {
  return items.reduce((acc, item) => acc + get(item), 0)
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

/** Variazione percentuale fra due periodi, robusta allo zero. */
export function trendPct(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null
  return ((current - previous) / previous) * 100
}
