/**
 * Bacheca del personale: tutti gli appuntamenti di oggi sempre a vista.
 * Chi sta per arrivare lampeggia, col nome scritto grande.
 * Pensata per un tablet appoggiato in salone: si aggiorna da sola.
 */

import { useMemo, useState } from 'react'
import { Armchair, CircleCheck, Clock, Hourglass, Maximize, Minimize, Sparkles } from 'lucide-react'
import { useSalon } from '@/lib/store'
import { useI18n } from '@/lib/i18n'
import { useNow } from '@/lib/theme'
import { boardRows, revenueOn, type BoardRow } from '@/lib/selectors'
import { CATEGORY_ICON } from '@/lib/icons'
import { cn, formatTime, fullName, money, relativeMinutes } from '@/lib/utils'
import { Avatar, Badge, Button, Card, EmptyState } from '@/components/ui'
import { PageHeader } from '@/components/Shell'

export function Bacheca() {
  const { state, dispatch, clientById, staffById, serviceById } = useSalon()
  const { t } = useI18n()
  const now = useNow(15000)
  const [zoom, setZoom] = useState(false)

  const rows = useMemo(() => boardRows(state, now), [state, now])

  const inChair = rows.filter((r) => r.phase === 'ora')
  const soon = rows.filter((r) => r.phase === 'imminente')
  const later = rows.filter((r) => r.phase === 'attesa')
  const done = rows.filter((r) => r.phase === 'concluso')

  function toggleZoom() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => setZoom(true))
    else document.exitFullscreen?.().catch(() => setZoom(false))
    setZoom((z) => !z)
  }

  const clock = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })

  /** Una riga della bacheca. `big` è la versione in evidenza. */
  function Row({ row, big = false }: { row: BoardRow; big?: boolean }) {
    const { appointment: apt, phase, minutesAway } = row
    const client = clientById(apt.clientId)
    const staff = staffById(apt.staffId)
    const services = apt.serviceIds.map((id) => serviceById(id)).filter(Boolean)
    const first = services[0]
    const Icon = first ? CATEGORY_ICON[first.category] : Sparkles
    const end = new Date(new Date(apt.start).getTime() + apt.durationMin * 60000)
    const alert = phase === 'imminente'

    return (
      <div
        className={cn(
          'surface-card relative overflow-hidden transition-all duration-300',
          big ? 'p-5' : 'p-4',
          // L'appuntamento imminente pulsa e resta bordato d'accento anche a
          // animazioni disattivate: l'informazione non dipende dal movimento.
          alert && 'alert-ring',
          phase === 'concluso' && 'opacity-55',
        )}
      >
        {/* Barra identitaria dell'operatore */}
        <span
          className="absolute inset-y-0 left-0 w-1.5"
          style={{ background: staff?.color }}
          aria-hidden="true"
        />

        <div className="flex items-center gap-4 pl-3">
          <div className="shrink-0 text-center">
            <p className={cn('font-bold tabular-nums leading-none', big ? 'text-4xl' : 'text-2xl')}>
              {formatTime(apt.start)}
            </p>
            <p className="text-mute mt-1 text-[11px]">{t('board.endsAt', { time: formatTime(end) })}</p>
          </div>

          <div className="min-w-0 flex-1">
            <p className={cn(
              'font-display truncate font-semibold leading-tight',
              big ? 'text-3xl sm:text-4xl' : 'text-lg',
              alert && 'animate-blink',
            )}>
              {client ? fullName(client) : '—'}
            </p>
            <p className={cn('text-soft mt-1 flex items-center gap-2 truncate', big ? 'text-base' : 'text-[13px]')}>
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{services.map((s) => s!.name).join(' + ')}</span>
            </p>
          </div>

          <div className="hidden shrink-0 items-center gap-2.5 sm:flex">
            <Avatar name={staff?.name ?? '—'} color={staff?.color} size={big ? 'md' : 'sm'} />
            <div className="text-right">
              <p className={cn('font-semibold leading-tight', big ? 'text-sm' : 'text-[12px]')}>
                {staff?.name.split(' ')[0]}
              </p>
              <p className="text-mute text-[11px]">
                {phase === 'ora'
                  ? t('board.remaining', { n: Math.max(0, Math.round((end.getTime() - now.getTime()) / 60000)) })
                  : phase === 'concluso'
                    ? t('board.done')
                    : minutesAway >= 0
                      ? t('board.arriving', { when: relativeMinutes(new Date(apt.start), now) })
                      : t('board.started', { when: relativeMinutes(new Date(apt.start), now) })}
              </p>
            </div>
          </div>

          {/* Azioni rapide: la bacheca si usa, non solo si guarda. */}
          {phase !== 'concluso' && (
            <div className="flex shrink-0 gap-2">
              {phase !== 'ora' ? (
                <Button
                  variant="secondary" size={big ? 'md' : 'sm'}
                  onClick={() => dispatch({ type: 'appointment/status', payload: { id: apt.id, status: 'in_corso' } })}
                >
                  <Armchair className="h-4 w-4" />
                  <span className="hidden sm:inline">{t('board.start')}</span>
                </Button>
              ) : (
                <Button
                  variant="primary" size={big ? 'md' : 'sm'}
                  onClick={() => dispatch({ type: 'appointment/status', payload: { id: apt.id, status: 'completato' } })}
                >
                  <CircleCheck className="h-4 w-4" />
                  <span className="hidden sm:inline">{t('board.complete')}</span>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  function Zone({
    icon: Icon, title, count, rows: zoneRows, empty, big = false, tone,
  }: {
    icon: typeof Armchair
    title: string
    count: string
    rows: BoardRow[]
    empty: string
    big?: boolean
    tone: 'accent' | 'brand' | 'mute'
  }) {
    return (
      <section>
        <header className="mb-3 flex items-center gap-2.5">
          <span className={cn(
            'grid h-9 w-9 place-items-center rounded-xl',
            tone === 'accent' && 'bg-accent/15 text-accent',
            tone === 'brand' && 'bg-brand-soft text-brand',
            tone === 'mute' && 'bg-surface-2 text-mute',
          )}>
            <Icon className="h-4.5 w-4.5" />
          </span>
          <h2 className="font-display text-xl font-semibold">{title}</h2>
          <Badge tone={tone === 'mute' ? 'neutral' : tone}>{count}</Badge>
        </header>

        {zoneRows.length === 0 ? (
          <p className="text-mute border-line rounded-xl border border-dashed px-4 py-6 text-center text-sm">
            {empty}
          </p>
        ) : (
          <div className="space-y-3">
            {zoneRows.map((row, i) => (
              <div key={row.appointment.id} className="stagger" style={{ ['--i' as string]: Math.min(i, 8) }}>
                <Row row={row} big={big} />
              </div>
            ))}
          </div>
        )}
      </section>
    )
  }

  return (
    <>
      <PageHeader
        title={t('board.title')}
        description={t('board.subtitle')}
        actions={
          <>
            <div className="border-line bg-surface flex items-center gap-2.5 rounded-xl border px-4 py-2">
              <Clock className="text-mute h-4 w-4" />
              <span className="font-display text-2xl leading-none font-semibold tabular-nums">{clock}</span>
            </div>
            <Button variant="secondary" onClick={toggleZoom}>
              {zoom ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              <span className="hidden sm:inline">
                {zoom ? t('board.exitFullscreen') : t('board.fullscreen')}
              </span>
            </Button>
          </>
        }
      />

      {/* Riepilogo della giornata */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { icon: Armchair, label: t('board.countNow', { n: inChair.length }), tone: 'accent' as const },
          { icon: Hourglass, label: t('board.countSoon', { n: soon.length }), tone: 'brand' as const },
          { icon: Clock, label: t('board.countLeft', { n: later.length }), tone: 'mute' as const },
          { icon: Sparkles, label: `${t('board.revenueToday')} ${money(revenueOn(state, now))}`, tone: 'mute' as const },
        ].map((c, i) => {
          const Icon = c.icon
          return (
            <Card key={c.label} className="stagger flex items-center gap-3 p-4" style={{ ['--i' as string]: i }}>
              <span className={cn(
                'grid h-9 w-9 shrink-0 place-items-center rounded-xl',
                c.tone === 'accent' && 'bg-accent/15 text-accent',
                c.tone === 'brand' && 'bg-brand-soft text-brand',
                c.tone === 'mute' && 'bg-surface-2 text-mute',
              )}>
                <Icon className="h-4.5 w-4.5" />
              </span>
              <span className="truncate text-[13px] font-semibold">{c.label}</span>
            </Card>
          )
        })}
      </div>

      {rows.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Clock className="h-6 w-6" />}
            title={t('board.emptyDay')}
            description={t('board.emptyDayDesc')}
          />
        </Card>
      ) : (
        <div className="space-y-8">
          <Zone
            icon={Armchair} tone="accent" big
            title={t('board.now')} count={t('board.countNow', { n: inChair.length })}
            rows={inChair} empty={t('board.nobody')}
          />
          <Zone
            icon={Hourglass} tone="brand" big
            title={t('board.soon')} count={t('board.countSoon', { n: soon.length })}
            rows={soon} empty={t('board.nobodySoon')}
          />
          {later.length > 0 && (
            <Zone
              icon={Clock} tone="mute"
              title={t('board.waiting')} count={t('board.countLeft', { n: later.length })}
              rows={later} empty=""
            />
          )}
          {done.length > 0 && (
            <Zone
              icon={CircleCheck} tone="mute"
              title={t('board.done')} count={String(done.length)}
              rows={done} empty=""
            />
          )}
        </div>
      )}

      <p className="text-mute mt-8 text-center text-[12px]">
        {t('board.alertWindow', { n: state.settings.alertMinutes })}
      </p>
    </>
  )
}
