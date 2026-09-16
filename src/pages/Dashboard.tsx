/** Panoramica: KPI del giorno, andamento, agenda imminente, allerte. */

import { useMemo } from 'react'
import {
  ArrowRight, Cake, Euro, Gauge, MonitorPlay, Package, TriangleAlert, UserPlus,
} from 'lucide-react'
import { useSalon } from '@/lib/store'
import { useI18n } from '@/lib/i18n'
import {
  appointmentsOn, clientsAtRisk, lowStockProducts, newClientsBetween, occupancyRate,
  occupiesTime, revenueOn, revenueSeries, topServices, upcomingAppointments, upcomingBirthdays,
} from '@/lib/selectors'
import {
  addDays, formatDateShort, formatTime, fullName, money, moneyShort, pct, relativeDay, startOfDay, trendPct,
} from '@/lib/utils'
import { AreaChart, HBars } from '@/components/charts'
import { StatCard } from '@/components/StatCard'
import { WhatsAppButton } from '@/components/WhatsAppButton'
import { Avatar, Badge, Button, Card, CardHeader, EmptyState } from '@/components/ui'
import { PageHeader, type PageId } from '@/components/Shell'

export function Dashboard({ onNavigate }: { onNavigate: (page: PageId) => void }) {
  const { state, serviceById, staffById, clientById } = useSalon()
  const { t } = useI18n()
  const today = startOfDay(new Date())

  const stats = useMemo(() => {
    const revToday = revenueOn(state, today)
    const revYesterday = revenueOn(state, addDays(today, -1))
    const todayAppts = appointmentsOn(state, today).filter(occupiesTime)
    const yAppts = appointmentsOn(state, addDays(today, -1)).filter(occupiesTime)
    const occToday = occupancyRate(state, today)
    const occY = occupancyRate(state, addDays(today, -1))
    const newLast30 = newClientsBetween(state, addDays(today, -30), addDays(today, 1))
    const newPrev30 = newClientsBetween(state, addDays(today, -60), addDays(today, -30))
    const series = revenueSeries(state, 14)
    return {
      revToday, revTrend: trendPct(revToday, revYesterday),
      todayCount: todayAppts.length, apptTrend: trendPct(todayAppts.length, yAppts.length),
      occToday, occTrend: trendPct(occToday, occY),
      newLast30, newTrend: trendPct(newLast30, newPrev30),
      series, spark: series.map((p) => p.value),
    }
  }, [state, today])

  const upcoming = useMemo(() => upcomingAppointments(state, 6), [state])
  const lowStock = useMemo(() => lowStockProducts(state), [state])
  const birthdays = useMemo(() => upcomingBirthdays(state, 21).slice(0, 4), [state])
  const atRisk = useMemo(() => clientsAtRisk(state, 90).slice(0, 4), [state])

  const services = useMemo(
    () => topServices(state, addDays(today, -30), addDays(today, 1), 5).map((s) => ({
      id: s.id, label: s.name, value: s.revenue,
      hint: t('stats.prestations', { n: s.count, avg: money(s.revenue / Math.max(1, s.count)) }),
    })),
    [state, today, t],
  )

  const greeting = (() => {
    const h = new Date().getHours()
    return h < 12 ? t('dash.morning') : h < 18 ? t('dash.afternoon') : t('dash.evening')
  })()

  return (
    <>
      <PageHeader
        title={`${greeting}, ${state.staff[0]?.name.split(' ')[0] ?? ''}`}
        description={t('dash.subtitle', { salon: state.settings.name, date: formatDateShort(today) })}
        actions={
          <Button variant="accent" onClick={() => onNavigate('bacheca')}>
            <MonitorPlay className="h-4 w-4" />
            {t('dash.openBoard')}
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard index={0} label={t('dash.kpiRevenue')} value={money(stats.revToday)}
          icon={<Euro className="h-4 w-4" />} trend={stats.revTrend}
          trendLabel={t('dash.vsYesterday')} spark={stats.spark} />
        <StatCard index={1} label={t('dash.kpiAppointments')} value={String(stats.todayCount)}
          icon={<MonitorPlay className="h-4 w-4" />} trend={stats.apptTrend} trendLabel={t('dash.vsYesterday')} />
        <StatCard index={2} label={t('dash.kpiOccupancy')} value={pct(stats.occToday)}
          icon={<Gauge className="h-4 w-4" />} trend={stats.occTrend} trendLabel={t('dash.vsYesterday')} />
        <StatCard index={3} label={t('dash.kpiNewClients')} value={String(stats.newLast30)}
          icon={<UserPlus className="h-4 w-4" />} trend={stats.newTrend} trendLabel={t('dash.vsPrev30')} />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader
            title={t('dash.revenueTitle')}
            subtitle={t('dash.revenueSub', { total: moneyShort(stats.series.reduce((a, p) => a + p.value, 0)) })}
            action={
              <Button variant="ghost" size="sm" onClick={() => onNavigate('statistiche')}>
                {t('dash.details')}
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            }
          />
          <div className="p-5 pt-4">
            <AreaChart points={stats.series.map((p) => ({ label: formatDateShort(p.day), value: p.value }))} />
          </div>
        </Card>

        <Card>
          <CardHeader title={t('dash.upcomingTitle')} subtitle={t('dash.upcomingSub')}
            action={<Button variant="ghost" size="sm" onClick={() => onNavigate('agenda')}>{t('common.all')}</Button>} />
          {upcoming.length === 0 ? (
            <EmptyState icon={<MonitorPlay className="h-6 w-6" />}
              title={t('dash.emptyAgenda')} description={t('dash.emptyAgendaDesc')} />
          ) : (
            <ul className="divide-line divide-y p-2">
              {upcoming.map((apt, i) => {
                const client = clientById(apt.clientId)
                const staff = staffById(apt.staffId)
                const first = serviceById(apt.serviceIds[0])
                return (
                  <li key={apt.id} className="stagger hover:bg-surface-2 flex items-center gap-3 rounded-xl p-3 transition-colors"
                    style={{ ['--i' as string]: i }}>
                    <div className="w-14 shrink-0 text-center">
                      <p className="text-sm leading-tight font-bold tabular-nums">{formatTime(apt.start)}</p>
                      <p className="text-mute text-[10px] capitalize">{relativeDay(apt.start)}</p>
                    </div>
                    <span className="h-9 w-1 shrink-0 rounded-full" style={{ background: staff?.color }} aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold">
                        {client ? fullName(client) : t('dash.deletedClient')}
                      </p>
                      <p className="text-mute truncate text-[11px]">
                        {first?.name}{apt.serviceIds.length > 1 && ` +${apt.serviceIds.length - 1}`} · {staff?.name.split(' ')[0]}
                      </p>
                    </div>
                    <Badge tone={apt.source === 'online' ? 'accent' : 'neutral'}>
                      {apt.source === 'online' ? t('dash.online') : t('dash.inSalon')}
                    </Badge>
                  </li>
                )
              })}
            </ul>
          )}
        </Card>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader title={t('dash.topServices')} subtitle={t('dash.last30')} />
          <div className="p-5 pt-4"><HBars items={services} /></div>
        </Card>

        <Card>
          <CardHeader title={t('dash.lowStock')} subtitle={t('dash.lowStockSub', { count: lowStock.length })}
            action={<Button variant="ghost" size="sm" onClick={() => onNavigate('magazzino')}>{t('nav.inventory')}</Button>} />
          {lowStock.length === 0 ? (
            <EmptyState icon={<Package className="h-6 w-6" />}
              title={t('dash.stockOk')} description={t('dash.stockOkDesc')} />
          ) : (
            <ul className="space-y-2 p-4">
              {lowStock.slice(0, 5).map((p, i) => (
                <li key={p.id} className="stagger bg-surface-2 flex items-center gap-3 rounded-xl p-3"
                  style={{ ['--i' as string]: i }}>
                  <span className="text-warn bg-warn/15 grid h-8 w-8 shrink-0 place-items-center rounded-lg">
                    <TriangleAlert className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold">{p.name}</p>
                    <p className="text-mute text-[11px]">{p.brand}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold tabular-nums">{p.stock}</p>
                    <p className="text-mute text-[10px]">min {p.minStock}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader title={t('dash.contactTitle')} subtitle={t('dash.contactSub')} />
          <div className="space-y-4 p-5 pt-4">
            <div>
              <p className="text-mute mb-2 flex items-center gap-1.5 text-[11px] font-bold tracking-wide uppercase">
                <Cake className="h-3.5 w-3.5" />
                {t('dash.birthdays')}
              </p>
              {birthdays.length === 0 ? (
                <p className="text-mute text-[13px]">{t('dash.noBirthdays')}</p>
              ) : (
                <ul className="space-y-2">
                  {birthdays.map(({ client, inDays }) => (
                    <li key={client.id} className="flex items-center gap-2.5">
                      <Avatar name={fullName(client)} size="xs" />
                      <span className="flex-1 truncate text-[13px] font-medium">{fullName(client)}</span>
                      <span className="text-mute text-[11px]">
                        {inDays === 0 ? t('dash.birthdayToday') : t('dash.birthdayIn', { n: inDays })}
                      </span>
                      <WhatsAppButton phone={client.phone} iconOnly variant="ghost" label={t('wa.birthday')}
                        message={t('wa.msgBirthday', { name: client.firstName, salon: state.settings.name })} />
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="border-line border-t pt-4">
              <p className="text-mute mb-2 text-[11px] font-bold tracking-wide uppercase">{t('dash.atRisk')}</p>
              {atRisk.length === 0 ? (
                <p className="text-mute text-[13px]">{t('dash.allActive')}</p>
              ) : (
                <ul className="space-y-2">
                  {atRisk.map(({ client, stats: s }) => (
                    <li key={client.id} className="flex items-center gap-2.5">
                      <Avatar name={fullName(client)} size="xs" />
                      <span className="flex-1 truncate text-[13px] font-medium">{fullName(client)}</span>
                      <span className="text-mute text-[11px]">
                        {s.lastVisit ? formatDateShort(s.lastVisit) : '—'}
                      </span>
                      <WhatsAppButton phone={client.phone} iconOnly variant="ghost" label={t('wa.winBack')}
                        message={t('wa.msgWinBack', {
                          name: client.firstName, salon: state.settings.name, points: client.points,
                        })} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </Card>
      </div>
    </>
  )
}
