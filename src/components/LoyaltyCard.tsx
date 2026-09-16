/** Tessera fedeltà digitale: saldo, livello e QR da inquadrare in cassa. */

import { useSalon } from '@/lib/store'
import { useI18n } from '@/lib/i18n'
import { cardUrl, nextTier, pointsEarned, pointsRedeemed, tierOf } from '@/lib/loyalty'
import type { Client } from '@/lib/types'
import { cn, formatDateShort, fullName } from '@/lib/utils'
import { QrCode } from './QrCode'
import { WhatsAppButton } from './WhatsAppButton'
import { Progress } from './ui'

export function LoyaltyCard({
  client, compact = false, className,
}: {
  client: Client
  compact?: boolean
  className?: string
}) {
  const { state } = useSalon()
  const { t } = useI18n()

  const earned = pointsEarned(state, client.id)
  const redeemed = pointsRedeemed(state, client.id)
  const tier = tierOf(earned)
  const next = nextTier(earned)
  const url = cardUrl(state, client)
  const progress = next ? ((earned - tier.min) / (earned + next.missing - tier.min)) * 100 : 100

  return (
    <div
      className={cn('relative overflow-hidden rounded-2xl p-5 text-white shadow-[var(--shadow-lift)]', className)}
      style={{ background: `linear-gradient(135deg, ${tier.tint} 0%, #2F1627 78%)` }}
    >
      <svg className="pointer-events-none absolute -top-8 -right-10 h-40 w-56 opacity-15"
        viewBox="0 0 200 120" fill="none" aria-hidden="true">
        {[0, 26, 52, 78].map((y) => (
          <path key={y} d={`M-10 ${y + 40}c22-30 44-30 66 0s44 30 66 0 44-30 66 0`}
            stroke="white" strokeWidth="5" strokeLinecap="round" />
        ))}
      </svg>

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10px] font-bold tracking-[0.18em] uppercase opacity-70">
            {state.settings.name} · {t('loy.cardTitle')}
          </p>
          <p className="font-display mt-1.5 truncate text-xl font-semibold">{fullName(client)}</p>
          <p className="mt-0.5 font-mono text-[11px] tracking-wider opacity-75">{client.cardCode}</p>
        </div>
        <span className="shrink-0 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase backdrop-blur-sm">
          {t(`tier.${tier.id}` as never)}
        </span>
      </div>

      <div className="relative mt-5 flex items-end gap-5">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold opacity-75">{t('loy.balance')}</p>
          <p className="font-display text-4xl leading-none font-semibold tabular-nums">
            {client.points}
            <span className="ml-1.5 text-base font-medium opacity-70">{t('loy.pointsShort')}</span>
          </p>

          {!compact && (
            <div className="mt-3">
              <Progress value={progress} className="bg-white/20" color="rgba(255,255,255,.85)" />
              <p className="mt-1.5 text-[11px] opacity-80">
                {next
                  ? t('loy.tierNext', { n: next.missing, tier: t(`tier.${next.tier}` as never) })
                  : t('loy.tierMax')}
              </p>
            </div>
          )}
        </div>

        {/* Il QR sta su fondo bianco: condizione perché resti leggibile. */}
        <div className="shrink-0 rounded-xl bg-white p-2">
          <QrCode value={url} size={compact ? 68 : 92} foreground="#1C1714"
            title={`${t('loy.cardCode')} ${client.cardCode}`} />
        </div>
      </div>

      {!compact && (
        <div className="relative mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/20 pt-4 text-[11px]">
          <span><span className="opacity-70">{t('loy.earned')} </span><strong className="font-bold tabular-nums">{earned}</strong></span>
          <span><span className="opacity-70">{t('loy.redeemedLabel')} </span><strong className="font-bold tabular-nums">{redeemed}</strong></span>
          <span className="opacity-70">{t('loy.memberSince', { date: formatDateShort(client.createdAt) })}</span>
          <WhatsAppButton
            className="ml-auto border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
            variant="secondary" phone={client.phone} label={t('wa.sendCard')}
            message={t('wa.msgCard', {
              name: client.firstName, salon: state.settings.name, url, points: client.points,
            })}
          />
        </div>
      )}
    </div>
  )
}
