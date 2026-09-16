/** Calcoli derivati: disponibilità, bacheca del personale, KPI, statistiche. */

import type { Appointment, ID, SalonState, Staff } from './types'
import { addDays, dayKey, hhmmToMinutes, startOfDay, sum } from './utils'

const BUSY: Appointment['status'][] = ['confermato', 'in_corso', 'completato']

export function occupiesTime(a: Appointment): boolean {
  return BUSY.includes(a.status)
}

export function appointmentsOn(state: SalonState, day: Date): Appointment[] {
  const key = dayKey(day)
  return state.appointments.filter((a) => dayKey(a.start) === key)
    .sort((a, b) => a.start.localeCompare(b.start))
}

/* ------------------------------------------------- bacheca del personale */

export type Phase = 'ora' | 'imminente' | 'attesa' | 'concluso' | 'saltato'

/**
 * In che fase si trova un appuntamento rispetto a "adesso".
 * `imminente` è quello che la bacheca fa lampeggiare.
 */
export function phaseOf(apt: Appointment, now: Date, alertMinutes: number): Phase {
  if (apt.status === 'annullato' || apt.status === 'no_show') return 'saltato'
  if (apt.status === 'completato') return 'concluso'

  const start = new Date(apt.start).getTime()
  const end = start + apt.durationMin * 60000
  const t = now.getTime()

  if (t >= start && t < end) return 'ora'
  if (t >= end) return 'concluso'
  return start - t <= alertMinutes * 60000 ? 'imminente' : 'attesa'
}

export interface BoardRow {
  appointment: Appointment
  phase: Phase
  /** Minuti che mancano all'inizio (negativi se già iniziato). */
  minutesAway: number
}

/** Gli appuntamenti di oggi, ordinati e già classificati per fase. */
export function boardRows(state: SalonState, now: Date): BoardRow[] {
  const alert = state.settings.alertMinutes
  return appointmentsOn(state, now)
    .map((appointment) => ({
      appointment,
      phase: phaseOf(appointment, now, alert),
      minutesAway: Math.round((new Date(appointment.start).getTime() - now.getTime()) / 60000),
    }))
    .sort((a, b) => a.appointment.start.localeCompare(b.appointment.start))
}

/* ----------------------------------------------------- disponibilità */

export interface Slot {
  hhmm: string
  staffId: ID
  start: Date
}

function staffCovers(staff: Staff, day: Date, startMin: number, durationMin: number): boolean {
  if (!staff.active || !staff.workDays.includes(day.getDay())) return false
  return startMin >= hhmmToMinutes(staff.startHour) &&
    startMin + durationMin <= hhmmToMinutes(staff.endHour)
}

export function hasConflict(
  state: SalonState, staffId: ID, start: Date, durationMin: number, ignoreId?: ID,
): boolean {
  const from = start.getTime()
  const to = from + durationMin * 60000
  return state.appointments.some((a) => {
    if (a.staffId !== staffId || a.id === ignoreId || !occupiesTime(a)) return false
    const aFrom = new Date(a.start).getTime()
    return from < aFrom + a.durationMin * 60000 && aFrom < to
  })
}

/** Slot liberi: incrocia apertura, turni, durata e appuntamenti già presi. */
export function availableSlots(
  state: SalonState, day: Date, durationMin: number,
  staffId: ID | null, requiredSkills: string[] = [],
): Slot[] {
  const { settings } = state
  if (!settings.openDays.includes(day.getDay())) return []

  const candidates = state.staff.filter((s) =>
    s.active && (!staffId || s.id === staffId) &&
    requiredSkills.every((skill) => s.skills.includes(skill as Staff['skills'][number])))
  if (candidates.length === 0) return []

  const openMin = hhmmToMinutes(settings.openHour)
  const closeMin = hhmmToMinutes(settings.closeHour)
  const now = Date.now()
  const out: Slot[] = []

  for (let m = openMin; m + durationMin <= closeMin; m += settings.slotMinutes) {
    const start = startOfDay(day)
    start.setMinutes(m)
    if (start.getTime() < now) continue

    const free = candidates.find((s) =>
      staffCovers(s, day, m, durationMin) && !hasConflict(state, s.id, start, durationMin))
    if (free) {
      out.push({
        hhmm: `${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`,
        staffId: free.id, start,
      })
    }
  }
  return out
}

export function nextAvailableDays(
  state: SalonState, from: Date, durationMin: number,
  staffId: ID | null, requiredSkills: string[], count = 12,
): Date[] {
  const days: Date[] = []
  for (let i = 0; i < 60 && days.length < count; i++) {
    const day = addDays(startOfDay(from), i)
    if (availableSlots(state, day, durationMin, staffId, requiredSkills).length > 0) days.push(day)
  }
  return days
}

/* ----------------------------------------------------------------- KPI */

export function revenueBetween(state: SalonState, from: Date, to: Date): number {
  const a = from.getTime(), b = to.getTime()
  return sum(state.sales.filter((s) => {
    const t = new Date(s.createdAt).getTime()
    return t >= a && t < b
  }), (s) => s.total)
}

export function revenueOn(state: SalonState, day: Date): number {
  const from = startOfDay(day)
  return revenueBetween(state, from, addDays(from, 1))
}

export function revenueSeries(state: SalonState, days: number): { day: Date; value: number }[] {
  const today = startOfDay(new Date())
  const buckets = new Map<string, number>()
  for (let i = days - 1; i >= 0; i--) buckets.set(dayKey(addDays(today, -i)), 0)
  for (const sale of state.sales) {
    const key = dayKey(sale.createdAt)
    if (buckets.has(key)) buckets.set(key, buckets.get(key)! + sale.total)
  }
  return [...buckets.entries()].map(([key, value]) => ({ day: new Date(`${key}T00:00:00`), value }))
}

/** Percentuale di minuti occupati sul totale disponibile in un giorno. */
export function occupancyRate(state: SalonState, day: Date): number {
  const working = state.staff.filter((s) => s.active && s.workDays.includes(day.getDay()))
  if (working.length === 0) return 0
  const capacity = sum(working, (s) => hhmmToMinutes(s.endHour) - hhmmToMinutes(s.startHour))
  if (capacity === 0) return 0
  return Math.min(100, (sum(appointmentsOn(state, day).filter(occupiesTime), (a) => a.durationMin) / capacity) * 100)
}

export function lowStockProducts(state: SalonState) {
  return state.products.filter((p) => p.stock <= p.minStock).sort((a, b) => a.stock - b.stock)
}

export function inventoryValue(state: SalonState): number {
  return sum(state.products, (p) => p.stock * p.cost)
}

export function topServices(state: SalonState, from: Date, to: Date, limit = 5) {
  const a = from.getTime(), b = to.getTime()
  const tally = new Map<ID, { name: string; count: number; revenue: number }>()
  for (const sale of state.sales) {
    const t = new Date(sale.createdAt).getTime()
    if (t < a || t >= b) continue
    for (const item of sale.items) {
      if (item.kind !== 'servizio') continue
      const e = tally.get(item.refId) ?? { name: item.name, count: 0, revenue: 0 }
      e.count += item.qty
      e.revenue += item.unitPrice * item.qty
      tally.set(item.refId, e)
    }
  }
  return [...tally.entries()].map(([id, v]) => ({ id, ...v }))
    .sort((x, y) => y.revenue - x.revenue).slice(0, limit)
}

export function staffPerformance(state: SalonState, from: Date, to: Date) {
  const a = from.getTime(), b = to.getTime()
  return state.staff.filter((s) => s.active).map((staff) => {
    const sales = state.sales.filter((s) => {
      const t = new Date(s.createdAt).getTime()
      return s.staffId === staff.id && t >= a && t < b
    })
    const appts = state.appointments.filter((ap) => {
      const t = new Date(ap.start).getTime()
      return ap.staffId === staff.id && t >= a && t < b && ap.status === 'completato'
    })
    const revenue = sum(sales, (s) => s.total)
    return {
      staff, revenue, appointments: appts.length,
      avgTicket: sales.length ? revenue / sales.length : 0,
      commission: (revenue * staff.commissionPct) / 100,
    }
  }).sort((x, y) => y.revenue - x.revenue)
}

export function clientStats(state: SalonState, clientId: ID) {
  const appts = state.appointments.filter((a) => a.clientId === clientId)
    .sort((a, b) => b.start.localeCompare(a.start))
  const sales = state.sales.filter((s) => s.clientId === clientId)
  const totalSpent = sum(sales, (s) => s.total)
  const past = appts.find((a) => new Date(a.start).getTime() < Date.now())
  const upcoming = [...appts].reverse()
    .find((a) => new Date(a.start).getTime() >= Date.now() && occupiesTime(a))

  return {
    appointments: appts,
    visits: appts.filter((a) => a.status === 'completato').length,
    totalSpent,
    avgTicket: sales.length ? totalSpent / sales.length : 0,
    lastVisit: past ? new Date(past.start) : null,
    nextVisit: upcoming ? new Date(upcoming.start) : null,
    noShows: appts.filter((a) => a.status === 'no_show').length,
  }
}

export function clientsAtRisk(state: SalonState, days = 90) {
  const cutoff = Date.now() - days * 86400000
  return state.clients
    .map((client) => ({ client, stats: clientStats(state, client.id) }))
    .filter(({ stats }) => stats.visits > 0 && !stats.nextVisit &&
      stats.lastVisit !== null && stats.lastVisit.getTime() < cutoff)
    .sort((a, b) => a.stats.lastVisit!.getTime() - b.stats.lastVisit!.getTime())
}

export function upcomingBirthdays(state: SalonState, days = 30) {
  const today = startOfDay(new Date())
  const out: { client: SalonState['clients'][number]; date: Date; inDays: number }[] = []
  for (const client of state.clients) {
    if (!client.birthday) continue
    const [, m, d] = client.birthday.split('-').map(Number)
    for (const year of [today.getFullYear(), today.getFullYear() + 1]) {
      const date = new Date(year, m - 1, d)
      const inDays = Math.round((date.getTime() - today.getTime()) / 86400000)
      if (inDays >= 0 && inDays <= days) { out.push({ client, date, inDays }); break }
    }
  }
  return out.sort((a, b) => a.inDays - b.inDays)
}

export function cashSummary(state: SalonState, day: Date) {
  const from = startOfDay(day).getTime()
  const to = from + 86400000
  const sales = state.sales.filter((s) => {
    const t = new Date(s.createdAt).getTime()
    return t >= from && t < to
  })
  const byMethod = { contanti: 0, carta: 0, satispay: 0, bonifico: 0 }
  for (const sale of sales) byMethod[sale.method] += sale.total

  return {
    sales,
    total: sum(sales, (s) => s.total),
    count: sales.length,
    avgTicket: sales.length ? sum(sales, (s) => s.total) / sales.length : 0,
    byMethod,
    services: sum(sales.flatMap((s) => s.items.filter((i) => i.kind === 'servizio')), (i) => i.unitPrice * i.qty),
    products: sum(sales.flatMap((s) => s.items.filter((i) => i.kind === 'prodotto')), (i) => i.unitPrice * i.qty),
  }
}

export function upcomingAppointments(state: SalonState, limit = 6): Appointment[] {
  const now = Date.now()
  return state.appointments
    .filter((a) => new Date(a.start).getTime() >= now && occupiesTime(a))
    .slice(0, limit)
}

export function newClientsBetween(state: SalonState, from: Date, to: Date): number {
  const a = from.getTime(), b = to.getTime()
  return state.clients.filter((c) => {
    const t = new Date(c.createdAt).getTime()
    return t >= a && t < b
  }).length
}
