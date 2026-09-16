/** Anagrafica clienti: ricerca, scheda, tessera fedeltà, storico. */

import { useMemo, useState } from 'react'
import { CalendarClock, Mail, Pencil, Phone, Plus, Search, Sparkles, Trash, Users } from 'lucide-react'
import { useSalon } from '@/lib/store'
import { useI18n } from '@/lib/i18n'
import { clientStats } from '@/lib/selectors'
import { cardUrl, ledgerOf } from '@/lib/loyalty'
import { STATUS_ICON } from '@/lib/icons'
import type { Client } from '@/lib/types'
import { cn, formatDateShort, formatTime, fullName, matchesQuery, money, relativeDay } from '@/lib/utils'
import { LoyaltyCard } from '@/components/LoyaltyCard'
import { WhatsAppButton } from '@/components/WhatsAppButton'
import {
  Avatar, Badge, Button, Card, EmptyState, Field, Input, Modal, SearchInput, Segmented, Switch, Textarea,
} from '@/components/ui'
import { PageHeader } from '@/components/Shell'

type SortKey = 'nome' | 'recenti' | 'spesa'
type ClientDraft = Omit<Client, 'id' | 'createdAt' | 'cardCode' | 'points'>

const EMPTY: ClientDraft = {
  firstName: '', lastName: '', phone: '', email: '', birthday: null,
  notes: '', hairNotes: '', tags: [], marketingConsent: false,
}

export function Clienti() {
  const { state, dispatch } = useSalon()
  const { t } = useI18n()
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortKey>('nome')
  const [selected, setSelected] = useState<string | null>(null)
  const [editing, setEditing] = useState<Client | 'new' | null>(null)

  const rows = useMemo(() => {
    const withStats = state.clients.map((client) => ({ client, stats: clientStats(state, client.id) }))
    return withStats
      .filter(({ client }) => matchesQuery(
        `${client.firstName} ${client.lastName} ${client.phone} ${client.email} ${client.tags.join(' ')} ${client.cardCode}`,
        query))
      .sort((a, b) => {
        if (sort === 'spesa') return b.stats.totalSpent - a.stats.totalSpent
        if (sort === 'recenti') return (b.stats.lastVisit?.getTime() ?? 0) - (a.stats.lastVisit?.getTime() ?? 0)
        return `${a.client.lastName}${a.client.firstName}`.localeCompare(`${b.client.lastName}${b.client.firstName}`)
      })
  }, [state, query, sort])

  const detail = selected ? state.clients.find((c) => c.id === selected) : null

  return (
    <>
      <PageHeader
        title={t('nav.clients')} description={t('cli.subtitle', { n: state.clients.length })}
        actions={
          <Button variant="accent" onClick={() => setEditing('new')}>
            <Plus className="h-4 w-4" />{t('cli.new')}
          </Button>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <SearchInput value={query} onChange={setQuery} placeholder={t('cli.searchPlaceholder')}
          icon={<Search className="h-4 w-4" />} className="w-full sm:max-w-sm" />
        <Segmented value={sort} onChange={setSort} options={[
          { value: 'nome', label: t('cli.sortAZ') },
          { value: 'recenti', label: t('cli.sortRecent') },
          { value: 'spesa', label: t('cli.sortTop') },
        ]} />
        <span className="text-mute ml-auto text-[13px] font-medium">{rows.length} {t('common.results')}</span>
      </div>

      {rows.length === 0 ? (
        <Card><EmptyState icon={<Users className="h-6 w-6" />}
          title={t('cli.emptyTitle')} description={t('cli.emptyDesc')}
          action={<Button variant="primary" onClick={() => setEditing('new')}>
            <Plus className="h-4 w-4" />{t('cli.new')}</Button>} /></Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map(({ client, stats }, i) => (
            <button key={client.id} type="button" onClick={() => setSelected(client.id)}
              className="surface-card stagger hover:border-line-strong flex items-center gap-3 p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]"
              style={{ ['--i' as string]: Math.min(i, 12) }}>
              <Avatar name={fullName(client)} size="md" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{fullName(client)}</p>
                <p className="text-mute truncate text-[12px]">{client.phone}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  {client.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} tone={tag === 'VIP' ? 'accent' : 'neutral'}>{tag}</Badge>
                  ))}
                  {stats.visits > 0 && (
                    <span className="text-mute text-[11px] font-medium">{t('cli.visits', { n: stats.visits })}</span>
                  )}
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-bold tabular-nums">{money(stats.totalSpent)}</p>
                <p className="text-mute text-[10px]">
                  {stats.lastVisit ? formatDateShort(stats.lastVisit) : t('cli.never')}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      <Modal open={!!detail} onClose={() => setSelected(null)} size="lg"
        title={detail ? fullName(detail) : ''} subtitle={detail?.phone}
        footer={detail && (
          <>
            <Button variant="danger" className="mr-auto"
              onClick={() => { dispatch({ type: 'client/remove', payload: detail.id }); setSelected(null) }}>
              <Trash className="h-4 w-4" />{t('common.delete')}
            </Button>
            <Button variant="secondary" onClick={() => setSelected(null)}>{t('common.close')}</Button>
            <Button variant="primary" onClick={() => { setEditing(detail); setSelected(null) }}>
              <Pencil className="h-4 w-4" />{t('common.edit')}
            </Button>
          </>
        )}>
        {detail && <ClientDetail client={detail} />}
      </Modal>

      <ClientForm value={editing} onClose={() => setEditing(null)} />
    </>
  )
}

function ClientDetail({ client }: { client: Client }) {
  const { state, serviceById, staffById } = useSalon()
  const { t } = useI18n()
  const stats = clientStats(state, client.id)
  const movements = ledgerOf(state, client.id)

  const cells = [
    { label: t('cli.statVisits'), value: String(stats.visits) },
    { label: t('cli.statSpent'), value: money(stats.totalSpent) },
    { label: t('cli.statAvg'), value: money(stats.avgTicket) },
    { label: t('cli.statNoShow'), value: String(stats.noShows) },
  ]

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cells.map((c) => (
          <div key={c.label} className="bg-surface-2 rounded-xl p-3.5">
            <p className="text-mute text-[11px] font-semibold">{c.label}</p>
            <p className="mt-1 text-lg font-bold tabular-nums">{c.value}</p>
          </div>
        ))}
      </div>

      {state.settings.loyalty.enabled && <LoyaltyCard client={client} />}

      <div className="flex flex-wrap gap-2">
        <WhatsAppButton phone={client.phone} variant="secondary" label={t('wa.send')}
          message={t('wa.msgCard', {
            name: client.firstName, salon: state.settings.name,
            url: cardUrl(state, client), points: client.points,
          })} />
        {stats.nextVisit && (
          <WhatsAppButton phone={client.phone} variant="subtle" label={t('wa.remind')}
            message={t('wa.msgReminder', {
              name: client.firstName, salon: state.settings.name,
              when: relativeDay(stats.nextVisit), time: formatTime(stats.nextVisit),
            })} />
        )}
        {client.birthday && (
          <WhatsAppButton phone={client.phone} variant="subtle" label={t('wa.birthday')}
            message={t('wa.msgBirthday', { name: client.firstName, salon: state.settings.name })} />
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="border-line space-y-2 rounded-xl border p-4">
          <p className="text-mute text-[11px] font-bold tracking-wide uppercase">{t('cli.contacts')}</p>
          <p className="flex items-center gap-2 text-[13px]"><Phone className="text-mute h-3.5 w-3.5" />{client.phone || '—'}</p>
          <p className="flex items-center gap-2 text-[13px] break-all"><Mail className="text-mute h-3.5 w-3.5 shrink-0" />{client.email || '—'}</p>
          <p className="flex items-center gap-2 text-[13px]">
            <CalendarClock className="text-mute h-3.5 w-3.5" />
            {client.birthday ? formatDateShort(new Date(client.birthday)) : t('cli.birthdayUnknown')}
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {client.tags.length > 0
              ? client.tags.map((tg) => <Badge key={tg} tone={tg === 'VIP' ? 'accent' : 'neutral'}>{tg}</Badge>)
              : <span className="text-mute text-[12px]">{t('cli.noTags')}</span>}
            <Badge tone={client.marketingConsent ? 'good' : 'neutral'}>
              {client.marketingConsent ? t('cli.consentYes') : t('cli.consentNo')}
            </Badge>
          </div>
        </div>

        <div className="border-line rounded-xl border p-4">
          <p className="text-mute mb-2 flex items-center gap-1.5 text-[11px] font-bold tracking-wide uppercase">
            <Sparkles className="h-3.5 w-3.5" />{t('cli.sheet')}
          </p>
          <p className="text-[13px] leading-relaxed">
            {client.hairNotes || <span className="text-mute">{t('cli.noFormula')}</span>}
          </p>
          {client.notes && (
            <>
              <p className="text-mute mt-3 mb-1 text-[11px] font-bold tracking-wide uppercase">{t('cli.notes')}</p>
              <p className="text-[13px] leading-relaxed">{client.notes}</p>
            </>
          )}
        </div>
      </div>

      <div>
        <p className="text-mute mb-2 text-[11px] font-bold tracking-wide uppercase">
          {t('cli.history', { n: stats.appointments.length })}
        </p>
        {stats.appointments.length === 0 ? (
          <p className="text-mute text-[13px]">{t('cli.noHistory')}</p>
        ) : (
          <ul className="border-line divide-line max-h-64 divide-y overflow-y-auto rounded-xl border">
            {stats.appointments.slice(0, 30).map((apt) => {
              const Icon = STATUS_ICON[apt.status]
              return (
                <li key={apt.id} className="flex items-center gap-3 p-3">
                  <div className="w-20 shrink-0">
                    <p className="text-[12px] font-bold">{formatDateShort(apt.start)}</p>
                    <p className="text-mute text-[10px]">{formatTime(apt.start)}</p>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium">
                      {apt.serviceIds.map((id) => serviceById(id)?.name).filter(Boolean).join(' + ')}
                    </p>
                    <p className="text-mute text-[11px]">{staffById(apt.staffId)?.name}</p>
                  </div>
                  <Badge tone="neutral"><Icon className="h-3 w-3" />{t(`status.${apt.status}` as never)}</Badge>
                </li>
              )
            })}
          </ul>
        )}

        {movements.length > 0 && (
          <div className="mt-5">
            <p className="text-mute mb-2 text-[11px] font-bold tracking-wide uppercase">{t('loy.history')}</p>
            <ul className="border-line divide-line max-h-44 divide-y overflow-y-auto rounded-xl border">
              {movements.slice(0, 20).map((entry) => (
                <li key={entry.id} className="flex items-center gap-3 p-2.5">
                  <span className="text-mute w-20 shrink-0 text-[11px]">{formatDateShort(entry.createdAt)}</span>
                  <span className="min-w-0 flex-1 truncate text-[12px]">
                    {entry.note || t(`loy.reason.${entry.reason}` as never)}
                  </span>
                  <span className={cn('shrink-0 text-[12px] font-bold tabular-nums',
                    entry.points > 0 ? 'text-good' : 'text-warn')}>
                    {entry.points > 0 ? '+' : ''}{entry.points}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {stats.nextVisit && (
          <p className="text-brand mt-3 text-[13px] font-semibold">
            {t('cli.nextAppointment', {
              when: relativeDay(stats.nextVisit), time: formatTime(stats.nextVisit),
            })}
          </p>
        )}
      </div>
    </div>
  )
}

function ClientForm({ value, onClose }: { value: Client | 'new' | null; onClose: () => void }) {
  const { dispatch } = useSalon()
  const { t } = useI18n()
  const [form, setForm] = useState<ClientDraft>(EMPTY)
  const [tagsText, setTagsText] = useState('')
  const [loadedFor, setLoadedFor] = useState<string | null>(null)

  const key = value === 'new' ? 'new' : (value?.id ?? null)
  if (key !== loadedFor) {
    setLoadedFor(key)
    if (value && value !== 'new') { setForm({ ...value }); setTagsText(value.tags.join(', ')) }
    else { setForm(EMPTY); setTagsText('') }
  }

  function save() {
    const tags = tagsText.split(',').map((s) => s.trim()).filter(Boolean)
    if (!form.firstName.trim()) return
    if (value && value !== 'new') dispatch({ type: 'client/update', payload: { ...value, ...form, tags } })
    else dispatch({ type: 'client/add', payload: { ...form, tags } })
    onClose()
  }

  return (
    <Modal open={value !== null} onClose={onClose}
      title={value === 'new' ? t('cli.new') : t('cli.editTitle')}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>{t('common.cancel')}</Button>
          <Button variant="primary" onClick={save}>{t('common.save')}</Button>
        </>
      }>
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label={t('cli.firstName')}>
            <Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
          </Field>
          <Field label={t('cli.lastName')}>
            <Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
          </Field>
          <Field label={t('cli.phone')}>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </Field>
          <Field label={t('cli.email')}>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
          <Field label={t('cli.birthday')}>
            <Input type="date" value={form.birthday ?? ''}
              onChange={(e) => setForm({ ...form, birthday: e.target.value || null })} />
          </Field>
          <Field label={t('cli.tags')} hint={t('cli.tagsHint')}>
            <Input value={tagsText} onChange={(e) => setTagsText(e.target.value)} />
          </Field>
        </div>

        <Field label={t('cli.sheet')} hint={t('cli.sheetHint')}>
          <Textarea rows={3} value={form.hairNotes} onChange={(e) => setForm({ ...form, hairNotes: e.target.value })} />
        </Field>
        <Field label={t('cli.notes')}>
          <Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </Field>

        <div className="bg-surface-2 flex items-center justify-between gap-4 rounded-xl p-3.5">
          <div>
            <p className="text-[13px] font-semibold">{t('cli.marketing')}</p>
            <p className="text-mute text-[11px]">{t('cli.marketingSub')}</p>
          </div>
          <Switch checked={form.marketingConsent}
            onChange={(v) => setForm({ ...form, marketingConsent: v })} label={t('cli.marketing')} />
        </div>
      </div>
    </Modal>
  )
}
