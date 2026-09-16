/** Creazione e modifica di un appuntamento, con controllo sovrapposizioni. */

import { useEffect, useMemo, useState } from 'react'
import { Clock, Trash, TriangleAlert, UserPlus } from 'lucide-react'
import { useSalon } from '@/lib/store'
import { useI18n } from '@/lib/i18n'
import { hasConflict } from '@/lib/selectors'
import { CATEGORY_ICON } from '@/lib/icons'
import { APPOINTMENT_STATUS_LIST, SERVICE_CATEGORIES, type Appointment, type AppointmentStatus, type ID } from '@/lib/types'
import { atTime, cn, dayKey, formatDuration, formatTime, fullName, money, parseDayKey, relativeDay, uid } from '@/lib/utils'
import { Badge, Button, Field, Input, Modal, Select, Textarea } from './ui'
import { WhatsAppButton } from './WhatsAppButton'

export interface AppointmentDraft {
  id?: ID
  clientId: ID
  staffId: ID
  serviceIds: ID[]
  dayKey: string
  time: string
  status: AppointmentStatus
  notes: string
}

export function makeDraft(partial: Partial<AppointmentDraft> = {}): AppointmentDraft {
  return {
    clientId: '', staffId: '', serviceIds: [], dayKey: dayKey(new Date()),
    time: '10:00', status: 'confermato', notes: '', ...partial,
  }
}

export function draftFromAppointment(apt: Appointment): AppointmentDraft {
  const start = new Date(apt.start)
  return {
    id: apt.id, clientId: apt.clientId, staffId: apt.staffId, serviceIds: [...apt.serviceIds],
    dayKey: dayKey(start),
    time: `${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`,
    status: apt.status, notes: apt.notes,
  }
}

export function AppointmentDialog({
  open, draft, onClose,
}: {
  open: boolean
  draft: AppointmentDraft | null
  onClose: () => void
}) {
  const { state, dispatch, quote } = useSalon()
  const { t } = useI18n()
  const [form, setForm] = useState<AppointmentDraft>(makeDraft())
  const [newClient, setNewClient] = useState<{ firstName: string; lastName: string; phone: string } | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (draft) { setForm(draft); setNewClient(null); setError('') }
  }, [draft])

  const { durationMin, price } = quote(form.serviceIds)
  const start = useMemo(() => atTime(parseDayKey(form.dayKey), form.time), [form.dayKey, form.time])

  const conflict = useMemo(
    () => (form.staffId && durationMin > 0 ? hasConflict(state, form.staffId, start, durationMin, form.id) : false),
    [state, form.staffId, form.id, start, durationMin],
  )

  const selectedClient = state.clients.find((c) => c.id === form.clientId)
  const selectedStaff = state.staff.find((s) => s.id === form.staffId)
  const staffCoversDay = selectedStaff?.workDays.includes(start.getDay()) ?? true

  function save() {
    if (form.serviceIds.length === 0) return setError(t('apt.errService'))
    if (!form.staffId) return setError(t('apt.errStaff'))
    if (!form.clientId && !newClient?.firstName) return setError(t('apt.errClient'))

    let clientId = form.clientId
    // Il cliente creato al volo entra in anagrafica con l'appuntamento: l'id si
    // genera qui, così si può collegare subito.
    if (!clientId && newClient?.firstName) {
      clientId = uid('cli')
      dispatch({
        type: 'client/add',
        payload: {
          id: clientId, firstName: newClient.firstName.trim(), lastName: newClient.lastName.trim(),
          phone: newClient.phone.trim(), email: '', birthday: null, notes: '', hairNotes: '',
          tags: ['Nuovo'], marketingConsent: false,
        },
      })
    }

    const payload = {
      clientId, staffId: form.staffId, serviceIds: form.serviceIds,
      start: start.toISOString(), durationMin, status: form.status,
      notes: form.notes, source: 'salone' as const,
    }

    if (form.id) {
      const existing = state.appointments.find((a) => a.id === form.id)
      if (existing) dispatch({ type: 'appointment/update', payload: { ...existing, ...payload } })
    } else {
      dispatch({ type: 'appointment/add', payload })
    }
    onClose()
  }

  const eligibleStaff = state.staff.filter((s) =>
    s.active && (form.serviceIds.length === 0 || form.serviceIds.every((sid) => {
      const svc = state.services.find((x) => x.id === sid)
      return svc ? s.skills.includes(svc.category) : true
    })))

  return (
    <Modal
      open={open} onClose={onClose} size="lg"
      title={form.id ? t('apt.editTitle') : t('apt.newTitle')}
      subtitle={durationMin > 0 ? `${formatDuration(durationMin)} · ${money(price)}` : t('apt.hint')}
      footer={
        <>
          {selectedClient && durationMin > 0 && (
            <WhatsAppButton
              phone={selectedClient.phone} variant="subtle" label={t('wa.confirm')}
              message={t('wa.msgConfirm', {
                name: selectedClient.firstName, salon: state.settings.name,
                when: relativeDay(start), time: form.time,
                services: form.serviceIds.map((id) => state.services.find((s) => s.id === id)?.name).filter(Boolean).join(' + '),
              })}
            />
          )}
          {form.id && (
            <Button variant="danger" className="mr-auto"
              onClick={() => { dispatch({ type: 'appointment/remove', payload: form.id! }); onClose() }}>
              <Trash className="h-4 w-4" />
              {t('common.delete')}
            </Button>
          )}
          <Button variant="secondary" onClick={onClose}>{t('common.cancel')}</Button>
          <Button variant="primary" onClick={save}>
            {form.id ? t('apt.saveChanges') : t('apt.create')}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-soft text-[12px] font-semibold tracking-wide">{t('apt.client')}</span>
            <button type="button"
              onClick={() => {
                setNewClient(newClient ? null : { firstName: '', lastName: '', phone: '' })
                setForm((f) => ({ ...f, clientId: '' }))
              }}
              className="text-brand inline-flex items-center gap-1 text-[12px] font-semibold hover:underline">
              <UserPlus className="h-3.5 w-3.5" />
              {newClient ? t('apt.chooseExisting') : t('apt.newClient')}
            </button>
          </div>

          {newClient ? (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <Input placeholder={t('apt.firstName')} value={newClient.firstName}
                onChange={(e) => setNewClient({ ...newClient, firstName: e.target.value })} />
              <Input placeholder={t('apt.lastName')} value={newClient.lastName}
                onChange={(e) => setNewClient({ ...newClient, lastName: e.target.value })} />
              <Input placeholder={t('apt.phone')} value={newClient.phone}
                onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })} />
            </div>
          ) : (
            <Select value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })}>
              <option value="">{t('apt.selectClient')}</option>
              {[...state.clients].sort((a, b) => a.lastName.localeCompare(b.lastName)).map((c) => (
                <option key={c.id} value={c.id}>{fullName(c)} · {c.phone}</option>
              ))}
            </Select>
          )}
        </div>

        <div>
          <span className="text-soft mb-1.5 block text-[12px] font-semibold tracking-wide">{t('apt.services')}</span>
          <div className="border-line max-h-56 space-y-3 overflow-y-auto rounded-xl border p-3">
            {SERVICE_CATEGORIES.map((cat) => {
              const items = state.services.filter((s) => s.category === cat.id && s.active)
              if (items.length === 0) return null
              const Icon = CATEGORY_ICON[cat.id]
              return (
                <div key={cat.id}>
                  <p className="text-mute mb-1.5 flex items-center gap-1.5 text-[10px] font-bold tracking-[0.12em] uppercase">
                    <Icon className="h-3.5 w-3.5" />
                    {t(`cat.${cat.id}` as never)}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {items.map((svc) => {
                      const on = form.serviceIds.includes(svc.id)
                      return (
                        <button key={svc.id} type="button"
                          onClick={() => setForm((f) => ({
                            ...f,
                            serviceIds: f.serviceIds.includes(svc.id)
                              ? f.serviceIds.filter((s) => s !== svc.id) : [...f.serviceIds, svc.id],
                          }))}
                          className={cn(
                            'rounded-lg border px-2.5 py-1.5 text-[12px] font-semibold transition-all duration-200',
                            on ? 'border-brand bg-brand text-on-brand'
                               : 'border-line bg-surface text-soft hover:border-line-strong hover:text-text',
                          )}>
                          {svc.name}
                          <span className={cn('ml-1.5', on ? 'opacity-70' : 'text-mute')}>{svc.durationMin}′</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Field label={t('apt.date')}>
            <Input type="date" value={form.dayKey} onChange={(e) => setForm({ ...form, dayKey: e.target.value })} />
          </Field>
          <Field label={t('apt.time')}>
            <Input type="time" step={900} value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
          </Field>
          <Field label={t('apt.operator')}>
            <Select value={form.staffId} onChange={(e) => setForm({ ...form, staffId: e.target.value })}>
              <option value="">{t('common.select')}</option>
              {eligibleStaff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </Select>
          </Field>
          <Field label={t('apt.status')}>
            <Select value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as AppointmentStatus })}>
              {APPOINTMENT_STATUS_LIST.map((s) => (
                <option key={s} value={s}>{t(`status.${s}` as never)}</option>
              ))}
            </Select>
          </Field>
        </div>

        <Field label={t('apt.notes')}>
          <Textarea rows={2} placeholder={t('apt.notesPlaceholder')} value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </Field>

        {durationMin > 0 && (
          <div className="bg-surface-2 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl p-3 text-[13px]">
            <span className="flex items-center gap-1.5 font-semibold">
              <Clock className="text-mute h-4 w-4" />
              {form.time} → {formatTime(new Date(start.getTime() + durationMin * 60000))}
            </span>
            <Badge tone="brand">{formatDuration(durationMin)}</Badge>
            <Badge tone="good">{money(price)}</Badge>
          </div>
        )}

        {conflict && (
          <p className="text-warn bg-warn/12 flex items-center gap-2 rounded-xl p-3 text-[13px] font-semibold">
            <TriangleAlert className="h-4 w-4 shrink-0" />
            {t('apt.conflict')}
          </p>
        )}
        {!staffCoversDay && (
          <p className="text-accent bg-accent/12 flex items-center gap-2 rounded-xl p-3 text-[13px] font-semibold">
            <TriangleAlert className="h-4 w-4 shrink-0" />
            {t('apt.dayOff')}
          </p>
        )}
        {error && (
          <p className="text-bad bg-bad/12 rounded-xl p-3 text-[13px] font-semibold">{error}</p>
        )}
      </div>
    </Modal>
  )
}
