/** Magazzino: scorte, soglie di riordino, valore di inventario. */

import { useMemo, useState } from 'react'
import { Minus, Package, Pencil, Plus, Search, Trash, TriangleAlert } from 'lucide-react'
import { useSalon } from '@/lib/store'
import { useI18n } from '@/lib/i18n'
import { inventoryValue, lowStockProducts } from '@/lib/selectors'
import type { Product } from '@/lib/types'
import { cn, matchesQuery, money } from '@/lib/utils'
import { Badge, Button, Card, EmptyState, Field, Input, Modal, SearchInput, Segmented } from '@/components/ui'
import { PageHeader } from '@/components/Shell'

const EMPTY: Omit<Product, 'id'> = {
  name: '', brand: '', sku: '', stock: 0, minStock: 5, cost: 0, price: 0, unit: 'pezzo',
}

export function Magazzino() {
  const { state, dispatch } = useSalon()
  const { t } = useI18n()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'tutti' | 'sotto' | 'rivendita'>('tutti')
  const [editing, setEditing] = useState<Product | 'new' | null>(null)

  const low = useMemo(() => lowStockProducts(state), [state])
  const value = useMemo(() => inventoryValue(state), [state])

  const rows = useMemo(() => state.products.filter((p) => {
    if (!matchesQuery(`${p.name} ${p.brand} ${p.sku}`, query)) return false
    if (filter === 'sotto') return p.stock <= p.minStock
    if (filter === 'rivendita') return p.price > 0
    return true
  }), [state.products, query, filter])

  return (
    <>
      <PageHeader
        title={t('nav.inventory')}
        description={t('inv.subtitle', { n: state.products.length, value: money(value) })}
        actions={<Button variant="accent" onClick={() => setEditing('new')}>
          <Plus className="h-4 w-4" />{t('inv.new')}</Button>}
      />

      {low.length > 0 && (
        <Card className="border-warn/40 bg-warn/10 mb-5 flex flex-wrap items-center gap-3 p-4">
          <span className="bg-warn grid h-9 w-9 shrink-0 place-items-center rounded-xl text-white">
            <TriangleAlert className="h-4.5 w-4.5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-bold">
              {low.length === 1 ? t('inv.alertOne') : t('inv.alertMany', { n: low.length })}
            </p>
            <p className="text-soft truncate text-[12px]">
              {low.slice(0, 4).map((p) => p.name).join(' · ')}{low.length > 4 && ' …'}
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setFilter('sotto')}>{t('inv.show')}</Button>
        </Card>
      )}

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <SearchInput value={query} onChange={setQuery} placeholder={t('inv.searchPlaceholder')}
          icon={<Search className="h-4 w-4" />} className="w-full sm:max-w-sm" />
        <Segmented value={filter} onChange={setFilter} options={[
          { value: 'tutti', label: t('common.all') },
          { value: 'sotto', label: t('inv.filterLow') },
          { value: 'rivendita', label: t('inv.filterRetail') },
        ]} />
      </div>

      {rows.length === 0 ? (
        <Card><EmptyState icon={<Package className="h-6 w-6" />}
          title={t('inv.emptyTitle')} description={t('inv.emptyDesc')} /></Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead>
                <tr className="border-line text-mute border-b text-[11px] font-bold tracking-wide uppercase">
                  <th className="px-4 py-3">{t('inv.colProduct')}</th>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3 text-center">{t('inv.colStock')}</th>
                  <th className="px-4 py-3 text-right">{t('inv.colCost')}</th>
                  <th className="px-4 py-3 text-right">{t('inv.colRetail')}</th>
                  <th className="px-4 py-3 text-right">{t('inv.colValue')}</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-line divide-y">
                {rows.map((p) => {
                  const isLow = p.stock <= p.minStock
                  return (
                    <tr key={p.id} className="hover:bg-surface-2/60 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-[13px] font-semibold">{p.name}</p>
                        <p className="text-mute text-[11px]">{p.brand}</p>
                      </td>
                      <td className="text-mute px-4 py-3 font-mono text-[11px]">{p.sku}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1.5">
                          <Button variant="subtle" size="icon" className="h-7 w-7"
                            aria-label={t('inv.decrease', { name: p.name })}
                            onClick={() => dispatch({ type: 'product/stock', payload: { id: p.id, delta: -1 } })}>
                            <Minus className="h-3.5 w-3.5" />
                          </Button>
                          <span className={cn('w-12 text-center text-sm font-bold tabular-nums', isLow && 'text-warn')}>
                            {p.stock}
                          </span>
                          <Button variant="subtle" size="icon" className="h-7 w-7"
                            aria-label={t('inv.increase', { name: p.name })}
                            onClick={() => dispatch({ type: 'product/stock', payload: { id: p.id, delta: 1 } })}>
                            <Plus className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                        {isLow && <p className="text-warn mt-1 text-center text-[10px] font-bold">min {p.minStock}</p>}
                      </td>
                      <td className="px-4 py-3 text-right text-[13px] tabular-nums">{money(p.cost)}</td>
                      <td className="px-4 py-3 text-right text-[13px] tabular-nums">
                        {p.price > 0 ? money(p.price) : <Badge tone="neutral">{t('inv.internal')}</Badge>}
                      </td>
                      <td className="px-4 py-3 text-right text-[13px] font-bold tabular-nums">
                        {money(p.stock * p.cost)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="icon" onClick={() => setEditing(p)}
                          aria-label={`${t('common.edit')} ${p.name}`}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr className="border-line bg-surface-2/50 border-t">
                  <td className="px-4 py-3 text-[12px] font-bold" colSpan={5}>{t('inv.totalShown')}</td>
                  <td className="px-4 py-3 text-right text-sm font-bold tabular-nums">
                    {money(rows.reduce((a, p) => a + p.stock * p.cost, 0))}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      )}

      <ProductForm value={editing} onClose={() => setEditing(null)}
        onDelete={(id) => { dispatch({ type: 'product/remove', payload: id }); setEditing(null) }} />
    </>
  )
}

function ProductForm({
  value, onClose, onDelete,
}: {
  value: Product | 'new' | null
  onClose: () => void
  onDelete: (id: string) => void
}) {
  const { dispatch } = useSalon()
  const { t } = useI18n()
  const [form, setForm] = useState<Omit<Product, 'id'>>(EMPTY)
  const [loadedFor, setLoadedFor] = useState<string | null>(null)

  const key = value === 'new' ? 'new' : (value?.id ?? null)
  if (key !== loadedFor) {
    setLoadedFor(key)
    setForm(value && value !== 'new' ? { ...value } : EMPTY)
  }

  function save() {
    if (!form.name.trim()) return
    if (value && value !== 'new') dispatch({ type: 'product/update', payload: { ...value, ...form } })
    else dispatch({ type: 'product/add', payload: form })
    onClose()
  }

  return (
    <Modal open={value !== null} onClose={onClose}
      title={value === 'new' ? t('inv.new') : t('inv.editTitle')}
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
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label={t('inv.name')}>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label={t('inv.brand')}>
            <Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
          </Field>
          <Field label="SKU">
            <Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
          </Field>
          <Field label={t('inv.unit')}>
            <Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Field label={t('inv.stock')}>
            <Input type="number" min={0} value={form.stock}
              onChange={(e) => setForm({ ...form, stock: Number(e.target.value) || 0 })} />
          </Field>
          <Field label={t('inv.minStock')}>
            <Input type="number" min={0} value={form.minStock}
              onChange={(e) => setForm({ ...form, minStock: Number(e.target.value) || 0 })} />
          </Field>
          <Field label={t('inv.cost')}>
            <Input type="number" min={0} step={0.1} value={form.cost}
              onChange={(e) => setForm({ ...form, cost: Number(e.target.value) || 0 })} />
          </Field>
          <Field label={t('inv.retail')} hint={t('inv.retailHint')}>
            <Input type="number" min={0} step={0.5} value={form.price}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) || 0 })} />
          </Field>
        </div>
      </div>
    </Modal>
  )
}
