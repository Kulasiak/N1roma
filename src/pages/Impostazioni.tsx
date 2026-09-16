/** Impostazioni: dati del salone, orari, avvisi, aspetto, lingua, dati. */

import { useState } from 'react'
import { Download, Image as ImageIcon, Moon, RotateCcw, Sun } from 'lucide-react'
import { useSalon } from '@/lib/store'
import { useI18n } from '@/lib/i18n'
import type { SalonSettings } from '@/lib/types'
import type { Skin, Theme } from '@/lib/theme'
import { cn, weekdayShort } from '@/lib/utils'
import { LanguageSwitcher, SkinSwitcher } from '@/components/Switchers'
import { Button, Card, CardHeader, Field, Input, Modal, Select } from '@/components/ui'
import { PageHeader } from '@/components/Shell'

export function Impostazioni({
  theme, onSetTheme, skin, onSetSkin, photoFound,
}: {
  theme: Theme
  onSetTheme: (theme: Theme) => void
  skin: Skin
  onSetSkin: (skin: Skin) => void
  photoFound: boolean
}) {
  const { state, dispatch } = useSalon()
  const { t } = useI18n()
  const [confirmReset, setConfirmReset] = useState(false)

  const update = (patch: Partial<SalonSettings>) => dispatch({ type: 'settings/update', payload: patch })

  function exportData() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `onda-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <PageHeader title={t('nav.settings')} description={t('set.subtitle')} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title={t('set.salonTitle')} subtitle={t('set.salonSub')} />
          <div className="grid grid-cols-1 gap-3 p-5 pt-4 sm:grid-cols-2">
            <Field label={t('set.name')}>
              <Input value={state.settings.name} onChange={(e) => update({ name: e.target.value })} />
            </Field>
            <Field label={t('set.tagline')}>
              <Input value={state.settings.tagline} onChange={(e) => update({ tagline: e.target.value })} />
            </Field>
            <Field label={t('set.address')}>
              <Input value={state.settings.address} onChange={(e) => update({ address: e.target.value })} />
            </Field>
            <Field label={t('set.city')}>
              <Input value={state.settings.city} onChange={(e) => update({ city: e.target.value })} />
            </Field>
            <Field label={t('set.phone')}>
              <Input value={state.settings.phone} onChange={(e) => update({ phone: e.target.value })} />
            </Field>
            <Field label={t('set.email')}>
              <Input type="email" value={state.settings.email} onChange={(e) => update({ email: e.target.value })} />
            </Field>
            <Field label={t('set.instagram')} className="sm:col-span-2">
              <Input value={state.settings.instagram} onChange={(e) => update({ instagram: e.target.value })} />
            </Field>
          </div>
        </Card>

        <Card>
          <CardHeader title={t('set.openingTitle')} subtitle={t('set.openingSub')} />
          <div className="space-y-4 p-5 pt-4">
            <div>
              <span className="text-soft mb-1.5 block text-[12px] font-semibold tracking-wide">{t('set.openDays')}</span>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5, 6, 0].map((d) => (
                  <button key={d} type="button"
                    onClick={() => update({
                      openDays: state.settings.openDays.includes(d)
                        ? state.settings.openDays.filter((x) => x !== d)
                        : [...state.settings.openDays, d].sort(),
                    })}
                    className={cn('h-10 flex-1 rounded-lg text-[12px] font-bold transition-colors',
                      state.settings.openDays.includes(d) ? 'bg-brand text-on-brand' : 'bg-surface-2 text-mute hover:text-text')}>
                    {weekdayShort(d)}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Field label={t('set.openHour')}>
                <Input type="time" step={900} value={state.settings.openHour}
                  onChange={(e) => update({ openHour: e.target.value })} />
              </Field>
              <Field label={t('set.closeHour')}>
                <Input type="time" step={900} value={state.settings.closeHour}
                  onChange={(e) => update({ closeHour: e.target.value })} />
              </Field>
              <Field label={t('set.slotStep')}>
                <Select value={String(state.settings.slotMinutes)}
                  onChange={(e) => update({ slotMinutes: Number(e.target.value) })}>
                  {[10, 15, 20, 30].map((m) => (
                    <option key={m} value={m}>{t('set.minutes', { n: m })}</option>
                  ))}
                </Select>
              </Field>
            </div>

            <p className="bg-surface-2 text-soft rounded-xl p-3.5 text-[12px] leading-relaxed">
              {t('set.summary', {
                days: t('set.summaryDays', { n: state.settings.openDays.length }),
                from: state.settings.openHour, to: state.settings.closeHour, step: state.settings.slotMinutes,
              })}
            </p>
          </div>
        </Card>

        <Card>
          <CardHeader title={t('set.alertTitle')} subtitle={t('set.alertSub')} />
          <div className="p-5 pt-4">
            <Field label={t('set.alertMinutes')}>
              <Select value={String(state.settings.alertMinutes)}
                onChange={(e) => update({ alertMinutes: Number(e.target.value) })}>
                {[5, 10, 15, 20, 30, 45, 60].map((m) => (
                  <option key={m} value={m}>{t('set.minutes', { n: m })}</option>
                ))}
              </Select>
            </Field>
            <p className="bg-surface-2 text-soft mt-3 rounded-xl p-3.5 text-[12px] leading-relaxed">
              {t('board.alertWindow', { n: state.settings.alertMinutes })}
            </p>
          </div>
        </Card>

        <Card>
          <CardHeader title={t('set.appearanceTitle')} subtitle={t('set.appearanceSub')} />
          <div className="space-y-4 p-5 pt-4">
            <SkinSwitcher skin={skin} onChange={onSetSkin} />

            <div className="grid grid-cols-2 gap-3">
              {([
                { id: 'light' as const, label: t('set.light'), icon: Sun },
                { id: 'dark' as const, label: t('set.dark'), icon: Moon },
              ]).map((opt) => {
                const Icon = opt.icon
                const active = theme === opt.id
                return (
                  <button key={opt.id} type="button" onClick={() => onSetTheme(opt.id)}
                    className={cn('flex flex-col items-center gap-2 rounded-xl border-2 p-5 transition-all',
                      active ? 'border-brand bg-brand-soft/50' : 'border-line hover:border-line-strong')}>
                    <Icon className={cn('h-6 w-6', active && 'text-brand')} />
                    <span className="text-[13px] font-semibold">{opt.label}</span>
                  </button>
                )
              })}
            </div>

            {/* Lo sfondo fotografico si attiva da solo quando il file c'è. */}
            <div className="bg-surface-2 flex items-start gap-3 rounded-xl p-3.5">
              <ImageIcon className="text-mute mt-0.5 h-4 w-4 shrink-0" />
              <p className="text-soft text-[12px] leading-relaxed">
                {photoFound
                  ? 'Sfondo fotografico attivo: sta usando public/salone.jpg.'
                  : 'Per usare una tua foto come sfondo, salvala come public/salone.jpg e ricarica. Senza foto resta la texture da studio.'}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title={t('set.languageTitle')} subtitle={t('set.languageSub')} />
          <div className="p-5 pt-4"><LanguageSwitcher /></div>
        </Card>

        <Card>
          <CardHeader title={t('set.whatsappTitle')} subtitle={t('set.whatsappSub')} />
          <div className="p-5 pt-4">
            <Field label={t('set.countryCode')} hint={t('set.countryCodeHint')}>
              <Input value={state.settings.countryCode}
                onChange={(e) => update({ countryCode: e.target.value.replace(/\D/g, '') })} />
            </Field>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title={t('set.dataTitle')} subtitle={t('set.dataSub')} />
          <div className="space-y-3 p-5 pt-4">
            <div className="bg-surface-2 grid grid-cols-2 gap-3 rounded-xl p-4 sm:grid-cols-4">
              {[
                { label: t('set.clients'), value: state.clients.length },
                { label: t('set.appointments'), value: state.appointments.length },
                { label: t('set.receipts'), value: state.sales.length },
                { label: t('set.products'), value: state.products.length },
              ].map((c) => (
                <div key={c.label}>
                  <p className="text-mute text-[11px] font-semibold">{c.label}</p>
                  <p className="mt-0.5 text-lg font-bold tabular-nums">{c.value}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={exportData}>
                <Download className="h-4 w-4" />{t('set.export')}
              </Button>
              <Button variant="danger" onClick={() => setConfirmReset(true)}>
                <RotateCcw className="h-4 w-4" />{t('set.reset')}
              </Button>
            </div>
            <p className="text-mute text-[12px] leading-relaxed">{t('set.resetHint')}</p>
          </div>
        </Card>
      </div>

      <Modal open={confirmReset} onClose={() => setConfirmReset(false)} size="sm"
        title={t('set.confirmTitle')} subtitle={t('set.confirmSub')}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmReset(false)}>{t('common.cancel')}</Button>
            <Button variant="danger"
              onClick={() => { dispatch({ type: 'demo/reset' }); setConfirmReset(false) }}>
              {t('set.confirmBtn')}
            </Button>
          </>
        }>
        <p className="text-soft text-[13px] leading-relaxed">{t('set.resetHint')}</p>
      </Modal>
    </>
  )
}
