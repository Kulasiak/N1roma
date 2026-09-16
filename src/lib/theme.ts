/** Tema chiaro/scuro, versione grafica e orologio della bacheca. */

import { useCallback, useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'
/** Le due versioni grafiche dell'interfaccia. */
export type Skin = 'seta' | 'neon'

export const SKINS: { id: Skin; swatch: [string, string, string] }[] = [
  { id: 'seta', swatch: ['#612B4F', '#A47864', '#E8946A'] },
  { id: 'neon', swatch: ['#6D28D9', '#DB2777', '#D97706'] },
]

const THEME_KEY = 'onda.theme'
const SKIN_KEY = 'onda.skin'

function readStored<T extends string>(key: string, allowed: readonly T[], fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const v = window.localStorage.getItem(key) as T | null
    return v && allowed.includes(v) ? v : fallback
  } catch {
    return fallback
  }
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = readStored<Theme>(THEME_KEY, ['light', 'dark'], 'light')
    try {
      if (!window.localStorage.getItem(THEME_KEY)) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      }
    } catch {
      // Nessuna preferenza leggibile: resta il valore predefinito.
    }
    return stored
  })

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    root.style.colorScheme = theme
    try {
      window.localStorage.setItem(THEME_KEY, theme)
    } catch {
      // Preferenza non persistibile: vale per la sessione.
    }
  }, [theme])

  const toggle = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), [])
  return { theme, setTheme, toggle }
}

export function useSkin() {
  const [skin, setSkin] = useState<Skin>(() => readStored<Skin>(SKIN_KEY, ['seta', 'neon'], 'seta'))

  useEffect(() => {
    document.documentElement.setAttribute('data-skin', skin)
    try {
      window.localStorage.setItem(SKIN_KEY, skin)
    } catch {
      // Preferenza non persistibile: vale per la sessione.
    }
  }, [skin])

  const toggle = useCallback(() => setSkin((s) => (s === 'seta' ? 'neon' : 'seta')), [])
  return { skin, setSkin, toggle }
}

/**
 * Orologio condiviso: la bacheca deve aggiornarsi da sola, senza ricaricare.
 * Si allinea al minuto, così i cambi di stato avvengono quando cambia l'ora.
 */
export function useNow(intervalMs = 20000): Date {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), intervalMs)
    return () => window.clearInterval(id)
  }, [intervalMs])
  return now
}

/**
 * Sfondo fotografico del salone.
 *
 * Se esiste `public/salone.jpg` viene usato come sfondo in vetrina e nel
 * gestionale; altrimenti resta la texture da studio disegnata in CSS. Basta
 * quindi aggiungere il file: non serve toccare il codice.
 */
export function usePhotoBackground(src = '/salone.jpg'): boolean {
  const [found, setFound] = useState(false)

  useEffect(() => {
    let cancelled = false
    const img = new Image()
    img.onload = () => {
      if (cancelled) return
      document.documentElement.style.setProperty('--photo-url', `url("${src}")`)
      setFound(true)
    }
    img.onerror = () => !cancelled && setFound(false)
    img.src = src
    return () => { cancelled = true }
  }, [src])

  return found
}
