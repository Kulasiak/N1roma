/**
 * Collegamento a WhatsApp tramite link wa.me.
 * Nessuna API: il link apre la chat col messaggio già scritto, pronto da
 * inviare. L'invio resta sempre una scelta di chi usa l'app.
 */

/** "+39 335 118 4420" → "393351184420"; senza prefisso usa quello del salone. */
export function normalizePhone(raw: string, countryCode = '39'): string | null {
  if (!raw) return null
  const hasPlus = raw.trim().startsWith('+')
  let digits = raw.replace(/\D/g, '')
  if (!digits) return null
  if (digits.startsWith('00')) return digits.slice(2)
  if (hasPlus) return digits
  digits = digits.replace(/^0+/, '')
  return digits.startsWith(countryCode) ? digits : `${countryCode}${digits}`
}

export function waLink(phone: string, text: string, countryCode = '39'): string | null {
  const number = normalizePhone(phone, countryCode)
  return number ? `https://wa.me/${number}?text=${encodeURIComponent(text)}` : null
}

export function openWhatsApp(phone: string, text: string, countryCode = '39'): boolean {
  const url = waLink(phone, text, countryCode)
  if (!url) return false
  window.open(url, '_blank', 'noopener,noreferrer')
  return true
}
