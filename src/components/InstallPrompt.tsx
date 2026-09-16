/**
 * Invito a installare l'app sulla schermata home.
 * Android e desktop espongono `beforeinstallprompt`: lì basta un pulsante.
 * iOS e iPadOS no, quindi si spiegano i due tocchi da fare in Safari.
 */

import { useEffect, useState } from 'react'
import { Download, Share, SquarePlus, X } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { useSalon } from '@/lib/store'
import { Button } from './ui'
import { Waves } from './Shell'

interface InstallEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISSED = 'onda.install.dismissed'

function isIos(): boolean {
  const ua = navigator.userAgent
  // Da iPadOS 13 Safari si dichiara desktop: si riconosce dal touch.
  return /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)
}

function isStandalone(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
}

export function InstallPrompt() {
  const { t } = useI18n()
  const { state } = useSalon()
  const [deferred, setDeferred] = useState<InstallEvent | null>(null)
  const [iosHint, setIosHint] = useState(false)

  useEffect(() => {
    if (isStandalone()) return
    try {
      if (window.localStorage.getItem(DISMISSED)) return
    } catch {
      // Storage non leggibile: l'invito viene comunque mostrato.
    }
    if (isIos()) { setIosHint(true); return }

    const onPrompt = (e: Event) => { e.preventDefault(); setDeferred(e as InstallEvent) }
    window.addEventListener('beforeinstallprompt', onPrompt)
    return () => window.removeEventListener('beforeinstallprompt', onPrompt)
  }, [])

  function dismiss() {
    setDeferred(null)
    setIosHint(false)
    try {
      window.localStorage.setItem(DISMISSED, '1')
    } catch {
      // Senza persistenza l'invito potrà ricomparire alla prossima visita.
    }
  }

  if (!deferred && !iosHint) return null

  return (
    <div className="animate-rise fixed inset-x-3 bottom-3 z-50 mx-auto max-w-md sm:inset-x-auto sm:right-5 sm:bottom-5">
      <div className="surface-card ring-gradient flex items-start gap-3 p-4 shadow-[var(--shadow-lift)]">
        <span className="bg-grad-brand grid h-11 w-11 shrink-0 place-items-center rounded-xl">
          <Waves />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-semibold">{t('pwa.title', { salon: state.settings.name })}</p>
          {iosHint ? (
            <p className="text-mute mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[12px] leading-relaxed">
              {t('pwa.iosStep1')}
              <Share className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {t('pwa.iosStep2')}
              <SquarePlus className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {t('pwa.iosStep3')}
            </p>
          ) : (
            <>
              <p className="text-mute mt-1 text-[12px] leading-relaxed">{t('pwa.subtitle')}</p>
              <Button variant="primary" size="sm" className="mt-3"
                onClick={async () => {
                  if (!deferred) return
                  await deferred.prompt()
                  await deferred.userChoice
                  dismiss()
                }}>
                <Download className="h-3.5 w-3.5" />
                {t('pwa.install')}
              </Button>
            </>
          )}
        </div>
        <Button variant="ghost" size="icon" onClick={dismiss} aria-label={t('common.close')}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
