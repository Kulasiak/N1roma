/** Programma fedeltà: tessere, punti, livelli, riscatti. */

import { LOYALTY_TIERS, type Client, type ID, type LoyaltyTierId, type SalonState } from './types'

/** Codice tessera leggibile: ONDA-7F3K9Q (niente caratteri ambigui). */
export function makeCardCode(prefix = 'ONDA'): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) code += alphabet[Math.floor(Math.random() * alphabet.length)]
  return `${prefix}-${code}`
}

export function pointsEarned(state: SalonState, clientId: ID): number {
  return state.loyaltyLedger.filter((e) => e.clientId === clientId && e.points > 0)
    .reduce((a, e) => a + e.points, 0)
}

export function pointsRedeemed(state: SalonState, clientId: ID): number {
  return state.loyaltyLedger.filter((e) => e.clientId === clientId && e.points < 0)
    .reduce((a, e) => a - e.points, 0)
}

/** Il livello dipende dai punti maturati nel tempo, non dal saldo residuo. */
export function tierOf(earned: number) {
  let current = LOYALTY_TIERS[0]
  for (const tier of LOYALTY_TIERS) if (earned >= tier.min) current = tier
  return current
}

export function nextTier(earned: number): { tier: LoyaltyTierId; missing: number } | null {
  const up = LOYALTY_TIERS.find((t) => earned < t.min)
  return up ? { tier: up.id, missing: up.min - earned } : null
}

export function pointsForAmount(state: SalonState, amount: number): number {
  if (!state.settings.loyalty.enabled) return 0
  return Math.max(0, Math.round(amount * state.settings.loyalty.pointsPerEuro))
}

export function cardUrl(state: SalonState, client: Client): string {
  return `${state.settings.loyalty.cardBaseUrl.replace(/\/+$/, '')}/${client.cardCode}`
}

export function ledgerOf(state: SalonState, clientId: ID) {
  return state.loyaltyLedger.filter((e) => e.clientId === clientId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function loyaltySummary(state: SalonState) {
  const issued = state.loyaltyLedger.filter((e) => e.points > 0).reduce((a, e) => a + e.points, 0)
  const redeemed = state.loyaltyLedger.filter((e) => e.points < 0).reduce((a, e) => a - e.points, 0)
  const members = state.clients.filter((c) => pointsEarned(state, c.id) > 0)
  return {
    issued, redeemed,
    outstanding: state.clients.reduce((a, c) => a + c.points, 0),
    members: members.length,
    redemptionRate: issued > 0 ? (redeemed / issued) * 100 : 0,
    byTier: LOYALTY_TIERS.map((tier) => ({
      tier,
      count: members.filter((c) => tierOf(pointsEarned(state, c.id)).id === tier.id).length,
    })),
  }
}

export function topMembers(state: SalonState, limit = 8) {
  return state.clients
    .map((client) => {
      const earned = pointsEarned(state, client.id)
      return { client, earned, tier: tierOf(earned) }
    })
    .filter((r) => r.earned > 0)
    .sort((a, b) => b.earned - a.earned)
    .slice(0, limit)
}
