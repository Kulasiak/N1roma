/**
 * Grafici disegnati a mano in SVG/CSS — nessuna libreria.
 *
 * Colore: le palette decorative delle due versioni grafiche non superano i test
 * di separazione per daltonismo se usate per codificare serie, quindi NON lo
 * fanno. I grafici di sola grandezza usano una tinta unica (il colore segue
 * l'entità, mai la posizione in classifica); dove servono categorie distinte si
 * usa CATEGORICAL, validato su tutte le coppie in tema chiaro e scuro — banda
 * di luminosità, croma, floor a visione normale e contrasto tutti superati,
 * separazione CVD ΔE 7.6, ammessa perché accompagnata sempre da legenda ed
 * etichette dirette.
 */

import { useMemo, useState } from 'react'
import { useI18n } from '@/lib/i18n'
import { cn, money } from '@/lib/utils'

export const CATEGORICAL = ['#A8478F', '#D2764B', '#0E9CA6', '#5B62D0'] as const

/* ------------------------------------------------------ area */

export function AreaChart({
  points, height = 200, formatValue = money,
}: {
  points: { label: string; value: number }[]
  height?: number
  formatValue?: (n: number) => string
}) {
  const [hover, setHover] = useState<number | null>(null)
  const W = 720, H = height, padY = 18, padX = 6

  const { path, area, coords } = useMemo(() => {
    const max = Math.max(1, ...points.map((p) => p.value))
    const nice = Math.ceil(max / 50) * 50 || 50
    const stepX = points.length > 1 ? (W - padX * 2) / (points.length - 1) : 0
    const pts = points.map((p, i) => ({
      x: padX + i * stepX,
      y: padY + (1 - p.value / nice) * (H - padY * 2),
    }))
    let d = ''
    pts.forEach((p, i) => {
      if (i === 0) d += `M ${p.x} ${p.y}`
      else {
        const prev = pts[i - 1]
        const cx = (prev.x + p.x) / 2
        d += ` C ${cx} ${prev.y} ${cx} ${p.y} ${p.x} ${p.y}`
      }
    })
    return {
      path: d,
      area: `${d} L ${pts[pts.length - 1]?.x ?? 0} ${H} L ${pts[0]?.x ?? 0} ${H} Z`,
      coords: pts,
    }
  }, [points, H])

  if (points.length === 0) return null
  const active = hover !== null ? points[hover] : null

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }}
        preserveAspectRatio="none" role="img" aria-label="grafico"
        onMouseLeave={() => setHover(null)}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          const idx = Math.round(((e.clientX - rect.left) / rect.width) * (points.length - 1))
          setHover(Math.max(0, Math.min(points.length - 1, idx)))
        }}
      >
        <defs>
          <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.34" />
            <stop offset="100%" stopColor="var(--brand)" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1={0} x2={W} y1={padY + f * (H - padY * 2)} y2={padY + f * (H - padY * 2)}
            stroke="var(--line)" strokeWidth="1" strokeDasharray="3 5" />
        ))}

        <path d={area} fill="url(#areaFill)" />
        <path d={path} fill="none" stroke="var(--brand)" strokeWidth="2"
          strokeLinecap="round" vectorEffect="non-scaling-stroke" />

        {active && hover !== null && (
          <line x1={coords[hover].x} x2={coords[hover].x} y1={padY - 6} y2={H}
            stroke="var(--accent)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        )}
        {coords.map((c, i) => (
          <circle key={i} cx={c.x} cy={c.y} r={hover === i ? 5 : 0}
            fill="var(--brand)" stroke="var(--surface)" strokeWidth="2" />
        ))}
      </svg>

      {active && hover !== null && (
        <div
          className="bg-surface border-line pointer-events-none absolute top-0 z-10 -translate-x-1/2 rounded-xl border px-3 py-2 shadow-[var(--shadow-lift)]"
          style={{ left: `${(hover / Math.max(1, points.length - 1)) * 100}%` }}
        >
          <p className="text-mute text-[11px] font-medium whitespace-nowrap">{active.label}</p>
          <p className="text-sm font-bold whitespace-nowrap">{formatValue(active.value)}</p>
        </div>
      )}

      <div className="text-mute mt-2 flex justify-between text-[11px] font-medium">
        <span>{points[0]?.label}</span>
        <span>{points[points.length - 1]?.label}</span>
      </div>
    </div>
  )
}

/* ------------------------------------------------ barre orizzontali */

export interface BarItem {
  id: string
  label: string
  value: number
  hint?: string
  /** Pastiglia identitaria accanto all'etichetta: non codifica il valore. */
  dot?: string
}

export function HBars({
  items, formatValue = money, color,
}: {
  items: BarItem[]
  formatValue?: (n: number) => string
  color?: string
}) {
  const { t } = useI18n()
  const max = Math.max(1, ...items.map((i) => i.value))

  if (items.length === 0) {
    return <p className="text-mute py-8 text-center text-sm">{t('common.noData')}</p>
  }

  return (
    <ul className="space-y-3.5">
      {items.map((item, i) => (
        <li key={item.id} className="stagger" style={{ ['--i' as string]: i }}>
          <div className="mb-1.5 flex items-baseline justify-between gap-3">
            <span className="flex min-w-0 items-center gap-2 text-[13px] font-semibold">
              {item.dot && (
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: item.dot }} aria-hidden="true" />
              )}
              <span className="truncate">{item.label}</span>
            </span>
            <span className="text-soft shrink-0 text-[13px] font-bold tabular-nums">
              {formatValue(item.value)}
            </span>
          </div>
          <div className="bg-surface-2 h-2 overflow-hidden rounded-full">
            <div
              className={cn('h-full rounded-full transition-[width] duration-700', !color && 'bg-grad-brand')}
              style={{ width: `${(item.value / max) * 100}%`, background: color }}
            />
          </div>
          {item.hint && <p className="text-mute mt-1 text-[11px]">{item.hint}</p>}
        </li>
      ))}
    </ul>
  )
}

/* -------------------------------------------------------------- donut */

export function Donut({
  segments, size = 168, centerLabel,
}: {
  segments: { label: string; value: number }[]
  size?: number
  centerLabel?: string
}) {
  const { t } = useI18n()
  const [hover, setHover] = useState<number | null>(null)
  const total = segments.reduce((a, s) => a + s.value, 0)
  const R = 60, C = 2 * Math.PI * R, GAP = 2.5

  if (total <= 0) {
    return (
      <div className="text-mute grid place-items-center py-10 text-sm" style={{ height: size }}>
        {t('cash.emptyTitle')}
      </div>
    )
  }

  let offset = 0

  return (
    <div className="flex flex-wrap items-center justify-center gap-6">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90">
          {segments.map((seg, i) => {
            const frac = seg.value / total
            const len = Math.max(0, frac * C - GAP)
            const el = (
              <circle
                key={seg.label} cx="80" cy="80" r={R} fill="none"
                stroke={CATEGORICAL[i % CATEGORICAL.length]}
                strokeWidth={hover === i ? 24 : 19}
                strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-offset}
                className="cursor-pointer transition-[stroke-width] duration-200"
                onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
              />
            )
            offset += frac * C
            return el
          })}
        </svg>

        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
          {hover !== null ? (
            <div>
              <p className="text-mute text-[11px] font-medium">{segments[hover].label}</p>
              <p className="text-base font-bold">{money(segments[hover].value)}</p>
              <p className="text-mute text-[11px]">{Math.round((segments[hover].value / total) * 100)}%</p>
            </div>
          ) : (
            <div>
              <p className="text-mute text-[11px] font-medium">{centerLabel ?? t('book.summaryTotal')}</p>
              <p className="text-lg font-bold">{money(total)}</p>
            </div>
          )}
        </div>
      </div>

      {/* La legenda è sempre presente: l'identità non è mai solo colore. */}
      <ul className="min-w-[9rem] space-y-2">
        {segments.map((seg, i) => (
          <li key={seg.label}
            className={cn('flex items-center gap-2.5 text-[13px] transition-opacity',
              hover !== null && hover !== i && 'opacity-45')}
            onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
            <span className="h-2.5 w-2.5 shrink-0 rounded-[3px]"
              style={{ background: CATEGORICAL[i % CATEGORICAL.length] }} aria-hidden="true" />
            <span className="text-soft flex-1 font-medium">{seg.label}</span>
            <span className="font-bold tabular-nums">{money(seg.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ---------------------------------------------------------- sparkline */

export function Sparkline({ values, className }: { values: number[]; className?: string }) {
  if (values.length < 2) return null
  const max = Math.max(...values), min = Math.min(...values)
  const span = max - min || 1
  const d = values.map((v, i) => {
    const x = (i / (values.length - 1)) * 100
    const y = 24 - ((v - min) / span) * 22
    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`
  }).join(' ')

  return (
    <svg viewBox="0 0 100 26" className={cn('w-full', className)} preserveAspectRatio="none">
      <path d={d} fill="none" stroke="var(--brand)" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}
