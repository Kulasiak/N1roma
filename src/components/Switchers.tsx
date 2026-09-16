/** Selettori di lingua e di versione grafica. */

import { Globe, Palette } from 'lucide-react'
import { LOCALES, useI18n } from '@/lib/i18n'
import { SKINS, type Skin } from '@/lib/theme'
import { cn } from '@/lib/utils'

export function LanguageSwitcher({ compact = false, className }: { compact?: boolean; className?: string }) {
  const { locale, setLocale, t } = useI18n()

  if (compact) {
    return (
      <label className={cn('relative inline-flex items-center', className)}>
        <span className="sr-only">{t('nav.language')}</span>
        <Globe className="text-mute pointer-events-none absolute left-2.5 h-4 w-4" />
        <select
          value={locale}
          onChange={(e) => setLocale(e.target.value as typeof locale)}
          className="border-line bg-surface hover:border-line-strong focus:border-brand h-9 cursor-pointer appearance-none rounded-lg border pr-3 pl-8 text-[13px] font-semibold focus:outline-none"
        >
          {LOCALES.map((l) => <option key={l.id} value={l.id}>{l.short}</option>)}
        </select>
      </label>
    )
  }

  return (
    <div className={cn('bg-surface-2 border-line inline-flex gap-0.5 rounded-xl border p-1', className)}
      role="group" aria-label={t('nav.language')}>
      {LOCALES.map((l) => (
        <button
          key={l.id} type="button" onClick={() => setLocale(l.id)} aria-pressed={locale === l.id}
          className={cn(
            'rounded-lg px-3 py-1.5 text-[13px] font-semibold transition-all duration-200',
            locale === l.id ? 'bg-surface text-text shadow-sm' : 'text-mute hover:text-text',
          )}
        >
          {l.label}
        </button>
      ))}
    </div>
  )
}

/** Le due versioni grafiche, con anteprima dei colori. */
export function SkinSwitcher({
  skin, onChange, compact = false, className,
}: {
  skin: Skin
  onChange: (skin: Skin) => void
  compact?: boolean
  className?: string
}) {
  const { t } = useI18n()

  if (compact) {
    const other = skin === 'seta' ? 'neon' : 'seta'
    const swatch = SKINS.find((s) => s.id === other)!.swatch
    return (
      <button
        type="button"
        onClick={() => onChange(other)}
        title={`${t('nav.skin')}: ${t(`skin.${other}` as never)}`}
        aria-label={`${t('nav.skin')}: ${t(`skin.${other}` as never)}`}
        className={cn(
          'border-line hover:border-line-strong inline-flex h-9 items-center gap-2 rounded-lg border px-2.5 transition-colors',
          className,
        )}
      >
        <Palette className="text-mute h-4 w-4" />
        <span className="flex gap-0.5" aria-hidden="true">
          {swatch.map((c) => (
            <span key={c} className="h-3.5 w-2 rounded-[2px]" style={{ background: c }} />
          ))}
        </span>
      </button>
    )
  }

  return (
    <div className={cn('grid grid-cols-1 gap-3 sm:grid-cols-2', className)}>
      {SKINS.map((s) => {
        const active = skin === s.id
        return (
          <button
            key={s.id} type="button" onClick={() => onChange(s.id)} aria-pressed={active}
            className={cn(
              'flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all',
              active ? 'border-brand bg-brand-soft/50' : 'border-line hover:border-line-strong',
            )}
          >
            <span className="flex shrink-0 gap-1" aria-hidden="true">
              {s.swatch.map((c) => (
                <span key={c} className="h-10 w-4 rounded-md" style={{ background: c }} />
              ))}
            </span>
            <span className="min-w-0">
              <span className="block text-[14px] font-semibold">{t(`skin.${s.id}` as never)}</span>
              <span className="text-mute block text-[12px] leading-snug">
                {t(`skin.${s.id}Desc` as never)}
              </span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
