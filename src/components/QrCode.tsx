/**
 * QR code disegnato come SVG inline: la libreria calcola solo la matrice,
 * il disegno è nostro, così resta nitido a ogni dimensione.
 */

import { useMemo } from 'react'
import qrcode from 'qrcode-generator'
import { cn } from '@/lib/utils'

export function QrCode({
  value, size = 160, className, quietZone = 4, foreground = 'currentColor', title,
}: {
  value: string
  size?: number
  className?: string
  /** Margine in moduli: lo standard ne richiede almeno 4. */
  quietZone?: number
  foreground?: string
  title?: string
}) {
  const { path, dimension } = useMemo(() => {
    // Tipo 0 = versione automatica; correzione H = leggibile anche stampato piccolo.
    const qr = qrcode(0, 'H')
    qr.addData(value)
    qr.make()
    const count = qr.getModuleCount()
    let d = ''
    for (let row = 0; row < count; row++) {
      for (let col = 0; col < count; col++) {
        if (qr.isDark(row, col)) d += `M${col + quietZone} ${row + quietZone}h1v1h-1z`
      }
    }
    return { path: d, dimension: count + quietZone * 2 }
  }, [value, quietZone])

  return (
    <svg
      viewBox={`0 0 ${dimension} ${dimension}`} width={size} height={size}
      className={cn('shrink-0', className)} role="img" aria-label={title ?? value}
      shapeRendering="crispEdges"
    >
      {title && <title>{title}</title>}
      <path d={path} fill={foreground} />
    </svg>
  )
}
