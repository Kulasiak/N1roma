/** Riquadro KPI con variazione rispetto al periodo precedente. */

import type { ReactNode } from 'react'
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Sparkline } from './charts'

export function StatCard({
  label, value, icon, trend, trendLabel, spark, index = 0,
}: {
  label: string
  value: string
  icon?: ReactNode
  /** Variazione percentuale; `null` quando non è confrontabile. */
  trend?: number | null
  trendLabel?: string
  spark?: number[]
  index?: number
}) {
  const up = trend != null && trend > 0.5
  const down = trend != null && trend < -0.5

  return (
    <div className="surface-card stagger p-5" style={{ ['--i' as string]: index }}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-mute text-[12px] font-semibold tracking-wide">{label}</p>
        {icon && (
          <span className="bg-brand-soft text-brand grid h-8 w-8 shrink-0 place-items-center rounded-xl">
            {icon}
          </span>
        )}
      </div>

      <p className="font-display mt-3 text-3xl leading-none font-semibold tabular-nums">{value}</p>

      <div className="mt-3 flex items-center justify-between gap-3">
        {trend !== undefined && (
          <span className={cn('inline-flex items-center gap-1 text-[12px] font-bold',
            up && 'text-good', down && 'text-warn', !up && !down && 'text-mute')}>
            {trend == null ? <Minus className="h-3.5 w-3.5" />
              : up ? <ArrowUpRight className="h-3.5 w-3.5" />
              : down ? <ArrowDownRight className="h-3.5 w-3.5" />
              : <Minus className="h-3.5 w-3.5" />}
            {trend == null ? '—' : `${Math.abs(trend).toFixed(0)}%`}
            {trendLabel && <span className="text-mute font-medium">{trendLabel}</span>}
          </span>
        )}
        {spark && spark.length > 1 && <div className="w-20 opacity-70"><Sparkline values={spark} /></div>}
      </div>
    </div>
  )
}
