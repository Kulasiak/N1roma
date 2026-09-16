/** Statistiche: andamento economico, classifiche, rendimento del team. */

import { useMemo, useState } from 'react'
import { Euro, Receipt, TrendingUp, UserPlus } from 'lucide-react'
import { useSalon } from '@/lib/store'
import { useI18n } from '@/lib/i18n'
import {
  newClientsBetween, occupiesTime, revenueBetween, revenueSeries, staffPerformance, topServices,
} from '@/lib/selectors'
import { PAYMENT_METHODS } from '@/lib/types'
import { addDays, formatDateShort, money, moneyShort, pct, startOfDay, sum, trendPct } from '@/lib/utils'
import { AreaChart, Donut, HBars } from '@/components/charts'
import { StatCard } from '@/components/StatCard'
import { Card, CardHeader, Progress, Segmented } from '@/components/ui'
import { PageHeader } from '@/components/Shell'

type Period = 7 | 30 | 90

export function Statistiche() {
  const { state } = useSalon()
  const { t } = useI18n()
  const [period, setPeriod] = useState<Period>(30)

  const today = startOfDay(new Date())
  const from = addDays(today, -(period - 1))
  const to = addDays(today, 1)
  const prevFrom = addDays(from, -period)

  const data = useMemo(() => {
    const revenue = revenueBetween(state, from, to)
    const prevRevenue = revenueBetween(state, prevFrom, from)
    const inRange = (iso: string, a: Date, b: Date) => {
      const ts = new Date(iso).getTime()
      return ts >= a.getTime() && ts < b.getTime()
    }
    const sales = state.sales.filter((s) => inRange(s.createdAt, from, to))
    const prevSales = state.sales.filter((s) => inRange(s.createdAt, prevFrom, from))
    const appointments = state.appointments.filter((a) => inRange(a.start, from, to))

    const servicesRevenue = sum(sales.flatMap((s) => s.items.filter((i) => i.kind === 'servizio')), (i) => i.unitPrice * i.qty)
    const productsRevenue = sum(sales.flatMap((s) => s.items.filter((i) => i.kind === 'prodotto')), (i) => i.unitPrice * i.qty)

    return {
      revenue, revenueTrend: trendPct(revenue, prevRevenue),
      sales, salesTrend: trendPct(sales.length, prevSales.length),
      avgTicket: sales.length ? revenue / sales.length : 0,
      prevAvgTicket: prevSales.length ? prevSales.reduce((a, s) => a + s.total, 0) / prevSales.length : 0,
      newClients: newClientsBetween(state, from, to),
      newClientsTrend: trendPct(newClientsBetween(state, from, to), newClientsBetween(state, prevFrom, from)),
      series: revenueSeries(state, period),
      appointments: appointments.filter(occupiesTime).length,
      completed: appointments.filter((a) => a.status === 'completato').length,
      cancelled: appointments.filter((a) => a.status === 'annullato').length,
      noShow: appointments.filter((a) => a.status === 'no_show').length,
      servicesRevenue, productsRevenue,
      byMethod: PAYMENT_METHODS
        .map((m) => ({ label: t(`pay.${m}` as never), value: sum(sales.filter((s) => s.method === m), (s) => s.total) }))
        .filter((s) => s.value > 0),
    }
  }, [state, period, from, to, prevFrom, t])

  const services = useMemo(() => topServices(state, from, to, 8).map((s) => ({
    id: s.id, label: s.name, value: s.revenue,
    hint: t('stats.prestations', { n: s.count, avg: money(s.revenue / Math.max(1, s.count)) }),
  })), [state, from, to, t])

  const team = useMemo(() => staffPerformance(state, from, to).map((p) => ({
    id: p.staff.id, label: p.staff.name, value: p.revenue, dot: p.staff.color,
    hint: t('stats.teamHint', { n: p.appointments, avg: money(p.avgTicket) }),
  })), [state, from, to, t])

  const outcomes = data.completed + data.cancelled + data.noShow
  const totalRev = data.servicesRevenue + data.productsRevenue || 1

  return (
    <>
      <PageHeader title={t('nav.stats')} description={t('stats.range', { from: formatDateShort(from) })}
        actions={
          <Segmented value={String(period)} onChange={(v) => setPeriod(Number(v) as Period)} options={[
            { value: '7', label: t('stats.days7') },
            { value: '30', label: t('stats.days30') },
            { value: '90', label: t('stats.days90') },
          ]} />
        } />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard index={0} label={t('stats.kpiRevenue')} value={money(data.revenue)}
          icon={<Euro className="h-4 w-4" />} trend={data.revenueTrend} trendLabel={t('stats.vsPrev')}
          spark={data.series.map((p) => p.value)} />
        <StatCard index={1} label={t('stats.kpiReceipts')} value={String(data.sales.length)}
          icon={<Receipt className="h-4 w-4" />} trend={data.salesTrend} trendLabel={t('stats.vsPrev')} />
        <StatCard index={2} label={t('stats.kpiAvg')} value={money(data.avgTicket)}
          icon={<TrendingUp className="h-4 w-4" />} trend={trendPct(data.avgTicket, data.prevAvgTicket)}
          trendLabel={t('stats.vsPrev')} />
        <StatCard index={3} label={t('stats.kpiNew')} value={String(data.newClients)}
          icon={<UserPlus className="h-4 w-4" />} trend={data.newClientsTrend} trendLabel={t('stats.vsPrev')} />
      </div>

      <Card className="mt-5">
        <CardHeader title={t('stats.trendTitle')}
          subtitle={t('stats.dailyAvg', { value: moneyShort(data.revenue / period) })} />
        <div className="p-5 pt-4">
          <AreaChart height={260}
            points={data.series.map((p) => ({ label: formatDateShort(p.day), value: p.value }))} />
        </div>
      </Card>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title={t('stats.servicesTitle')} subtitle={t('stats.servicesSub')} />
          <div className="p-5 pt-4"><HBars items={services} /></div>
        </Card>
        <Card>
          <CardHeader title={t('stats.teamTitle')} subtitle={t('stats.teamSub')} />
          <div className="p-5 pt-4"><HBars items={team} /></div>
        </Card>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card>
          <CardHeader title={t('cash.paymentsTitle')} subtitle={t('stats.paymentsSub')} />
          <div className="p-5 pt-4"><Donut segments={data.byMethod} centerLabel={t('stats.period')} /></div>
        </Card>

        <Card>
          <CardHeader title={t('stats.mixTitle')} subtitle={t('stats.mixSub')} />
          <div className="space-y-4 p-5 pt-4">
            {[
              { label: t('stats.servicesLabel'), value: data.servicesRevenue },
              { label: t('stats.retailLabel'), value: data.productsRevenue },
            ].map((row) => (
              <div key={row.label}>
                <div className="mb-1.5 flex items-baseline justify-between">
                  <span className="text-[13px] font-semibold">{row.label}</span>
                  <span className="text-[13px] font-bold tabular-nums">{money(row.value)}</span>
                </div>
                <Progress value={(row.value / totalRev) * 100} />
                <p className="text-mute mt-1 text-[11px]">
                  {t('stats.ofRevenue', { pct: pct((row.value / totalRev) * 100) })}
                </p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title={t('stats.outcomesTitle')} subtitle={t('stats.outcomesSub')} />
          <div className="space-y-4 p-5 pt-4">
            {[
              { label: t('status.completato'), value: data.completed, color: 'var(--good)' },
              { label: t('status.annullato'), value: data.cancelled, color: 'var(--mute)' },
              { label: t('status.no_show'), value: data.noShow, color: 'var(--warn)' },
            ].map((row) => (
              <div key={row.label}>
                <div className="mb-1.5 flex items-baseline justify-between">
                  <span className="text-[13px] font-semibold">{row.label}</span>
                  <span className="text-[13px] font-bold tabular-nums">
                    {row.value}
                    <span className="text-mute ml-1.5 font-medium">
                      {pct(outcomes ? (row.value / outcomes) * 100 : 0)}
                    </span>
                  </span>
                </div>
                <Progress value={outcomes ? (row.value / outcomes) * 100 : 0} color={row.color} />
              </div>
            ))}
            <div className="border-line border-t pt-4">
              <p className="text-mute text-[11px] font-bold tracking-wide uppercase">{t('stats.inPeriod')}</p>
              <p className="font-display mt-1 text-2xl font-semibold">{data.appointments}</p>
            </div>
          </div>
        </Card>
      </div>
    </>
  )
}
