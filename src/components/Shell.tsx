/** Layout del gestionale: barra laterale, testata, navigazione mobile. */

import { useState, type ReactNode } from 'react'
import {
  CalendarDays, ChartColumn, ChevronLeft, Gift, LayoutDashboard, Menu, MonitorPlay,
  Moon, Package, Scissors, Settings, Sparkles, Sun, Users, Wallet, X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSalon } from '@/lib/store'
import { useI18n, type TranslationKey } from '@/lib/i18n'
import type { Skin, Theme } from '@/lib/theme'
import { Avatar, Button } from './ui'
import { LanguageSwitcher, SkinSwitcher } from './Switchers'

export type PageId =
  | 'bacheca' | 'dashboard' | 'agenda' | 'clienti' | 'servizi' | 'staff'
  | 'fedelta' | 'magazzino' | 'cassa' | 'statistiche' | 'impostazioni'

interface NavItem {
  id: PageId
  labelKey: TranslationKey
  groupKey: TranslationKey
  icon: typeof LayoutDashboard
}

export const NAV: NavItem[] = [
  { id: 'bacheca', labelKey: 'nav.board', groupKey: 'nav.groupOverview', icon: MonitorPlay },
  { id: 'dashboard', labelKey: 'nav.dashboard', groupKey: 'nav.groupOverview', icon: LayoutDashboard },
  { id: 'agenda', labelKey: 'nav.agenda', groupKey: 'nav.groupOverview', icon: CalendarDays },
  { id: 'clienti', labelKey: 'nav.clients', groupKey: 'nav.groupSalon', icon: Users },
  { id: 'servizi', labelKey: 'nav.services', groupKey: 'nav.groupSalon', icon: Scissors },
  { id: 'staff', labelKey: 'nav.team', groupKey: 'nav.groupSalon', icon: Sparkles },
  { id: 'fedelta', labelKey: 'nav.loyalty', groupKey: 'nav.groupSalon', icon: Gift },
  { id: 'magazzino', labelKey: 'nav.inventory', groupKey: 'nav.groupManagement', icon: Package },
  { id: 'cassa', labelKey: 'nav.cash', groupKey: 'nav.groupManagement', icon: Wallet },
  { id: 'statistiche', labelKey: 'nav.stats', groupKey: 'nav.groupManagement', icon: ChartColumn },
  { id: 'impostazioni', labelKey: 'nav.settings', groupKey: 'nav.groupManagement', icon: Settings },
]

export function Shell({
  page, onNavigate, theme, onToggleTheme, skin, onSetSkin, onExit, children,
}: {
  page: PageId
  onNavigate: (page: PageId) => void
  theme: Theme
  onToggleTheme: () => void
  skin: Skin
  onSetSkin: (skin: Skin) => void
  onExit: () => void
  children: ReactNode
}) {
  const { state } = useSalon()
  const { t } = useI18n()
  const [mobileOpen, setMobileOpen] = useState(false)

  const groups = [...new Set(NAV.map((n) => n.groupKey))]

  const nav = (
    <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
      {groups.map((group) => (
        <div key={group}>
          <p className="text-mute px-3 pb-2 text-[10px] font-bold tracking-[0.14em] uppercase">{t(group)}</p>
          <ul className="space-y-1">
            {NAV.filter((n) => n.groupKey === group).map((item) => {
              const Icon = item.icon
              const active = page === item.id
              return (
                <li key={item.id}>
                  <button
                    onClick={() => { onNavigate(item.id); setMobileOpen(false) }}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200',
                      active
                        ? 'bg-brand text-on-brand shadow-[0_8px_20px_-10px_var(--brand)]'
                        : 'text-soft hover:bg-surface-2 hover:text-text',
                    )}
                  >
                    <Icon className={cn('h-4.5 w-4.5 shrink-0 transition-transform duration-200',
                      !active && 'group-hover:scale-110')} />
                    {t(item.labelKey)}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )

  const brand = (
    <div className="flex items-center gap-3 px-5 pt-5 pb-1">
      <div className="bg-grad-brand grid h-10 w-10 place-items-center rounded-2xl shadow-[var(--glow)]">
        <Waves />
      </div>
      <div className="min-w-0">
        <p className="font-display text-lg leading-none font-semibold">{state.settings.name}</p>
        <p className="text-mute mt-1 text-[11px] tracking-wide">{state.settings.tagline}</p>
      </div>
    </div>
  )

  const exitButton = (
    <Button variant="ghost" className="w-full justify-start gap-3" onClick={onExit}>
      <ChevronLeft className="h-4 w-4" />
      {t('nav.storefront')}
    </Button>
  )

  return (
    <div className="flex min-h-dvh">
      <aside className="border-line bg-surface sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r lg:flex">
        {brand}
        {nav}
        <div className="border-line border-t p-3">{exitButton}</div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
            onClick={() => setMobileOpen(false)} aria-hidden="true" />
          <aside className="animate-rise bg-surface border-line absolute inset-y-0 left-0 flex w-72 flex-col border-r">
            <div className="flex items-start justify-between">
              {brand}
              <Button variant="ghost" size="icon" className="mt-5 mr-3"
                onClick={() => setMobileOpen(false)} aria-label={t('nav.closeMenu')}>
                <X className="h-4.5 w-4.5" />
              </Button>
            </div>
            {nav}
            <div className="border-line border-t p-3">{exitButton}</div>
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="glass border-line safe-top sticky top-0 z-30 flex h-16 items-center gap-3 border-b px-4 sm:px-6">
          <Button variant="ghost" size="icon" className="lg:hidden"
            onClick={() => setMobileOpen(true)} aria-label={t('nav.openMenu')}>
            <Menu className="h-5 w-5" />
          </Button>

          <h1 className="font-display truncate text-xl font-semibold">
            {t(NAV.find((n) => n.id === page)?.labelKey ?? 'nav.dashboard')}
          </h1>

          <div className="ml-auto flex items-center gap-2">
            <SkinSwitcher skin={skin} onChange={onSetSkin} compact />
            <span className="hidden sm:inline-flex">
              <LanguageSwitcher compact />
            </span>
            <Button variant="ghost" size="icon" onClick={onToggleTheme}
              aria-label={theme === 'dark' ? t('nav.themeLight') : t('nav.themeDark')}>
              {theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </Button>
            <div className="border-line hidden items-center gap-2.5 rounded-full border py-1 pr-3 pl-1 sm:flex">
              <Avatar name={state.staff[0]?.name ?? 'Salone'} size="sm" color={state.staff[0]?.color} />
              <div className="leading-tight">
                <p className="text-[12px] font-semibold">{state.staff[0]?.name.split(' ')[0]}</p>
                <p className="text-mute text-[10px]">{t('nav.owner')}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  )
}

export function Waves({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden="true">
      <path d="M6 20c2.5-4.5 5-4.5 7.5 0s5 4.5 7.5 0 5-4.5 7.5 0" stroke="white" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M6 13c2.5-4.5 5-4.5 7.5 0s5 4.5 7.5 0 5-4.5 7.5 0" stroke="white" strokeOpacity=".6" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  )
}

export function PageHeader({
  title, description, actions,
}: {
  title: string
  description?: string
  actions?: ReactNode
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 className="font-display text-2xl font-semibold sm:text-3xl">{title}</h2>
        {description && <p className="text-mute mt-1.5 text-sm">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}
