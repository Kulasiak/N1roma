/** Agenda: vista giornaliera per operatore e vista settimanale. */

import { useMemo, useState } from 'react'
import { CalendarPlus, ChevronLeft, ChevronRight, Clock } from 'lucide-react'
import { useSalon } from '@/lib/store'
import { useI18n } from '@/lib/i18n'
import { useNow } from '@/lib/theme'
import { appointmentsOn, occupancyRate, occupiesTime, phaseOf } from '@/lib/selectors'
import { STATUS_ICON } from '@/lib/icons'
import type { Appointment } from '@/lib/types'
import {
  addDays, cn, dayKey, formatDateLong, formatDuration, formatTime, fullName,
  hhmmToMinutes, isToday, minutesToHhmm, money, pct, startOfDay, startOfWeek, weekdayShort,
} from '@/lib/utils'
import { AppointmentDialog, draftFromAppointment, makeDraft, type AppointmentDraft } from '@/components/AppointmentDialog'
import { Avatar, Badge, Button, Card, EmptyState, Segmented } from '@/components/ui'
import { PageHeader } from '@/components/Shell'

const PX_PER_MIN = 1.5

export function Agenda() {
  const { state, serviceById, clientById, quote } = useSalon()
  const { t } = useI18n()
  const now = useNow(30000)
  const [cursor, setCursor] = useState(() => startOfDay(new Date()))
  const [view, setView] = useState<'giorno' | 'settimana'>('giorno')
  const [draft, setDraft] = useState<AppointmentDraft | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const openMin = hhmmToMinutes(state.settings.openHour)
  const closeMin = hhmmToMinutes(state.settings.closeHour)
  const gridHeight = (closeMin - openMin) * PX_PER_MIN

  const workingStaff = useMemo(
    () => state.staff.filter((s) => s.active && s.workDays.includes(cursor.getDay())),
    [state.staff, cursor],
  )
  const dayAppointments = useMemo(() => appointmentsOn(state, cursor), [state, cursor])

  const hours = useMemo(() => {
    const out: number[] = []
    for (let m = Math.ceil(openMin / 60) * 60; m <= closeMin; m += 60) out.push(m)
    return out
  }, [openMin, closeMin])

  function openNew(prefill: Partial<AppointmentDraft> = {}) {
    setDraft(makeDraft({ dayKey: dayKey(cursor), ...prefill }))
    setDialogOpen(true)
  }

  return (
    <>
      <PageHeader
        title={t('nav.agenda')} description={formatDateLong(cursor)}
        actions={
          <>
            <Segmented value={view} onChange={setView} options={[
              { value: 'giorno', label: t('agenda.day') },
              { value: 'settimana', label: t('agenda.week') },
            ]} />
            <Button variant="accent" onClick={() => openNew()}>
              <CalendarPlus className="h-4 w-4" />
              {t('agenda.new')}
            </Button>
          </>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="border-line bg-surface flex items-center gap-1 rounded-xl border p-1">
          <Button variant="ghost" size="icon" aria-label={t('agenda.prev')}
            onClick={() => setCursor(addDays(cursor, view === 'giorno' ? -1 : -7))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="min-w-16" onClick={() => setCursor(startOfDay(new Date()))}>
            {t('common.today')}
          </Button>
          <Button variant="ghost" size="icon" aria-label={t('agenda.next')}
            onClick={() => setCursor(addDays(cursor, view === 'giorno' ? 1 : 7))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <input type="date" value={dayKey(cursor)}
          onChange={(e) => e.target.value && setCursor(startOfDay(new Date(e.target.value)))}
          className="border-line bg-surface hover:border-line-strong focus:border-brand h-10 rounded-xl border px-3 text-sm focus:outline-none" />

        {view === 'giorno' && (
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <Badge tone="brand">{t('agenda.appointments', { n: dayAppointments.filter(occupiesTime).length })}</Badge>
            <Badge tone="good">{t('agenda.occupancy', { value: pct(occupancyRate(state, cursor)) })}</Badge>
          </div>
        )}
      </div>

      {view === 'giorno' ? (
        workingStaff.length === 0 ? (
          <Card>
            <EmptyState icon={<Clock className="h-6 w-6" />}
              title={t('agenda.closedTitle')} description={t('agenda.closedDesc')} />
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="border-line bg-surface-2/50 sticky top-16 z-20 flex border-b">
              <div className="w-14 shrink-0" />
              <div className="flex flex-1 overflow-x-auto">
                {workingStaff.map((s) => {
                  const count = dayAppointments.filter((a) => a.staffId === s.id && occupiesTime(a)).length
                  return (
                    <div key={s.id} className="border-line min-w-[150px] flex-1 border-l px-3 py-3 first:border-l-0">
                      <div className="flex items-center gap-2">
                        <Avatar name={s.name} size="sm" color={s.color} />
                        <div className="min-w-0">
                          <p className="truncate text-[13px] leading-tight font-semibold">{s.name.split(' ')[0]}</p>
                          <p className="text-mute text-[10px]">{count} {t('agenda.apptShort')} · {s.startHour}–{s.endHour}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="flex">
              <div className="relative w-14 shrink-0" style={{ height: gridHeight }}>
                {hours.map((m) => (
                  <div key={m} className="text-mute absolute left-0 -translate-y-1/2 pl-3 text-[11px] font-semibold tabular-nums"
                    style={{ top: (m - openMin) * PX_PER_MIN }}>
                    {minutesToHhmm(m)}
                  </div>
                ))}
              </div>

              <div className="flex flex-1 overflow-x-auto">
                {workingStaff.map((staff) => {
                  const staffStart = hhmmToMinutes(staff.startHour)
                  const staffEnd = hhmmToMinutes(staff.endHour)
                  const items = dayAppointments.filter((a) => a.staffId === staff.id)

                  return (
                    <div key={staff.id}
                      className="border-line relative min-w-[150px] flex-1 border-l first:border-l-0"
                      style={{ height: gridHeight }}>
                      {hours.map((m) => (
                        <div key={m} className="border-line absolute inset-x-0 border-t border-dashed"
                          style={{ top: (m - openMin) * PX_PER_MIN }} aria-hidden="true" />
                      ))}

                      {staffStart > openMin && (
                        <div className="bg-surface-2/70 absolute inset-x-0 top-0"
                          style={{ height: (staffStart - openMin) * PX_PER_MIN }} aria-hidden="true" />
                      )}
                      {staffEnd < closeMin && (
                        <div className="bg-surface-2/70 absolute inset-x-0 bottom-0"
                          style={{ height: (closeMin - staffEnd) * PX_PER_MIN }} aria-hidden="true" />
                      )}

                      {isToday(cursor) && (() => {
                        const nowMin = now.getHours() * 60 + now.getMinutes()
                        if (nowMin < openMin || nowMin > closeMin) return null
                        return (
                          <div className="pointer-events-none absolute inset-x-0 z-10"
                            style={{ top: (nowMin - openMin) * PX_PER_MIN }}>
                            <div className="bg-accent relative h-0.5">
                              <span className="bg-accent absolute top-1/2 -left-1 h-2 w-2 -translate-y-1/2 rounded-full" />
                            </div>
                          </div>
                        )
                      })()}

                      <button type="button" className="absolute inset-0 h-full w-full cursor-copy"
                        aria-label={t('agenda.newWith', { name: staff.name })}
                        onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect()
                          const raw = openMin + (e.clientY - rect.top) / PX_PER_MIN
                          const snapped = Math.round(raw / 15) * 15
                          openNew({
                            staffId: staff.id,
                            time: minutesToHhmm(Math.max(openMin, Math.min(closeMin - 30, snapped))),
                          })
                        }} />

                      {items.map((apt) => {
                        const start = new Date(apt.start)
                        const startMin = start.getHours() * 60 + start.getMinutes()
                        const top = (startMin - openMin) * PX_PER_MIN
                        const height = Math.max(26, apt.durationMin * PX_PER_MIN - 3)
                        const client = clientById(apt.clientId)
                        const phase = phaseOf(apt, now, state.settings.alertMinutes)
                        const cancelled = apt.status === 'annullato' || apt.status === 'no_show'
                        const compact = height < 52
                        const StatusIcon = STATUS_ICON[apt.status]

                        return (
                          <button key={apt.id} type="button"
                            onClick={() => { setDraft(draftFromAppointment(apt)); setDialogOpen(true) }}
                            className={cn(
                              'absolute right-1 left-1 z-10 overflow-hidden rounded-lg border px-2 py-1 text-left',
                              'transition-all duration-200 hover:z-20 hover:shadow-[var(--shadow-lift)] focus-visible:z-20',
                              cancelled && 'opacity-55 saturate-50',
                              // Chi sta per arrivare pulsa anche qui, non solo in bacheca.
                              phase === 'imminente' && 'alert-ring z-20',
                            )}
                            style={{
                              top, height,
                              background: `color-mix(in srgb, ${staff.color} 16%, var(--surface))`,
                              borderColor: phase === 'imminente' ? undefined : 'transparent',
                              borderLeft: `3px solid ${staff.color}`,
                            }}>
                            <p className={cn('flex items-center gap-1 truncate text-[11px] leading-tight font-bold',
                              cancelled && 'line-through',
                              phase === 'imminente' && 'animate-blink')}>
                              <StatusIcon className="h-3 w-3 shrink-0" />
                              {formatTime(apt.start)} {client ? fullName(client) : '—'}
                            </p>
                            {!compact && (
                              <p className="text-soft mt-0.5 truncate text-[10px] leading-tight">
                                {apt.serviceIds.map((id) => serviceById(id)?.name).filter(Boolean).join(' + ')}
                              </p>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            </div>
          </Card>
        )
      ) : (
        <WeekView cursor={cursor}
          onPickDay={(d) => { setCursor(d); setView('giorno') }}
          onOpen={(apt) => { setDraft(draftFromAppointment(apt)); setDialogOpen(true) }} />
      )}

      {view === 'giorno' && dayAppointments.length > 0 && (
        <Card className="mt-5 p-5">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
            <div>
              <p className="text-mute text-[11px] font-semibold tracking-wide uppercase">{t('agenda.value')}</p>
              <p className="font-display mt-1 text-2xl font-semibold">
                {money(dayAppointments.filter(occupiesTime).reduce((a, x) => a + quote(x.serviceIds).price, 0))}
              </p>
            </div>
            <div>
              <p className="text-mute text-[11px] font-semibold tracking-wide uppercase">{t('agenda.bookedHours')}</p>
              <p className="font-display mt-1 text-2xl font-semibold">
                {formatDuration(dayAppointments.filter(occupiesTime).reduce((a, x) => a + x.durationMin, 0))}
              </p>
            </div>
          </div>
        </Card>
      )}

      <AppointmentDialog open={dialogOpen} draft={draft}
        onClose={() => { setDialogOpen(false); setDraft(null) }} />
    </>
  )
}

function WeekView({
  cursor, onPickDay, onOpen,
}: {
  cursor: Date
  onPickDay: (day: Date) => void
  onOpen: (apt: Appointment) => void
}) {
  const { state, clientById, staffById } = useSalon()
  const { t } = useI18n()
  const monday = startOfWeek(cursor)
  const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i))

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
      {days.map((day, i) => {
        const items = appointmentsOn(state, day)
        const closed = !state.settings.openDays.includes(day.getDay())
        return (
          <Card key={day.toISOString()} className={cn('stagger flex flex-col', closed && 'opacity-60')}
            style={{ ['--i' as string]: i }}>
            <button type="button" onClick={() => onPickDay(day)}
              className="border-line hover:bg-surface-2 flex items-center justify-between gap-2 rounded-t-[var(--radius-xl2)] border-b px-4 py-3 text-left transition-colors">
              <div>
                <p className="text-mute text-[11px] font-bold tracking-wide uppercase">{weekdayShort(day.getDay())}</p>
                <p className={cn('font-display text-xl leading-tight font-semibold', isToday(day) && 'text-brand')}>
                  {day.getDate()}
                </p>
              </div>
              {closed
                ? <span className="text-mute text-[10px] font-semibold">{t('agenda.closed')}</span>
                : <Badge tone={items.length > 0 ? 'brand' : 'neutral'}>{items.length}</Badge>}
            </button>

            <div className="flex-1 space-y-1.5 p-2">
              {items.length === 0 ? (
                <p className="text-mute px-2 py-4 text-center text-[11px]">
                  {closed ? '—' : t('agenda.noAppointments')}
                </p>
              ) : items.map((apt) => {
                const staff = staffById(apt.staffId)
                const client = clientById(apt.clientId)
                const cancelled = apt.status === 'annullato' || apt.status === 'no_show'
                return (
                  <button key={apt.id} type="button" onClick={() => onOpen(apt)}
                    className={cn('hover:bg-surface-2 w-full rounded-lg px-2 py-1.5 text-left transition-colors',
                      cancelled && 'opacity-55')}>
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: staff?.color }} aria-hidden="true" />
                      <span className="text-[11px] font-bold tabular-nums">{formatTime(apt.start)}</span>
                    </span>
                    <span className={cn('mt-0.5 block truncate text-[11px]', cancelled && 'line-through')}>
                      {client ? fullName(client) : '—'}
                    </span>
                  </button>
                )
              })}
            </div>
          </Card>
        )
      })}
    </div>
  )
}
