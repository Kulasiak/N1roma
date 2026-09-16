/** Cassa: scontrini, riepilogo giornaliero, incassi da chiudere. */

import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, Receipt, ShoppingBag, Trash, Wallet } from 'lucide-react'
import { useSalon } from '@/lib/store'
import { useI18n } from '@/lib/i18n'
import { appointmentsOn, cashSummary } from '@/lib/selectors'
import { pointsForAmount } from '@/lib/loyalty'
import { PAYMENT_METHODS, type PaymentMethod, type SaleItem } from '@/lib/types'
import { addDays, cn, dayKey, formatDateLong, formatTime, fullName, isToday, money, startOfDay } from '@/lib/utils'
import { Donut } from '@/components/charts'
import {
  Avatar, Badge, Button, Card, CardHeader, EmptyState, Field, Input, Modal, Select,
} from '@/components/ui'
import { PageHeader } from '@/components/Shell'

export function Cassa() {
  const { state, clientById, staffById } = useSalon()
  const { t } = useI18n()
  const [cursor, setCursor] = useState(() => startOfDay(new Date()))
  const [saleOpen, setSaleOpen] = useState(false)

  const summary = useMemo(() => cashSummary(state, cursor), [state, cursor])

  const donut = PAYMENT_METHODS
    .map((m) => ({ label: t(`pay.${m}` as never), value: summary.byMethod[m] }))
    .filter((s) => s.value > 0)

  const toCash = useMemo(() => appointmentsOn(state, cursor).filter((a) =>
    (a.status === 'completato' || a.status === 'in_corso') &&
    !state.sales.some((s) => s.appointmentId === a.id)), [state, cursor])

  return (
    <>
      <PageHeader title={t('nav.cash')} description={formatDateLong(cursor)}
        actions={<Button variant="accent" onClick={() => setSaleOpen(true)}>
          <Plus className="h-4 w-4" />{t('cash.new')}</Button>} />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="border-line bg-surface flex items-center gap-1 rounded-xl border p-1">
          <Button variant="ghost" size="icon" aria-label={t('cash.prevDay')}
            onClick={() => setCursor(addDays(cursor, -1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setCursor(startOfDay(new Date()))}>{t('common.today')}</Button>
          <Button variant="ghost" size="icon" aria-label={t('cash.nextDay')} disabled={isToday(cursor)}
            onClick={() => setCursor(addDays(cursor, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <input type="date" value={dayKey(cursor)} max={dayKey(new Date())}
          onChange={(e) => e.target.value && setCursor(startOfDay(new Date(e.target.value)))}
          className="border-line bg-surface hover:border-line-strong focus:border-brand h-10 rounded-xl border px-3 text-sm focus:outline-none" />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: t('cash.kpiRevenue'), value: money(summary.total) },
          { label: t('cash.kpiReceipts'), value: String(summary.count) },
          { label: t('cash.kpiAvg'), value: money(summary.avgTicket) },
          { label: t('cash.kpiProducts'), value: money(summary.products) },
        ].map((c, i) => (
          <div key={c.label} className="surface-card stagger p-5" style={{ ['--i' as string]: i }}>
            <p className="text-mute text-[12px] font-semibold">{c.label}</p>
            <p className="font-display mt-2 text-2xl font-semibold tabular-nums">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title={t('cash.receiptsTitle')}
            subtitle={t('cash.receiptsSub', {
              n: summary.count, services: money(summary.services), products: money(summary.products),
            })} />
          {summary.sales.length === 0 ? (
            <EmptyState icon={<Receipt className="h-6 w-6" />}
              title={t('cash.emptyTitle')} description={t('cash.emptyDesc')}
              action={isToday(cursor) ? (
                <Button variant="primary" onClick={() => setSaleOpen(true)}>
                  <Plus className="h-4 w-4" />{t('cash.new')}
                </Button>
              ) : undefined} />
          ) : (
            <ul className="divide-line divide-y">
              {summary.sales.map((sale) => {
                const client = sale.clientId ? clientById(sale.clientId) : null
                const staff = staffById(sale.staffId)
                return (
                  <li key={sale.id} className="flex items-start gap-3 p-4">
                    <span className="bg-surface-2 text-mute grid h-9 w-9 shrink-0 place-items-center rounded-xl text-[11px] font-bold">
                      #{sale.number}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold">{client ? fullName(client) : t('cash.walkIn')}</p>
                      <p className="text-mute truncate text-[11px]">
                        {sale.items.map((i) => `${i.qty}× ${i.name}`).join(' · ')}
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <Badge tone="neutral">{t(`pay.${sale.method}` as never)}</Badge>
                        {sale.discountPct > 0 && <Badge tone="accent">−{sale.discountPct}%</Badge>}
                        <span className="text-mute text-[11px]">
                          {formatTime(sale.createdAt)} · {staff?.name.split(' ')[0]}
                        </span>
                      </div>
                    </div>
                    <p className="shrink-0 text-sm font-bold tabular-nums">{money(sale.total)}</p>
                  </li>
                )
              })}
            </ul>
          )}
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader title={t('cash.paymentsTitle')} subtitle={t('cash.paymentsSub')} />
            <div className="p-5 pt-4"><Donut segments={donut} centerLabel={t('cash.kpiRevenue')} /></div>
          </Card>

          <Card>
            <CardHeader title={t('cash.toCashTitle')} subtitle={t('cash.toCashSub', { n: toCash.length })} />
            {toCash.length === 0 ? (
              <p className="text-mute p-5 pt-2 text-[13px]">{t('cash.allCashed')}</p>
            ) : (
              <ul className="space-y-2 p-4">
                {toCash.map((apt) => {
                  const client = clientById(apt.clientId)
                  return (
                    <li key={apt.id} className="bg-surface-2 flex items-center gap-2.5 rounded-xl p-3">
                      <Avatar name={client ? fullName(client) : '—'} size="xs" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-semibold">{client ? fullName(client) : '—'}</p>
                        <p className="text-mute text-[11px]">{formatTime(apt.start)}</p>
                      </div>
                      <Button variant="subtle" size="sm" onClick={() => setSaleOpen(true)}>{t('cash.cashIn')}</Button>
                    </li>
                  )
                })}
              </ul>
            )}
          </Card>
        </div>
      </div>

      <SaleDialog open={saleOpen} onClose={() => setSaleOpen(false)} />
    </>
  )
}

function SaleDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, dispatch } = useSalon()
  const { t } = useI18n()
  const [items, setItems] = useState<SaleItem[]>([])
  const [clientId, setClientId] = useState('')
  const [staffId, setStaffId] = useState(state.staff[0]?.id ?? '')
  const [method, setMethod] = useState<PaymentMethod>('carta')
  const [discountPct, setDiscountPct] = useState(0)
  const [tab, setTab] = useState<'servizi' | 'prodotti'>('servizi')

  const gross = items.reduce((a, i) => a + i.unitPrice * i.qty, 0)
  const total = Math.round(gross * (1 - discountPct / 100) * 100) / 100

  function addItem(item: SaleItem) {
    setItems((prev) => {
      const idx = prev.findIndex((p) => p.kind === item.kind && p.refId === item.refId)
      if (idx === -1) return [...prev, item]
      const copy = [...prev]
      copy[idx] = { ...copy[idx], qty: copy[idx].qty + 1 }
      return copy
    })
  }

  function save() {
    if (items.length === 0 || !staffId) return
    dispatch({
      type: 'sale/add',
      payload: { clientId: clientId || null, staffId, appointmentId: null, items, discountPct, method, total },
    })
    setItems([]); setClientId(''); setDiscountPct(0); setMethod('carta')
    onClose()
  }

  const retail = state.products.filter((p) => p.price > 0)

  return (
    <Modal open={open} onClose={onClose} size="xl" title={t('cash.new')}
      subtitle={items.length > 0
        ? t('cash.itemsSummary', { n: items.length, total: money(total) })
        : t('cash.addItems')}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>{t('common.cancel')}</Button>
          <Button variant="primary" onClick={save} disabled={items.length === 0}>
            <Wallet className="h-4 w-4" />{t('cash.total', { total: money(total) })}
          </Button>
        </>
      }>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div>
          <div className="bg-surface-2 border-line mb-3 inline-flex gap-0.5 rounded-xl border p-1">
            {([['servizi', t('cash.tabServices')], ['prodotti', t('cash.tabProducts')]] as const).map(([id, label]) => (
              <button key={id} type="button" onClick={() => setTab(id)}
                className={cn('rounded-lg px-3 py-1.5 text-[13px] font-semibold transition-all',
                  tab === id ? 'bg-surface text-text shadow-sm' : 'text-mute hover:text-text')}>
                {label}
              </button>
            ))}
          </div>

          <div className="border-line max-h-72 space-y-1.5 overflow-y-auto rounded-xl border p-2">
            {tab === 'servizi'
              ? state.services.filter((s) => s.active && s.price > 0).map((svc) => (
                  <button key={svc.id} type="button"
                    onClick={() => addItem({ kind: 'servizio', refId: svc.id, name: svc.name, qty: 1, unitPrice: svc.price })}
                    className="hover:bg-surface-2 flex w-full items-center gap-3 rounded-lg p-2.5 text-left transition-colors">
                    <span className="min-w-0 flex-1 truncate text-[13px] font-medium">{svc.name}</span>
                    <span className="text-[13px] font-bold tabular-nums">{money(svc.price)}</span>
                    <Plus className="text-mute h-4 w-4 shrink-0" />
                  </button>
                ))
              : retail.map((p) => (
                  <button key={p.id} type="button"
                    onClick={() => addItem({ kind: 'prodotto', refId: p.id, name: p.name, qty: 1, unitPrice: p.price })}
                    className="hover:bg-surface-2 flex w-full items-center gap-3 rounded-lg p-2.5 text-left transition-colors">
                    <ShoppingBag className="text-mute h-4 w-4 shrink-0" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-medium">{p.name}</span>
                      <span className="text-mute text-[11px]">{p.brand} · {t('cash.stock', { n: p.stock })}</span>
                    </span>
                    <span className="text-[13px] font-bold tabular-nums">{money(p.price)}</span>
                  </button>
                ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="border-line min-h-32 rounded-xl border p-3">
            {items.length === 0 ? (
              <p className="text-mute py-8 text-center text-[13px]">{t('cash.emptyReceipt')}</p>
            ) : (
              <ul className="divide-line divide-y">
                {items.map((item, idx) => (
                  <li key={`${item.kind}-${item.refId}`} className="flex items-center gap-2 py-2">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-medium">{item.name}</span>
                      <span className="text-mute text-[11px]">{item.qty} × {money(item.unitPrice)}</span>
                    </span>
                    <span className="text-[13px] font-bold tabular-nums">{money(item.qty * item.unitPrice)}</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7"
                      aria-label={t('cash.remove', { name: item.name })}
                      onClick={() => setItems(items.filter((_, i) => i !== idx))}>
                      <Trash className="h-3.5 w-3.5" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label={t('cash.clientLabel')}>
              <Select value={clientId} onChange={(e) => setClientId(e.target.value)}>
                <option value="">{t('cash.walkInOption')}</option>
                {[...state.clients].sort((a, b) => a.lastName.localeCompare(b.lastName)).map((c) => (
                  <option key={c.id} value={c.id}>{fullName(c)}</option>
                ))}
              </Select>
            </Field>
            <Field label={t('cash.operator')}>
              <Select value={staffId} onChange={(e) => setStaffId(e.target.value)}>
                {state.staff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Select>
            </Field>
            <Field label={t('cash.payment')}>
              <Select value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)}>
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>{t(`pay.${m}` as never)}</option>
                ))}
              </Select>
            </Field>
            <Field label={t('cash.discount')}>
              <Input type="number" min={0} max={100} value={discountPct}
                onChange={(e) => setDiscountPct(Math.max(0, Math.min(100, Number(e.target.value) || 0)))} />
            </Field>
          </div>

          <div className="bg-surface-2 space-y-1.5 rounded-xl p-4">
            <div className="text-soft flex justify-between text-[13px]">
              <span>{t('cash.gross')}</span><span className="tabular-nums">{money(gross)}</span>
            </div>
            {discountPct > 0 && (
              <div className="text-warn flex justify-between text-[13px]">
                <span>{t('cash.discountLine', { pct: discountPct })}</span>
                <span className="tabular-nums">−{money(gross - total)}</span>
              </div>
            )}
            <div className="border-line flex justify-between border-t pt-2 text-base font-bold">
              <span>{t('cash.toPay')}</span><span className="tabular-nums">{money(total)}</span>
            </div>
            {clientId && pointsForAmount(state, total) > 0 && (
              <p className="text-good pt-1 text-[12px] font-semibold">
                {t('loy.earnedOnSale', { n: pointsForAmount(state, total) })}
              </p>
            )}
          </div>
        </div>
      </div>
    </Modal>
  )
}
