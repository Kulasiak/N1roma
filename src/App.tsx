/** Punto di ingresso: vetrina pubblica o gestionale. */

import { useCallback, useEffect, useState } from 'react'
import { SalonProvider } from '@/lib/store'
import { I18nProvider } from '@/lib/i18n'
import { usePhotoBackground, useSkin, useTheme } from '@/lib/theme'
import { Shell, type PageId } from '@/components/Shell'
import { InstallPrompt } from '@/components/InstallPrompt'
import { Storefront } from '@/booking/Storefront'
import { Bacheca } from '@/pages/Bacheca'
import { Dashboard } from '@/pages/Dashboard'
import { Agenda } from '@/pages/Agenda'
import { Clienti } from '@/pages/Clienti'
import { Servizi } from '@/pages/Servizi'
import { Team } from '@/pages/Team'
import { Fedelta } from '@/pages/Fedelta'
import { Magazzino } from '@/pages/Magazzino'
import { Cassa } from '@/pages/Cassa'
import { Statistiche } from '@/pages/Statistiche'
import { Impostazioni } from '@/pages/Impostazioni'

const PAGES: PageId[] = [
  'bacheca', 'dashboard', 'agenda', 'clienti', 'servizi', 'staff',
  'fedelta', 'magazzino', 'cassa', 'statistiche', 'impostazioni',
]

/** L'URL è la fonte di verità: `#/studio/agenda` apre l'agenda. */
function readHash(): { studio: boolean; page: PageId } {
  const hash = window.location.hash.replace(/^#\/?/, '')
  const [section, page] = hash.split('/')
  if (section !== 'studio') return { studio: false, page: 'bacheca' }
  return { studio: true, page: PAGES.includes(page as PageId) ? (page as PageId) : 'bacheca' }
}

export default function App() {
  return (
    <I18nProvider>
      <SalonProvider>
        <Router />
      </SalonProvider>
    </I18nProvider>
  )
}

function Router() {
  const { theme, setTheme, toggle } = useTheme()
  const { skin, setSkin } = useSkin()
  const photoFound = usePhotoBackground()
  const [route, setRoute] = useState(readHash)

  useEffect(() => {
    const onHash = () => setRoute(readHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const navigate = useCallback((page: PageId) => { window.location.hash = `/studio/${page}` }, [])
  const enterStudio = useCallback(() => { window.location.hash = '/studio/bacheca' }, [])
  const exitStudio = useCallback(() => {
    window.location.hash = '/'
    window.scrollTo({ top: 0 })
  }, [])

  if (!route.studio) {
    return (
      <>
        <Storefront theme={theme} onToggleTheme={toggle} skin={skin} onSetSkin={setSkin}
          onEnterStudio={enterStudio} photoFound={photoFound} />
        <InstallPrompt />
      </>
    )
  }

  return (
    <div className="studio-bg" data-photo={photoFound ? 'on' : 'off'}>
      <Shell page={route.page} onNavigate={navigate} theme={theme} onToggleTheme={toggle}
        skin={skin} onSetSkin={setSkin} onExit={exitStudio}>
        {route.page === 'bacheca' && <Bacheca />}
        {route.page === 'dashboard' && <Dashboard onNavigate={navigate} />}
        {route.page === 'agenda' && <Agenda />}
        {route.page === 'clienti' && <Clienti />}
        {route.page === 'servizi' && <Servizi />}
        {route.page === 'staff' && <Team />}
        {route.page === 'fedelta' && <Fedelta />}
        {route.page === 'magazzino' && <Magazzino />}
        {route.page === 'cassa' && <Cassa />}
        {route.page === 'statistiche' && <Statistiche />}
        {route.page === 'impostazioni' && (
          <Impostazioni theme={theme} onSetTheme={setTheme} skin={skin} onSetSkin={setSkin} photoFound={photoFound} />
        )}
      </Shell>
      <InstallPrompt />
    </div>
  )
}
