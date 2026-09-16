/** Team: turni, specializzazioni, rendimento. */

import { useMemo, useState } from 'react'
import { Mail, Pencil, Phone, Plus, Trash } from 'lucide-react'
import { useSalon } from '@/lib/store'
import { useI18n } from '@/lib/i18n'
import { staffPerformance } from '@/lib/selectors'
import { CATEGORY_ICON } from '@/lib/icons'
import { SERVICE_CATEGORIES, type ServiceCategory, type Staff } from '@/lib/types'
import { addDays, cn, money, startOfDay, weekdayLong, weekdayShort } from '@/lib/utils'
import {
  Avatar, Badge, Button, Card, Field, Input, Modal, Progress, Select, Switch, Textarea,
} from '@/components/ui'
import { PageHeader } from '@/components/Shell'

const PALETTE = ['#7A3763', '#E8946A', '#0891B2', '#8AA681', '#D97706', '#6D28D9', '#DB2777']

const EMPTY: Omit<Staff, 'id'> = {
  name: '', role: 'Hair Stylist', color: PALETTE[0], skills: ['taglio'], commissionPct: 15,
  workDays: [2, 3, 4, 5, 6], startHour: '09:00', endHour: '19:00',
  phone: '', email: '', bio: '', active: true,
}

export function Team() {
  const { state, dispatch } = useSalon()
  const { t } = useI18n()
  const [editing, setEditing] = useState<Staff | 'new' | null>(null)

  const today = startOfDay(new Date())
  const perf = useMemo(() => staffPerformance(state, addDays(today, -30), addDays(today, 1)), [state, today])
  const maxRevenue = Math.max(1, ...perf.map((p) => p.revenue))

  return (
    <>
      <PageHeader
        title={t('nav.team')}
        description={t('team.subtitle', { n: state.staff.filter((s) => s.active).length })}
        actions={<Button variant="accent" onClick={() => setEditing('new')}>
          <Plus className="h-4 w-4" />{t('team.add')}</Button>}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {state.staff.map((member, i) => {
          const p = perf.find((x) => x.staff.id === member.id)
          return (
            <Card key={member.id} className={cn('stagger overflow-hidden', !member.active && 'opacity-60')}
              style={{ ['--i' as string]: i }}>
              <div className="h-16" aria-hidden="true"
                style={{ background: `linear-gradient(120deg, ${member.color}, ${member.color}55)` }} />

              <div className="-mt-8 px-5 pb-5">
                <div className="flex items-end justify-between gap-3">
                  <Avatar name={member.name} color={member.color} size="lg" />
                  <Button variant="secondary" size="sm" onClick={() => setEditing(member)}>
                    <Pencil className="h-3.5 w-3.5" />{t('common.edit')}
                  </Button>
                </div>

                <p className="mt-3 text-base font-semibold">{member.name}</p>
                <p className="text-mute text-[12px]">{member.role}</p>
                {member.bio && <p className="text-soft mt-2 text-[12px] leading-relaxed">{member.bio}</p>}

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {member.skills.map((s) => {
                    const Icon = CATEGORY_ICON[s]
                    return (
                      <Badge key={s} tone="neutral">
                        <Icon className="h-3 w-3" />{t(`cat.${s}` as never)}
                      </Badge>
                    )
                  })}
                  {!member.active && <Badge tone="mute">{t('team.notActive')}</Badge>}
                </div>

                <div className="mt-4">
                  <p className="text-mute mb-1.5 text-[11px] font-bold tracking-wide uppercase">
                    {t('team.shifts', { from: member.startHour, to: member.endHour })}
                  </p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5, 6, 0].map((d) => (
                      <span key={d} title={weekdayLong(d)}
                        className={cn('grid h-7 flex-1 place-items-center rounded-lg text-[10px] font-bold',
                          member.workDays.includes(d) ? 'bg-brand text-on-brand' : 'bg-surface-2 text-mute')}>
                        {weekdayShort(d).charAt(0)}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="border-line mt-4 border-t pt-4">
                  <div className="mb-1.5 flex items-baseline justify-between">
                    <span className="text-mute text-[11px] font-bold tracking-wide uppercase">{t('team.revenue30')}</span>
                    <span className="text-sm font-bold tabular-nums">{money(p?.revenue ?? 0)}</span>
                  </div>
                  <Progress value={((p?.revenue ?? 0) / maxRevenue) * 100} />
                  <div className="text-mute mt-2 flex justify-between text-[11px]">
                    <span>{t('team.services', { n: p?.appointments ?? 0 })}</span>
                    <span>{t('team.avgTicket', { value: money(p?.avgTicket ?? 0) })}</span>
                  </div>
                  {member.commissionPct > 0 && (
                    <p className="text-soft mt-2 text-[11px]">
                      {t('team.commission', { pct: member.commissionPct })}{' '}
                      <strong className="font-bold">{money(p?.commission ?? 0)}</strong>
                    </p>
                  )}
                </div>

                <div className="text-mute mt-4 space-y-1 text-[11px]">
                  {member.phone && <p className="flex items-center gap-1.5"><Phone className="h-3 w-3" />{member.phone}</p>}
                  {member.email && <p className="flex items-center gap-1.5 break-all"><Mail className="h-3 w-3 shrink-0" />{member.email}</p>}
                </div>
              </div>
            </Card>
          )
        })}

        <button type="button" onClick={() => setEditing('new')}
          className="border-line-strong text-mute hover:border-brand hover:text-brand grid min-h-56 place-items-center rounded-[var(--radius-xl2)] border-2 border-dashed p-6 transition-colors">
          <span className="flex flex-col items-center gap-2">
            <Plus className="h-6 w-6" />
            <span className="text-[13px] font-semibold">{t('team.addMember')}</span>
          </span>
        </button>
      </div>

      <StaffForm value={editing} onClose={() => setEditing(null)}
        onDelete={(id) => { dispatch({ type: 'staff/remove', payload: id }); setEditing(null) }} />
    </>
  )
}

function StaffForm({
  value, onClose, onDelete,
}: {
  value: Staff | 'new' | null
  onClose: () => void
  onDelete: (id: string) => void
}) {
  const { dispatch } = useSalon()
  const { t } = useI18n()
  const [form, setForm] = useState<Omit<Staff, 'id'>>(EMPTY)
  const [loadedFor, setLoadedFor] = useState<string | null>(null)

  const key = value === 'new' ? 'new' : (value?.id ?? null)
  if (key !== loadedFor) {
    setLoadedFor(key)
    setForm(value && value !== 'new' ? { ...value } : EMPTY)
  }

  function save() {
    if (!form.name.trim()) return
    if (value && value !== 'new') dispatch({ type: 'staff/update', payload: { ...value, ...form } })
    else dispatch({ type: 'staff/add', payload: form })
    onClose()
  }

  return (
    <Modal open={value !== null} onClose={onClose} size="lg"
      title={value === 'new' ? t('team.newTitle') : t('team.editTitle')}
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
          <Field label={t('team.name')}>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label={t('team.role')}>
            <Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
          </Field>
          <Field label={t('cli.phone')}>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </Field>
          <Field label={t('cli.email')}>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
        </div>

        <Field label={t('team.bio')} hint={t('team.bioHint')}>
          <Textarea rows={2} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
        </Field>

        <div>
          <span className="text-soft mb-1.5 block text-[12px] font-semibold tracking-wide">{t('team.color')}</span>
          <div className="flex flex-wrap gap-2">
            {PALETTE.map((c) => (
              <button key={c} type="button" onClick={() => setForm({ ...form, color: c })}
                aria-label={`${t('team.color')} ${c}`} style={{ background: c }}
                className={cn('h-9 w-9 rounded-xl transition-transform',
                  form.color === c ? 'ring-brand scale-110 ring-2 ring-offset-2 ring-offset-[var(--surface)]' : 'hover:scale-105')} />
            ))}
          </div>
        </div>

        <div>
          <span className="text-soft mb-1.5 block text-[12px] font-semibold tracking-wide">{t('team.skills')}</span>
          <div className="flex flex-wrap gap-1.5">
            {SERVICE_CATEGORIES.map((cat) => {
              const on = form.skills.includes(cat.id)
              const Icon = CATEGORY_ICON[cat.id]
              return (
                <button key={cat.id} type="button"
                  onClick={() => setForm((f) => ({
                    ...f,
                    skills: f.skills.includes(cat.id)
                      ? f.skills.filter((x) => x !== cat.id)
                      : [...f.skills, cat.id as ServiceCategory],
                  }))}
                  className={cn('flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[12px] font-semibold transition-all',
                    on ? 'border-brand bg-brand text-on-brand' : 'border-line text-soft hover:border-line-strong')}>
                  <Icon className="h-3.5 w-3.5" />
                  {t(`cat.${cat.id}` as never)}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <span className="text-soft mb-1.5 block text-[12px] font-semibold tracking-wide">{t('team.workDays')}</span>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5, 6, 0].map((d) => (
              <button key={d} type="button"
                onClick={() => setForm((f) => ({
                  ...f,
                  workDays: f.workDays.includes(d) ? f.workDays.filter((x) => x !== d) : [...f.workDays, d].sort(),
                }))}
                className={cn('h-10 flex-1 rounded-lg text-[12px] font-bold transition-colors',
                  form.workDays.includes(d) ? 'bg-brand text-on-brand' : 'bg-surface-2 text-mute hover:text-text')}>
                {weekdayShort(d)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Field label={t('team.shiftStart')}>
            <Input type="time" step={900} value={form.startHour}
              onChange={(e) => setForm({ ...form, startHour: e.target.value })} />
          </Field>
          <Field label={t('team.shiftEnd')}>
            <Input type="time" step={900} value={form.endHour}
              onChange={(e) => setForm({ ...form, endHour: e.target.value })} />
          </Field>
          <Field label={t('team.commissionPct')}>
            <Select value={String(form.commissionPct)}
              onChange={(e) => setForm({ ...form, commissionPct: Number(e.target.value) })}>
              {[0, 5, 10, 12, 15, 18, 20, 22, 25, 30].map((v) => <option key={v} value={v}>{v}%</option>)}
            </Select>
          </Field>
        </div>

        <div className="bg-surface-2 flex items-center justify-between gap-4 rounded-xl p-3.5">
          <div>
            <p className="text-[13px] font-semibold">{t('team.active')}</p>
            <p className="text-mute text-[11px]">{t('team.activeSub')}</p>
          </div>
          <Switch checked={form.active} onChange={(v) => setForm({ ...form, active: v })} label={t('team.active')} />
        </div>
      </div>
    </Modal>
  )
}
