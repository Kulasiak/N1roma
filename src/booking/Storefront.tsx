/** Vetrina pubblica: presentazione, listino, team, contatti. */

import { useState } from 'react'
import {
  ArrowRight, AtSign, CalendarCheck, Clock, LayoutDashboard, Mail, MapPin, Moon, Phone, Sparkles, Sun,
} from 'lucide-react'
import { useSalon } from '@/lib/store'
import { useI18n } from '@/lib/i18n'
import { CATEGORY_ICON } from '@/lib/icons'
import { SERVICE_CATEGORIES } from '@/lib/types'
import type { Skin, Theme } from '@/lib/theme'
import { cn, formatDuration, money, weekdayLong } from '@/lib/utils'
import { Avatar, Badge, Button } from '@/components/ui'
import { LanguageSwitcher, SkinSwitcher } from '@/components/Switchers'
import { WhatsAppButton } from '@/components/WhatsAppButton'
import { Waves } from '@/components/Shell'
import { BookingWizard } from './BookingWizard'

export function Storefront({
  theme, onToggleTheme, skin, onSetSkin, onEnterStudio, photoFound,
}: {
  theme: Theme
  onToggleTheme: () => void
  skin: Skin
  onSetSkin: (skin: Skin) => void
  onEnterStudio: () => void
  photoFound: boolean
}) {
  const { state } = useSalon()
  const { t } = useI18n()
  const [booking, setBooking] = useState(false)

  const { settings } = state
  const activeStaff = state.staff.filter((s) => s.active)
  const bookable = state.services.filter((s) => s.active)

  return (
    <div className="min-h-dvh">
      <header className="glass border-line safe-top sticky top-0 z-40 border-b">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
          <a href="#top" className="flex items-center gap-2.5">
            <span className="bg-grad-brand grid h-9 w-9 place-items-center rounded-xl shadow-[var(--glow)]">
              <Waves className="h-4.5 w-4.5" />
            </span>
            <span className="font-display text-lg leading-none font-semibold">{settings.name}</span>
          </a>

          <nav className="text-soft ml-6 hidden items-center gap-6 text-[13px] font-semibold md:flex">
            <a href="#servizi" className="hover:text-text transition-colors">{t('book.navServices')}</a>
            <a href="#team" className="hover:text-text transition-colors">{t('book.navTeam')}</a>
            <a href="#contatti" className="hover:text-text transition-colors">{t('book.navContact')}</a>
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <SkinSwitcher skin={skin} onChange={onSetSkin} compact />
            <LanguageSwitcher compact />
            <Button variant="ghost" size="icon" onClick={onToggleTheme}
              aria-label={theme === 'dark' ? t('nav.themeLight') : t('nav.themeDark')}>
              {theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </Button>
            <span className="hidden sm:inline-flex">
              <Button variant="ghost" size="sm" onClick={onEnterStudio}>
                <LayoutDashboard className="h-4 w-4" />{t('book.manage')}
              </Button>
            </span>
            <Button variant="primary" size="sm" onClick={() => setBooking(true)}>{t('book.bookNow')}</Button>
          </div>
        </div>
      </header>

      {/* --- copertina: la foto è protagonista, il testo sta sullo scrim --- */}
      <section id="top" className="hero-photo" data-photo={photoFound ? 'on' : 'off'}>
        <div className="mx-auto max-w-6xl px-4 py-24 text-white sm:px-6 sm:py-32">
          <div className="animate-rise max-w-2xl">
            <Badge tone="neutral" className="mb-6 border-white/25 bg-white/10 text-white backdrop-blur-sm">
              <Sparkles className="h-3 w-3" />{t('book.heroBadge')}
            </Badge>

            <h1 className="font-display text-4xl leading-[1.05] font-semibold text-balance sm:text-6xl lg:text-7xl">
              {t('book.heroTitle')}{' '}
              <span className="bg-grad-brand bg-clip-text text-transparent">{t('book.heroTitleAccent')}</span>{' '}
              {t('book.heroTitleEnd')}
            </h1>

            <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-balance text-white/80 sm:text-base">
              {t('book.heroText')}
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Button variant="accent" size="lg" onClick={() => setBooking(true)}>
                <CalendarCheck className="h-4.5 w-4.5" />{t('book.heroCta')}
              </Button>
              <Button variant="secondary" size="lg"
                className="border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
                onClick={() => document.getElementById('servizi')?.scrollIntoView({ behavior: 'smooth' })}>
                {t('book.heroSecondary')}<ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            <dl className="mt-14 grid max-w-lg grid-cols-3 gap-6 border-t border-white/20 pt-8">
              {[
                { value: bookable.length, label: t('book.statServices') },
                { value: activeStaff.length, label: t('book.statStylists') },
                { value: 20, label: t('book.statYears') },
              ].map((stat, i) => (
                <div key={stat.label} className="stagger" style={{ ['--i' as string]: i + 2 }}>
                  <dt className="font-display text-3xl font-semibold">{stat.value}</dt>
                  <dd className="mt-1 text-[12px] leading-tight text-white/70">{stat.label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* --- listino --- */}
      <section id="servizi" className="bg-surface border-line border-y">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <header className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="font-display text-3xl font-semibold sm:text-4xl">{t('book.servicesTitle')}</h2>
            <p className="text-mute mt-3 text-[15px] leading-relaxed text-balance">{t('book.servicesLead')}</p>
          </header>

          <div className="space-y-10">
            {SERVICE_CATEGORIES.map((cat) => {
              const items = bookable.filter((s) => s.category === cat.id)
              if (items.length === 0) return null
              const Icon = CATEGORY_ICON[cat.id]
              return (
                <div key={cat.id}>
                  <div className="mb-4 flex items-center gap-3">
                    <span className="bg-grad-brand grid h-9 w-9 place-items-center rounded-xl text-white">
                      <Icon className="h-4.5 w-4.5" />
                    </span>
                    <h3 className="font-display text-xl font-semibold">{t(`cat.${cat.id}` as never)}</h3>
                    <span className="bg-line h-px flex-1" aria-hidden="true" />
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {items.map((svc, i) => (
                      <button key={svc.id} type="button" onClick={() => setBooking(true)}
                        className="surface-card stagger hover:border-brand group p-5 text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]"
                        style={{ ['--i' as string]: Math.min(i, 8) }}>
                        <div className="flex items-start justify-between gap-3">
                          <h4 className="text-[15px] font-semibold">{svc.name}</h4>
                          <span className="font-display shrink-0 text-lg font-semibold">
                            {svc.price === 0 ? t('common.free') : money(svc.price)}
                          </span>
                        </div>
                        <p className="text-mute mt-2 text-[13px] leading-relaxed">{svc.description}</p>
                        <p className="text-soft mt-3 flex items-center gap-1.5 text-[12px] font-semibold">
                          <Clock className="h-3.5 w-3.5" />
                          {formatDuration(svc.durationMin)}
                          <ArrowRight className="ml-auto h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* --- team --- */}
      <section id="team" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <header className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">{t('book.teamTitle')}</h2>
          <p className="text-mute mt-3 text-[15px] leading-relaxed">{t('book.teamLead')}</p>
        </header>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activeStaff.map((member, i) => (
            <article key={member.id} className="surface-card stagger ring-gradient overflow-hidden"
              style={{ ['--i' as string]: i }}>
              <div className="h-24" aria-hidden="true"
                style={{ background: `linear-gradient(130deg, ${member.color}, ${member.color}44)` }} />
              <div className="-mt-9 px-5 pb-5">
                <Avatar name={member.name} color={member.color} size="lg" />
                <h3 className="mt-3 text-base font-semibold">{member.name}</h3>
                <p className="text-mute text-[12px]">{member.role}</p>
                {member.bio && <p className="text-soft mt-2.5 text-[13px] leading-relaxed">{member.bio}</p>}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {member.skills.map((s) => {
                    const Icon = CATEGORY_ICON[s]
                    return (
                      <Badge key={s} tone="neutral">
                        <Icon className="h-3 w-3" />{t(`cat.${s}` as never)}
                      </Badge>
                    )
                  })}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* --- contatti --- */}
      <section id="contatti" className="bg-surface border-line border-t">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
            <div>
              <h2 className="font-display text-3xl font-semibold sm:text-4xl">{t('book.contactTitle')}</h2>
              <p className="text-mute mt-3 text-[15px] leading-relaxed">{t('book.contactLead')}</p>

              <ul className="mt-8 space-y-4">
                {[
                  { icon: MapPin, primary: settings.address, secondary: settings.city },
                  { icon: Phone, primary: settings.phone, secondary: '' },
                  { icon: Mail, primary: settings.email, secondary: '' },
                  { icon: AtSign, primary: settings.instagram, secondary: '' },
                ].map((row) => {
                  const Icon = row.icon
                  return (
                    <li key={row.primary} className="flex items-center gap-3.5">
                      <span className="bg-surface-2 text-brand grid h-10 w-10 shrink-0 place-items-center rounded-xl">
                        <Icon className="h-4.5 w-4.5" />
                      </span>
                      <span>
                        <span className="block text-[14px] font-semibold">{row.primary}</span>
                        {row.secondary && <span className="text-mute block text-[12px]">{row.secondary}</span>}
                      </span>
                    </li>
                  )
                })}
              </ul>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button variant="accent" size="lg" onClick={() => setBooking(true)}>
                  <CalendarCheck className="h-4.5 w-4.5" />{t('book.heroCta')}
                </Button>
                <WhatsAppButton phone={settings.phone} size="md" variant="secondary"
                  className="h-12 px-6 text-[15px]" label={t('wa.chatSalon')}
                  message={t('wa.msgBooking', { salon: settings.name })} />
              </div>
            </div>

            <div className="surface-card p-6">
              <h3 className="font-display mb-4 text-lg font-semibold">{t('book.hours')}</h3>
              <ul className="divide-line divide-y">
                {[1, 2, 3, 4, 5, 6, 0].map((d) => {
                  const open = settings.openDays.includes(d)
                  return (
                    <li key={d} className="flex items-center justify-between py-2.5">
                      <span className={cn('text-[13px] font-medium', !open && 'text-mute')}>{weekdayLong(d)}</span>
                      <span className={cn('text-[13px] font-semibold tabular-nums', !open && 'text-mute font-medium')}>
                        {open ? `${settings.openHour} – ${settings.closeHour}` : t('book.hoursClosed')}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-line border-t">
        <div className="text-mute mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-8 text-[12px] sm:px-6">
          <span className="font-display text-text text-sm font-semibold">{settings.name}</span>
          <span>·</span>
          <span>{settings.tagline}</span>
          <button onClick={onEnterStudio} className="hover:text-text ml-auto transition-colors">
            {t('book.manage')}
          </button>
        </div>
      </footer>

      <BookingWizard open={booking} onClose={() => setBooking(false)} />
    </div>
  )
}
