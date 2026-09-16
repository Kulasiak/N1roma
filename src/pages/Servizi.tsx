/** Catalogo servizi: listino, durate, categorie. */

import { useMemo, useState } from 'react'
import { Clock, Euro, Pencil, Plus, Scissors, Search, Trash } from 'lucide-react'
import { useSalon } from '@/lib/store'
import { useI18n } from '@/lib/i18n'
import { CATEGORY_ICON } from '@/lib/icons'
import { SERVICE_CATEGORIES, type Service, type ServiceCategory } from '@/lib/types'
import { cn, formatDuration, matchesQuery, money } from '@/lib/utils'
import {
  Badge, Button, Card, EmptyState, Field, Input, Modal, SearchInput, Select, Switch, Textarea,
} from '@/components/ui'
import { PageHeader } from '@/components/Shell'

const EMPTY: Omit<Service, 'id'> = {
  name: '', category: 'taglio', durationMin: 45, price: 40, description: '', active: true,
}

export function Servizi() {
  const { state, dispatch } = useSalon()
  const { t } = useI18n()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<ServiceCategory | 'tutti'>('tutti')
  const [editing, setEditing] = useState<Service | 'new' | null>(null)

  const byCategory = useMemo(() => {
    const filtered = state.services.filter((s) =>
      (filter === 'tutti' || s.category === filter) && matchesQuery(`${s.name} ${s.description}`, query))
    return SERVICE_CATEGORIES
      .map((cat) => ({ cat, items: filtered.filter((s) => s.category === cat.id) }))
      .filter((g) => g.items.length > 0)
  }, [state.services, filter, query])

  const avgPrice = state.services.length
    ? state.services.reduce((a, s) => a + s.price, 0) / state.services.length : 0

  return (
    <>
      <PageHeader
        title={t('nav.services')}
        description={t('srv.subtitle', { n: state.services.length, avg: money(avgPrice) })}
        actions={<Button variant="accent" onClick={() => setEditing('new')}>
          <Plus className="h-4 w-4" />{t('srv.new')}</Button>}
      />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <SearchInput value={query} onChange={setQuery} placeholder={t('srv.searchPlaceholder')}
          icon={<Search className="h-4 w-4" />} className="w-full sm:max-w-xs" />
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
          <button type="button" onClick={() => setFilter('tutti')}
            className={cn('shrink-0 rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-colors',
              filter === 'tutti' ? 'border-brand bg-brand text-on-brand' : 'border-line text-soft hover:border-line-strong')}>
            {t('common.all')}
          </button>
          {SERVICE_CATEGORIES.map((cat) => {
            const Icon = CATEGORY_ICON[cat.id]
            return (
              <button key={cat.id} type="button" onClick={() => setFilter(cat.id)}
                className={cn('flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-colors',
                  filter === cat.id ? 'border-brand bg-brand text-on-brand' : 'border-line text-soft hover:border-line-strong')}>
                <Icon className="h-3.5 w-3.5" />
                {t(`cat.${cat.id}` as never)}
              </button>
            )
          })}
        </div>
      </div>

      {byCategory.length === 0 ? (
        <Card><EmptyState icon={<Scissors className="h-6 w-6" />}
          title={t('srv.emptyTitle')} description={t('srv.emptyDesc')} /></Card>
      ) : (
        <div className="space-y-7">
          {byCategory.map(({ cat, items }) => {
            const Icon = CATEGORY_ICON[cat.id]
            return (
              <section key={cat.id}>
                <div className="mb-3 flex items-center gap-2.5">
                  <span className="bg-brand-soft text-brand grid h-8 w-8 place-items-center rounded-lg">
                    <Icon className="h-4 w-4" />
                  </span>
                  <h3 className="font-display text-lg font-semibold">{t(`cat.${cat.id}` as never)}</h3>
                  <span className="text-mute text-[12px] font-medium">{items.length}</span>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {items.map((svc, i) => (
                    <Card key={svc.id}
                      className={cn('stagger group flex flex-col p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]',
                        !svc.active && 'opacity-55')}
                      style={{ ['--i' as string]: Math.min(i, 10) }}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold">{svc.name}</p>
                          <p className="text-mute mt-1 line-clamp-2 text-[12px] leading-relaxed">
                            {svc.description || t('srv.noDescription')}
                          </p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setEditing(svc)}
                          aria-label={`${t('common.edit')} ${svc.name}`}
                          className="opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <Badge tone="brand"><Clock className="h-3 w-3" />{formatDuration(svc.durationMin)}</Badge>
                        <Badge tone="good"><Euro className="h-3 w-3" />
                          {svc.price === 0 ? t('common.free') : money(svc.price)}</Badge>
                        {!svc.active && <Badge tone="mute">{t('srv.notBookable')}</Badge>}
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}

      <ServiceForm value={editing} onClose={() => setEditing(null)}
        onDelete={(id) => { dispatch({ type: 'service/remove', payload: id }); setEditing(null) }} />
    </>
  )
}

function ServiceForm({
  value, onClose, onDelete,
}: {
  value: Service | 'new' | null
  onClose: () => void
  onDelete: (id: string) => void
}) {
  const { dispatch } = useSalon()
  const { t } = useI18n()
  const [form, setForm] = useState<Omit<Service, 'id'>>(EMPTY)
  const [loadedFor, setLoadedFor] = useState<string | null>(null)

  const key = value === 'new' ? 'new' : (value?.id ?? null)
  if (key !== loadedFor) {
    setLoadedFor(key)
    setForm(value && value !== 'new' ? { ...value } : EMPTY)
  }

  function save() {
    if (!form.name.trim()) return
    if (value && value !== 'new') dispatch({ type: 'service/update', payload: { ...value, ...form } })
    else dispatch({ type: 'service/add', payload: form })
    onClose()
  }

  return (
    <Modal open={value !== null} onClose={onClose}
      title={value === 'new' ? t('srv.new') : t('srv.editTitle')}
      footer={
        <>
          {value && value !== 'new' && (
            <Button variant="danger" className="mr-auto" onClick={() => onDelete(value.id)}>
              <Trash className="h-4 w-4" />{t('common.delete')}
            </Button>
          )}
          <Button variant="secondary" onClick={onClose}>{t('common.cancel')}</Button>
          <Button variant="primary" onClick={save}>{t('common.save')}</Button>
        </>
      }>
      <div className="space-y-4">
        <Field label={t('srv.name')}>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </Field>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Field label={t('srv.category')}>
            <Select value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as ServiceCategory })}>
              {SERVICE_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{t(`cat.${c.id}` as never)}</option>
              ))}
            </Select>
          </Field>
          <Field label={t('srv.duration')}>
            <Input type="number" min={5} step={5} value={form.durationMin}
              onChange={(e) => setForm({ ...form, durationMin: Number(e.target.value) || 0 })} />
          </Field>
          <Field label={t('srv.price')}>
            <Input type="number" min={0} step={1} value={form.price}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) || 0 })} />
          </Field>
        </div>
        <Field label={t('srv.description')}>
          <Textarea rows={3} placeholder={t('srv.descPlaceholder')} value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </Field>
        <div className="bg-surface-2 flex items-center justify-between gap-4 rounded-xl p-3.5">
          <div>
            <p className="text-[13px] font-semibold">{t('srv.bookable')}</p>
            <p className="text-mute text-[11px]">{t('srv.bookableSub')}</p>
          </div>
          <Switch checked={form.active} onChange={(v) => setForm({ ...form, active: v })} label={t('srv.bookable')} />
        </div>
      </div>
    </Modal>
  )
}
