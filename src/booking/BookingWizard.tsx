/** Prenotazione online in 4 passi, su disponibilità reale. */

import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, Clock, Sparkles, User } from 'lucide-react'
import { useSalon } from '@/lib/store'
import { useI18n } from '@/lib/i18n'
import { availableSlots, nextAvailableDays } from '@/lib/selectors'
import { CATEGORY_ICON } from '@/lib/icons'
import { SERVICE_CATEGORIES, type ID } from '@/lib/types'
import {
  cn, formatDateLong, formatDateShort, formatDuration, formatTime, money, relativeDay, startOfDay, uid,
} from '@/lib/utils'
import { Avatar, Badge, Button, Field, Input, Modal, Textarea } from '@/components/ui'

export function BookingWizard({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, dispatch, quote } = useSalon()
  const { t } = useI18n()

  const [step, setStep] = useState(1)
  const [serviceIds, setServiceIds] = useState<ID[]>([])
  const [staffId, setStaffId] = useState<ID | null>(null)
  const [day, setDay] = useState<Date | null>(null)
  const [time, setTime] = useState<string | null>(null)
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', email: '', notes: '' })
  const [error, setError] = useState('')
  const [confirmed, setConfirmed] = useState<{ when: Date; staffId: ID } | null>(null)

  const { durationMin, price } = quote(serviceIds)

  const requiredSkills = useMemo(() => [...new Set(
    serviceIds.map((id) => state.services.find((s) => s.id === id)?.category)
      .filter((c): c is NonNullable<typeof c> => Boolean(c)),
  )], [serviceIds, state.services])

  const eligibleStaff = useMemo(
    () => state.staff.filter((s) => s.active && requiredSkills.every((k) => s.skills.includes(k))),
    [state.staff, requiredSkills],
  )

  const days = useMemo(
    () => (durationMin === 0 ? [] : nextAvailableDays(state, new Date(), durationMin, staffId, requiredSkills, 12)),
    [state, durationMin, staffId, requiredSkills],
  )

  const slots = useMemo(
    () => (!day || durationMin === 0 ? [] : availableSlots(state, day, durationMin, staffId, requiredSkills)),
    [state, day, durationMin, staffId, requiredSkills],
  )

  useEffect(() => { if (step === 3 && !day && days.length > 0) setDay(days[0]) }, [step, day, days])
  useEffect(() => { setTime(null) }, [staffId, serviceIds, day])

  function reset() {
    setStep(1); setServiceIds([]); setStaffId(null); setDay(null); setTime(null)
    setForm({ firstName: '', lastName: '', phone: '', email: '', notes: '' })
    setError(''); setConfirmed(null)
  }

  function confirm() {
    if (!form.firstName.trim()) return setError(t('book.errName'))
    if (!form.phone.trim()) return setError(t('book.errPhone'))
    const slot = slots.find((s) => s.hhmm === time)
    if (!day || !time || !slot) return

    const clientId = uid('cli')
    dispatch({
      type: 'client/add',
      payload: {
        id: clientId, firstName: form.firstName.trim(), lastName: form.lastName.trim(),
        phone: form.phone.trim(), email: form.email.trim(), birthday: null,
        notes: '', hairNotes: '', tags: ['Nuovo'], marketingConsent: false,
      },
    })
    dispatch({
      type: 'appointment/add',
      payload: {
        clientId, staffId: slot.staffId, serviceIds, start: slot.start.toISOString(),
        durationMin, status: 'confermato', notes: form.notes.trim(), source: 'online',
      },
    })
    setConfirmed({ when: slot.start, staffId: slot.staffId })
  }

  const canContinue = (step === 1 && serviceIds.length > 0) || step === 2 || (step === 3 && !!time) || step === 4
  const chosenStaff = staffId ? state.staff.find((s) => s.id === staffId) : null
  const confirmedStaff = confirmed ? state.staff.find((s) => s.id === confirmed.staffId) : null
  const closeAll = () => { onClose(); setTimeout(reset, 250) }

  const titles = [t('book.step1'), t('book.step2'), t('book.step3'), t('book.step4')]
  const subs = [t('book.step1Sub'), t('book.step2Sub'), t('book.step3Sub'), t('book.step4Sub')]

  return (
    <Modal
      open={open} onClose={closeAll} size="lg"
      title={confirmed ? t('book.doneTitle') : titles[step - 1]}
      subtitle={confirmed ? undefined : subs[step - 1]}
      footer={confirmed ? (
        <>
          <Button variant="secondary" onClick={reset}>{t('book.doneNew')}</Button>
          <Button variant="primary" onClick={closeAll}>{t('book.doneHome')}</Button>
        </>
      ) : (
        <>
          {step > 1 && (
            <Button variant="ghost" className="mr-auto" onClick={() => setStep(step - 1)}>
              <ArrowLeft className="h-4 w-4" />{t('common.back')}
            </Button>
          )}
          {step < 4 ? (
            <Button variant="primary" disabled={!canContinue} onClick={() => setStep(step + 1)}>
              {t('common.continue')}<ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button variant="accent" onClick={confirm}>
              <Check className="h-4 w-4" />{t('book.confirm')}
            </Button>
          )}
        </>
      )}
    >
      {confirmed ? (
        <div className="text-center">
          <div className="bg-good mx-auto grid h-16 w-16 place-items-center rounded-full text-white">
            <Check className="h-8 w-8" strokeWidth={3} />
          </div>
          <p className="text-soft mx-auto mt-4 max-w-md text-[14px] leading-relaxed">
            {t('book.doneText', { when: relativeDay(confirmed.when), time: formatTime(confirmed.when) })}
          </p>
          <div className="border-line mt-6 space-y-3 rounded-2xl border p-5 text-left">
            {[
              [t('book.summaryServices'), serviceIds.map((id) => state.services.find((s) => s.id === id)?.name).filter(Boolean).join(' + ')],
              [t('book.summaryStylist'), confirmedStaff?.name ?? '—'],
              [t('book.summaryWhen'), formatDateLong(confirmed.when)],
              [t('book.summaryDuration'), formatDuration(durationMin)],
            ].map(([label, value]) => (
              <div key={label} className="flex items-baseline justify-between gap-4">
                <span className="text-mute shrink-0 text-[12px] font-semibold">{label}</span>
                <span className="text-right text-[13px] font-medium">{value}</span>
              </div>
            ))}
            <div className="border-line flex items-baseline justify-between border-t pt-3">
              <span className="text-[13px] font-bold">{t('book.summaryTotal')}</span>
              <span className="font-display text-xl font-semibold">{money(price)}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className={cn('h-1.5 flex-1 rounded-full transition-colors duration-300',
                n <= step ? 'bg-grad-brand' : 'bg-surface-2')} />
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-4">
              {SERVICE_CATEGORIES.map((cat) => {
                const items = state.services.filter((s) => s.category === cat.id && s.active)
                if (items.length === 0) return null
                const Icon = CATEGORY_ICON[cat.id]
                return (
                  <div key={cat.id}>
                    <p className="text-mute mb-2 flex items-center gap-2 text-[11px] font-bold tracking-[0.12em] uppercase">
                      <Icon className="h-3.5 w-3.5" />{t(`cat.${cat.id}` as never)}
                    </p>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {items.map((svc) => {
                        const on = serviceIds.includes(svc.id)
                        return (
                          <button key={svc.id} type="button"
                            onClick={() => {
                              setServiceIds((p) => p.includes(svc.id) ? p.filter((s) => s !== svc.id) : [...p, svc.id])
                              setStaffId(null); setDay(null)
                            }}
                            className={cn('rounded-xl border p-3 text-left transition-all duration-200',
                              on ? 'border-brand bg-brand-soft/60' : 'border-line hover:border-line-strong hover:bg-surface-2')}>
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-[13px] font-semibold">{svc.name}</span>
                              <span className={cn('grid h-5 w-5 shrink-0 place-items-center rounded-full border transition-colors',
                                on ? 'border-brand bg-brand text-on-brand' : 'border-line-strong')}>
                                {on && <Check className="h-3 w-3" strokeWidth={3} />}
                              </span>
                            </div>
                            <p className="text-mute mt-1 text-[11px]">
                              {formatDuration(svc.durationMin)} · {svc.price === 0 ? t('common.free') : money(svc.price)}
                            </p>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {step === 2 && (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button type="button" onClick={() => setStaffId(null)}
                className={cn('flex items-center gap-3 rounded-xl border p-3.5 text-left transition-all',
                  staffId === null ? 'border-brand bg-brand-soft/60' : 'border-line hover:border-line-strong')}>
                <span className="bg-grad-accent grid h-10 w-10 shrink-0 place-items-center rounded-full text-white">
                  <Sparkles className="h-4.5 w-4.5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[13px] font-semibold">{t('book.anyStylist')}</span>
                  <span className="text-mute block text-[11px]">{t('book.anyStylistSub')}</span>
                </span>
              </button>

              {eligibleStaff.map((s) => (
                <button key={s.id} type="button" onClick={() => setStaffId(s.id)}
                  className={cn('flex items-center gap-3 rounded-xl border p-3.5 text-left transition-all',
                    staffId === s.id ? 'border-brand bg-brand-soft/60' : 'border-line hover:border-line-strong')}>
                  <Avatar name={s.name} color={s.color} size="md" />
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] font-semibold">{s.name}</span>
                    <span className="text-mute block truncate text-[11px]">{s.role}</span>
                  </span>
                </button>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <p className="text-soft mb-2 text-[12px] font-semibold tracking-wide">{t('book.chooseDay')}</p>
                <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
                  {days.map((d) => {
                    const on = day && startOfDay(d).getTime() === startOfDay(day).getTime()
                    return (
                      <button key={d.toISOString()} type="button" onClick={() => setDay(d)}
                        className={cn('shrink-0 rounded-xl border px-4 py-2.5 text-center transition-all',
                          on ? 'border-brand bg-brand text-on-brand' : 'border-line hover:border-line-strong')}>
                        <span className="block text-[11px] font-medium opacity-80">
                          {formatDateShort(d).split(' ')[0]}
                        </span>
                        <span className="block text-lg leading-tight font-bold">{d.getDate()}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <p className="text-soft mb-2 text-[12px] font-semibold tracking-wide">{t('book.chooseTime')}</p>
                {slots.length === 0 ? (
                  <div className="border-line rounded-xl border border-dashed p-6 text-center">
                    <p className="text-[13px] font-semibold">{t('book.noSlots')}</p>
                    <p className="text-mute mt-1 text-[12px]">{t('book.pickAnotherDay')}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                    {slots.map((slot) => (
                      <button key={slot.hhmm} type="button" onClick={() => setTime(slot.hhmm)}
                        className={cn('rounded-lg border py-2 text-[13px] font-bold tabular-nums transition-all',
                          time === slot.hhmm ? 'border-brand bg-brand text-on-brand' : 'border-line hover:border-brand hover:text-brand')}>
                        {slot.hhmm}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label={t('book.firstName')}>
                  <Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
                </Field>
                <Field label={t('book.lastName')}>
                  <Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
                </Field>
                <Field label={t('book.phone')}>
                  <Input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </Field>
                <Field label={t('book.email')}>
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </Field>
              </div>
              <Field label={t('book.notes')}>
                <Textarea rows={2} placeholder={t('book.notesPlaceholder')} value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </Field>
              {error && <p className="text-bad bg-bad/12 rounded-xl p-3 text-[13px] font-semibold">{error}</p>}
              <p className="text-mute text-[11px] leading-relaxed">{t('book.privacy')}</p>
            </div>
          )}

          {serviceIds.length > 0 && (
            <div className="bg-surface-2 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl p-3.5">
              <Badge tone="brand"><Sparkles className="h-3 w-3" />{t('book.selected', { n: serviceIds.length })}</Badge>
              <Badge tone="accent"><Clock className="h-3 w-3" />{formatDuration(durationMin)}</Badge>
              <Badge tone="good">{money(price)}</Badge>
              {chosenStaff && (
                <Badge tone="neutral"><User className="h-3 w-3" />{chosenStaff.name.split(' ')[0]}</Badge>
              )}
              {day && time && (
                <span className="text-soft ml-auto text-[12px] font-semibold">
                  {formatDateShort(day)} · {time}
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}
