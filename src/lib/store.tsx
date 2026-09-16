/** Stato globale: reducer unico + persistenza su localStorage. */

import {
  createContext, useCallback, useContext, useEffect, useMemo, useReducer, type ReactNode,
} from 'react'
import type {
  Appointment, AppointmentStatus, Client, ID, LoyaltyEntry, Product, Reward,
  Sale, SalonSettings, SalonState, Service, Staff,
} from './types'
import { STATE_VERSION, buildSeedState } from './seed'
import { makeCardCode } from './loyalty'
import { uid } from './utils'

const STORAGE_KEY = 'onda.salon.v3'

type Action =
  | { type: 'appointment/add'; payload: Omit<Appointment, 'id' | 'createdAt'> }
  | { type: 'appointment/update'; payload: Appointment }
  | { type: 'appointment/status'; payload: { id: ID; status: AppointmentStatus } }
  | { type: 'appointment/remove'; payload: ID }
  | { type: 'client/add'; payload: Omit<Client, 'id' | 'createdAt' | 'cardCode' | 'points'> & { id?: ID } }
  | { type: 'client/update'; payload: Client }
  | { type: 'client/remove'; payload: ID }
  | { type: 'service/add'; payload: Omit<Service, 'id'> }
  | { type: 'service/update'; payload: Service }
  | { type: 'service/remove'; payload: ID }
  | { type: 'staff/add'; payload: Omit<Staff, 'id'> }
  | { type: 'staff/update'; payload: Staff }
  | { type: 'staff/remove'; payload: ID }
  | { type: 'product/add'; payload: Omit<Product, 'id'> }
  | { type: 'product/update'; payload: Product }
  | { type: 'product/stock'; payload: { id: ID; delta: number } }
  | { type: 'product/remove'; payload: ID }
  | { type: 'sale/add'; payload: Omit<Sale, 'id' | 'number' | 'createdAt'> }
  | { type: 'reward/add'; payload: Omit<Reward, 'id'> }
  | { type: 'reward/update'; payload: Reward }
  | { type: 'reward/remove'; payload: ID }
  | { type: 'loyalty/redeem'; payload: { clientId: ID; rewardId: ID } }
  | { type: 'settings/update'; payload: Partial<SalonSettings> }
  | { type: 'settings/loyalty'; payload: Partial<SalonSettings['loyalty']> }
  | { type: 'demo/reset' }

function ledgerEntry(
  clientId: ID, points: number, reason: LoyaltyEntry['reason'],
  extra: Partial<Pick<LoyaltyEntry, 'saleId' | 'rewardId' | 'note'>> = {},
): LoyaltyEntry {
  return {
    id: uid('loy'), clientId, points, reason,
    saleId: extra.saleId ?? null, rewardId: extra.rewardId ?? null,
    note: extra.note ?? '', createdAt: new Date().toISOString(),
  }
}

function reducer(state: SalonState, action: Action): SalonState {
  switch (action.type) {
    case 'appointment/add':
      return {
        ...state,
        appointments: [...state.appointments,
          { ...action.payload, id: uid('apt'), createdAt: new Date().toISOString() },
        ].sort((a, b) => a.start.localeCompare(b.start)),
      }
    case 'appointment/update':
      return {
        ...state,
        appointments: state.appointments.map((a) => (a.id === action.payload.id ? action.payload : a))
          .sort((a, b) => a.start.localeCompare(b.start)),
      }
    case 'appointment/status':
      return {
        ...state,
        appointments: state.appointments.map((a) =>
          a.id === action.payload.id ? { ...a, status: action.payload.status } : a),
      }
    case 'appointment/remove':
      return { ...state, appointments: state.appointments.filter((a) => a.id !== action.payload) }

    case 'client/add': {
      const id = action.payload.id ?? uid('cli')
      const welcome = state.settings.loyalty.enabled ? state.settings.loyalty.welcomePoints : 0
      const client: Client = {
        ...action.payload, id, createdAt: new Date().toISOString(),
        cardCode: makeCardCode(), points: welcome,
      }
      return {
        ...state,
        clients: [client, ...state.clients],
        loyaltyLedger: welcome
          ? [...state.loyaltyLedger, ledgerEntry(id, welcome, 'benvenuto')]
          : state.loyaltyLedger,
      }
    }
    case 'client/update':
      return { ...state, clients: state.clients.map((c) => (c.id === action.payload.id ? action.payload : c)) }
    case 'client/remove':
      return {
        ...state,
        clients: state.clients.filter((c) => c.id !== action.payload),
        appointments: state.appointments.filter((a) => a.clientId !== action.payload),
      }

    case 'service/add':
      return { ...state, services: [...state.services, { ...action.payload, id: uid('srv') }] }
    case 'service/update':
      return { ...state, services: state.services.map((s) => (s.id === action.payload.id ? action.payload : s)) }
    case 'service/remove':
      return { ...state, services: state.services.filter((s) => s.id !== action.payload) }

    case 'staff/add':
      return { ...state, staff: [...state.staff, { ...action.payload, id: uid('stf') }] }
    case 'staff/update':
      return { ...state, staff: state.staff.map((s) => (s.id === action.payload.id ? action.payload : s)) }
    case 'staff/remove':
      return { ...state, staff: state.staff.filter((s) => s.id !== action.payload) }

    case 'product/add':
      return { ...state, products: [...state.products, { ...action.payload, id: uid('prd') }] }
    case 'product/update':
      return { ...state, products: state.products.map((p) => (p.id === action.payload.id ? action.payload : p)) }
    case 'product/stock':
      return {
        ...state,
        products: state.products.map((p) =>
          p.id === action.payload.id ? { ...p, stock: Math.max(0, p.stock + action.payload.delta) } : p),
      }
    case 'product/remove':
      return { ...state, products: state.products.filter((p) => p.id !== action.payload) }

    case 'sale/add': {
      const number = state.sales.reduce((max, s) => Math.max(max, s.number), 0) + 1
      const sale: Sale = { ...action.payload, id: uid('sal'), number, createdAt: new Date().toISOString() }

      // Un incasso fa tre cose insieme: scarica il magazzino, chiude
      // l'appuntamento collegato e accredita i punti. Mai una senza le altre.
      const products = state.products.map((p) => {
        const line = sale.items.find((it) => it.kind === 'prodotto' && it.refId === p.id)
        return line ? { ...p, stock: Math.max(0, p.stock - line.qty) } : p
      })
      const appointments = sale.appointmentId
        ? state.appointments.map((a) =>
            a.id === sale.appointmentId ? { ...a, status: 'completato' as const } : a)
        : state.appointments
      const earned = state.settings.loyalty.enabled && sale.clientId
        ? Math.max(0, Math.round(sale.total * state.settings.loyalty.pointsPerEuro)) : 0
      const clients = earned
        ? state.clients.map((c) => (c.id === sale.clientId ? { ...c, points: c.points + earned } : c))
        : state.clients
      const loyaltyLedger = earned && sale.clientId
        ? [...state.loyaltyLedger, ledgerEntry(sale.clientId, earned, 'acquisto', { saleId: sale.id })]
        : state.loyaltyLedger

      return { ...state, sales: [sale, ...state.sales], products, appointments, clients, loyaltyLedger }
    }

    case 'reward/add':
      return { ...state, rewards: [...state.rewards, { ...action.payload, id: uid('rwd') }] }
    case 'reward/update':
      return { ...state, rewards: state.rewards.map((r) => (r.id === action.payload.id ? action.payload : r)) }
    case 'reward/remove':
      return { ...state, rewards: state.rewards.filter((r) => r.id !== action.payload) }

    case 'loyalty/redeem': {
      const reward = state.rewards.find((r) => r.id === action.payload.rewardId)
      const client = state.clients.find((c) => c.id === action.payload.clientId)
      // Un premio si riscatta solo se il saldo lo copre davvero.
      if (!reward || !client || client.points < reward.cost) return state
      return {
        ...state,
        clients: state.clients.map((c) =>
          c.id === client.id ? { ...c, points: c.points - reward.cost } : c),
        loyaltyLedger: [...state.loyaltyLedger,
          ledgerEntry(client.id, -reward.cost, 'riscatto', { rewardId: reward.id, note: reward.name })],
      }
    }

    case 'settings/update':
      return { ...state, settings: { ...state.settings, ...action.payload } }
    case 'settings/loyalty':
      return { ...state, settings: { ...state.settings, loyalty: { ...state.settings.loyalty, ...action.payload } } }

    case 'demo/reset':
      return buildSeedState()

    default:
      return state
  }
}

function loadState(): SalonState {
  if (typeof window === 'undefined') return buildSeedState()
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return buildSeedState()
    const parsed = JSON.parse(raw) as SalonState
    // Dati di una versione precedente: si riparte dal seed invece di rompersi.
    return parsed.version === STATE_VERSION ? parsed : buildSeedState()
  } catch {
    return buildSeedState()
  }
}

interface SalonContextValue {
  state: SalonState
  dispatch: React.Dispatch<Action>
  serviceById: (id: ID) => Service | undefined
  staffById: (id: ID) => Staff | undefined
  clientById: (id: ID) => Client | undefined
  quote: (serviceIds: ID[]) => { durationMin: number; price: number }
}

const SalonContext = createContext<SalonContextValue | null>(null)

export function SalonProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // Quota piena o storage bloccato: l'app resta usabile in memoria.
    }
  }, [state])

  const serviceById = useCallback((id: ID) => state.services.find((s) => s.id === id), [state.services])
  const staffById = useCallback((id: ID) => state.staff.find((s) => s.id === id), [state.staff])
  const clientById = useCallback((id: ID) => state.clients.find((c) => c.id === id), [state.clients])

  const quote = useCallback((serviceIds: ID[]) => {
    let durationMin = 0, price = 0
    for (const id of serviceIds) {
      const svc = state.services.find((s) => s.id === id)
      if (!svc) continue
      durationMin += svc.durationMin
      price += svc.price
    }
    return { durationMin, price }
  }, [state.services])

  const value = useMemo(
    () => ({ state, dispatch, serviceById, staffById, clientById, quote }),
    [state, serviceById, staffById, clientById, quote],
  )

  return <SalonContext.Provider value={value}>{children}</SalonContext.Provider>
}

export function useSalon(): SalonContextValue {
  const ctx = useContext(SalonContext)
  if (!ctx) throw new Error('useSalon deve essere usato dentro <SalonProvider>')
  return ctx
}
