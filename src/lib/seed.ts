/**
 * Dataset dimostrativo del salone.
 * Le date sono relative a "oggi": agenda e bacheca sono popolate a ogni avvio.
 */

import type {
  Appointment, AppointmentStatus, Client, LoyaltyEntry, Product, Reward,
  Sale, SaleItem, SalonSettings, SalonState, Service, Staff,
} from './types'
import { addDays, atTime, dayKey, makeRng, pick, randInt, startOfDay } from './utils'
import { makeCardCode } from './loyalty'

export const STATE_VERSION = 3

const SETTINGS: SalonSettings = {
  name: 'ONDA',
  tagline: 'Hair Atelier',
  address: 'Via della Spiga 24',
  city: '20121 Milano',
  phone: '+39 02 8945 1120',
  email: 'ciao@ondahair.it',
  instagram: '@onda.hair',
  openDays: [2, 3, 4, 5, 6],
  openHour: '09:00',
  closeHour: '19:30',
  slotMinutes: 15,
  countryCode: '39',
  alertMinutes: 15,
  loyalty: { enabled: true, pointsPerEuro: 1, welcomePoints: 50, cardBaseUrl: 'https://onda.hair/c' },
}

const S = (id: string, name: string, category: Service['category'], durationMin: number, price: number, description: string): Service =>
  ({ id, name, category, durationMin, price, description, active: true })

const SERVICES: Service[] = [
  S('srv_taglio_donna', 'Taglio Donna', 'taglio', 45, 45, 'Consulenza di forma, taglio su misura e styling finale.'),
  S('srv_taglio_uomo', 'Taglio Uomo', 'taglio', 30, 30, 'Taglio a forbice o macchinetta, rifinitura e styling.'),
  S('srv_taglio_bimbo', 'Taglio Bambino', 'taglio', 25, 20, 'Fino a 12 anni, con la pazienza che serve.'),
  S('srv_frangia', 'Rifinitura Frangia', 'taglio', 15, 12, 'Ritocco veloce fra un appuntamento e l’altro.'),
  S('srv_colore', 'Colore Completo', 'colore', 90, 68, 'Colorazione a lunga tenuta con protezione della fibra.'),
  S('srv_ritocco', 'Ritocco Ricrescita', 'colore', 60, 48, 'Copertura radice uniforme, senza demarcazioni.'),
  S('srv_balayage', 'Balayage', 'colore', 150, 130, 'Schiariture dipinte a mano libera, effetto naturale.'),
  S('srv_shatush', 'Shatush', 'colore', 135, 115, 'Degradé luminoso concentrato sulle lunghezze.'),
  S('srv_colpi_sole', 'Colpi di Sole', 'colore', 120, 95, 'Meches sottili con stagnola, riflessi su misura.'),
  S('srv_tonalizzante', 'Tonalizzante', 'colore', 35, 32, 'Corregge il riflesso e ravviva il biondo.'),
  S('srv_piega', 'Piega', 'piega', 30, 28, 'Phon e spazzola, liscia o mossa.'),
  S('srv_piega_lunga', 'Piega Capelli Lunghi', 'piega', 45, 36, 'Per lunghezze importanti e capelli folti.'),
  S('srv_acconciatura', 'Acconciatura Cerimonia', 'piega', 75, 85, 'Raccolti e semi-raccolti per eventi e matrimoni.'),
  S('srv_ristrutturante', 'Trattamento Ristrutturante', 'trattamento', 40, 42, 'Ricostruzione della cheratina per capelli stressati.'),
  S('srv_idratante', 'Maschera Idratante', 'trattamento', 25, 25, 'Nutrimento profondo con massaggio in cute.'),
  S('srv_botox', 'Botox Capillare', 'trattamento', 90, 110, 'Riempie la fibra, riduce il crespo per settimane.'),
  S('srv_barba', 'Barba Scolpita', 'barba', 25, 20, 'Rasoio, contorni netti e olio finale.'),
  S('srv_barba_lux', 'Rasatura Tradizionale', 'barba', 40, 32, 'Panno caldo, rasoio a mano libera, balsamo lenitivo.'),
  S('srv_consulenza', 'Consulenza Immagine', 'extra', 30, 0, 'Analisi di viso, incarnato e stile. Offerta dal salone.'),
  S('srv_extension', 'Extension Cheratina', 'extra', 180, 240, 'Applicazione ciocca a ciocca, capello naturale.'),
]

const STAFF: Staff[] = [
  { id: 'stf_giulia', name: 'Giulia Ferrante', role: 'Titolare · Master Colorist', color: '#7A3763',
    skills: ['colore', 'taglio', 'trattamento', 'extra'], commissionPct: 0, workDays: [2, 3, 4, 5, 6],
    startHour: '09:00', endHour: '19:30', phone: '+39 335 118 4420', email: 'giulia@ondahair.it',
    bio: 'Vent’anni di mestiere e una passione ostinata per il biondo fatto bene.', active: true },
  { id: 'stf_marco', name: 'Marco Bellini', role: 'Senior Hair Stylist', color: '#E8946A',
    skills: ['taglio', 'barba', 'piega'], commissionPct: 22, workDays: [2, 3, 4, 5, 6],
    startHour: '10:00', endHour: '19:30', phone: '+39 340 552 7781', email: 'marco@ondahair.it',
    bio: 'Taglio maschile sartoriale e barba scolpita al millimetro.', active: true },
  { id: 'stf_sofia', name: 'Sofia Ricci', role: 'Colorist', color: '#0891B2',
    skills: ['colore', 'trattamento', 'piega'], commissionPct: 18, workDays: [3, 4, 5, 6],
    startHour: '09:30', endHour: '18:30', phone: '+39 349 220 3390', email: 'sofia@ondahair.it',
    bio: 'Specialista di balayage e schiariture su capelli scuri.', active: true },
  { id: 'stf_luca', name: 'Luca Moretti', role: 'Hair Stylist', color: '#8AA681',
    skills: ['taglio', 'piega', 'barba', 'extra'], commissionPct: 16, workDays: [2, 4, 5, 6],
    startHour: '10:00', endHour: '19:00', phone: '+39 366 771 0245', email: 'luca@ondahair.it',
    bio: 'Ricci e capelli mossi: struttura, leggerezza, movimento.', active: true },
  { id: 'stf_alice', name: 'Alice Fontana', role: 'Junior Stylist', color: '#D97706',
    skills: ['piega', 'trattamento', 'taglio'], commissionPct: 12, workDays: [2, 3, 5, 6],
    startHour: '09:00', endHour: '18:00', phone: '+39 351 908 6612', email: 'alice@ondahair.it',
    bio: 'Pieghe impeccabili e la mano più delicata del salone.', active: true },
]

const P = (id: string, name: string, brand: string, sku: string, stock: number, minStock: number, cost: number, price: number, unit: string): Product =>
  ({ id, name, brand, sku, stock, minStock, cost, price, unit })

const PRODUCTS: Product[] = [
  P('prd_1', 'Shampoo Nutriente 250ml', 'Kérastase', 'KRS-NUT-250', 14, 6, 12.5, 27, 'flacone'),
  P('prd_2', 'Maschera Blond Absolu', 'Kérastase', 'KRS-BLD-200', 5, 6, 18, 39, 'vaso'),
  P('prd_3', 'Olio Elixir Ultime', 'Kérastase', 'KRS-ELX-100', 9, 4, 16, 35, 'flacone'),
  P('prd_4', 'Tinta Majirel 7.3', "L'Oréal", 'LOR-MJ-73', 22, 10, 6.2, 0, 'tubo'),
  P('prd_5', 'Tinta Majirel 6.0', "L'Oréal", 'LOR-MJ-60', 8, 10, 6.2, 0, 'tubo'),
  P('prd_6', 'Ossigeno 20 vol 1L', "L'Oréal", 'LOR-OX-20', 11, 5, 4.8, 0, 'flacone'),
  P('prd_7', 'Decolorante Platinium', "L'Oréal", 'LOR-PLT-500', 3, 4, 21, 0, 'busta'),
  P('prd_8', 'Spray Termoprotettore', 'Davines', 'DVN-THP-150', 16, 6, 10, 24, 'flacone'),
  P('prd_9', 'Cera Modellante', 'Davines', 'DVN-WAX-75', 19, 8, 7.5, 19, 'vaso'),
  P('prd_10', 'Lacca Flessibile 400ml', 'Davines', 'DVN-LAC-400', 7, 6, 8.4, 21, 'bomboletta'),
  P('prd_11', 'Balsamo Ricci', 'Olaplex', 'OLX-CRL-250', 12, 5, 15, 32, 'flacone'),
  P('prd_12', 'Olaplex n.3 Perfector', 'Olaplex', 'OLX-N3-100', 4, 6, 17, 34, 'flacone'),
  P('prd_13', 'Asciugamani monouso 100pz', 'Salon Pro', 'SLP-TWL-100', 26, 10, 9, 0, 'confezione'),
  P('prd_14', 'Guanti nitrile M 100pz', 'Salon Pro', 'SLP-GLV-M', 6, 8, 6.5, 0, 'scatola'),
]

const REWARDS: Reward[] = [
  { id: 'rwd_sconto10', name: 'Buono 10 €', description: 'Dieci euro di sconto sul prossimo servizio.', cost: 150, active: true },
  { id: 'rwd_piega', name: 'Piega omaggio', description: 'Una piega completa in regalo, da usare quando vuoi.', cost: 200, active: true },
  { id: 'rwd_prodotto', name: 'Prodotto a metà prezzo', description: 'Sconto del 50% su un prodotto della linea in rivendita.', cost: 300, active: true },
  { id: 'rwd_trattamento', name: 'Trattamento ristrutturante', description: 'Ricostruzione della fibra con massaggio in cute.', cost: 350, active: true },
  { id: 'rwd_taglio', name: 'Taglio omaggio', description: 'Taglio e styling offerti dal salone.', cost: 450, active: true },
]

const FIRST_F = ['Chiara','Martina','Elena','Sara','Valentina','Francesca','Alessia','Giorgia','Beatrice','Ilaria','Silvia','Camilla','Federica','Noemi','Arianna','Laura','Marta','Giada']
const FIRST_M = ['Andrea','Matteo','Davide','Simone','Riccardo','Tommaso','Federico','Alessandro','Stefano','Gabriele','Nicola','Emanuele']
const LAST = ['Rossi','Bianchi','Conti','Greco','Rizzo','Marino','Costa','Gallo','Fontana','Barbieri','Mancini','Longo','Martini','Villa','Serra','Vitale','Palmieri','Sala','De Luca','Ferrari','Esposito','Colombo','Bruno','Pellegrini']
const HAIR_NOTES = [
  'Base 6.0 + 2cm ricrescita. Ossigeno 20 vol, posa 35 min.',
  'Balayage con schiariture 30 vol, tonalizzante 9.13 in lavaggio.',
  'Cute sensibile: evitare ammoniaca, usare linea delicata.',
  'Capello poroso sulle punte, ristrutturante prima di ogni colore.',
  'Riflesso freddo, teme il giallo. Tonalizzante ogni 4 settimane.',
  'Ricci 3B: taglio a secco, niente spazzola.',
  'Allergia al PPD dichiarata — solo colorazione vegetale.',
]
const NOTES = ['Preferisce la mattina presto.','Sempre puntualissima.','Richiamare per il ritocco ogni 5 settimane.','Arriva spesso con 10 minuti di ritardo.','Ama chiacchierare, lasciare margine.','Cliente storica, dal 2019.','','']
const TAGS = ['VIP','Abituale','Nuovo','Colore','Sposa','Fedelissimo','Da recuperare']

export function buildSeedState(): SalonState {
  const rng = makeRng(20260916)
  const today = startOfDay(new Date())

  /* --- clienti --- */
  const clients: Client[] = []
  for (let i = 0; i < 54; i++) {
    const female = rng() > 0.28
    const firstName = female ? pick(rng, FIRST_F) : pick(rng, FIRST_M)
    const lastName = pick(rng, LAST)
    const tags: string[] = []
    if (rng() > 0.55) for (let t = 0; t < randInt(rng, 1, 2); t++) {
      const tag = pick(rng, TAGS)
      if (!tags.includes(tag)) tags.push(tag)
    }
    clients.push({
      id: `cli_${i + 1}`, firstName, lastName,
      phone: `+39 3${randInt(rng, 20, 99)} ${randInt(rng, 100, 999)} ${randInt(rng, 1000, 9999)}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(/\s/g, '')}@${pick(rng, ['gmail.com','libero.it','outlook.it','icloud.com'])}`,
      birthday: rng() > 0.25 ? dayKey(new Date(randInt(rng, 1968, 2006), randInt(rng, 0, 11), randInt(rng, 1, 28))) : null,
      notes: pick(rng, NOTES),
      hairNotes: rng() > 0.4 ? pick(rng, HAIR_NOTES) : '',
      tags, marketingConsent: rng() > 0.3,
      createdAt: addDays(today, -randInt(rng, 5, 900)).toISOString(),
      cardCode: makeCardCode(), points: 0,
    })
  }

  /* --- appuntamenti --- */
  const appointments: Appointment[] = []
  const bookable = SERVICES.filter((s) => s.id !== 'srv_consulenza')
  const nowMin = new Date().getHours() * 60 + new Date().getMinutes()

  for (let offset = -35; offset <= 21; offset++) {
    const day = addDays(today, offset)
    if (!SETTINGS.openDays.includes(day.getDay())) continue

    let load = day.getDay() === 6 ? randInt(rng, 12, 17) : randInt(rng, 8, 14)
    if (offset > 3) load = Math.max(1, Math.round(load * (1 - (offset - 3) / 26)))

    for (let n = 0; n < load; n++) {
      const working = STAFF.filter((s) => s.workDays.includes(day.getDay()))
      const staff = pick(rng, working)
      if (!staff) continue
      const eligible = bookable.filter((s) => staff.skills.includes(s.category))
      if (eligible.length === 0) continue

      const main = pick(rng, eligible)
      const serviceIds = [main.id]
      let durationMin = main.durationMin

      if (main.category === 'colore' && rng() > 0.45) {
        serviceIds.push('srv_piega'); durationMin += 30
      } else if (main.category === 'taglio' && staff.skills.includes('barba') && rng() > 0.75) {
        serviceIds.push('srv_barba'); durationMin += 25
      }

      const openMin = Math.max(Number(staff.startHour.split(':')[0]) * 60, 9 * 60)
      const closeMin = Number(staff.endHour.split(':')[0]) * 60 + 30
      const latest = closeMin - durationMin
      if (latest <= openMin) continue

      const startMin = Math.round(randInt(rng, openMin, latest) / 15) * 15
      const start = new Date(day)
      start.setHours(0, startMin, 0, 0)

      const overlaps = appointments.some((a) => {
        if (a.staffId !== staff.id) return false
        const aS = new Date(a.start).getTime(), aE = aS + a.durationMin * 60000
        const bS = start.getTime(), bE = bS + durationMin * 60000
        return bS < aE && aS < bE
      })
      if (overlaps) continue

      let status: AppointmentStatus
      if (offset < 0) {
        const roll = rng()
        status = roll > 0.12 ? 'completato' : roll > 0.05 ? 'annullato' : 'no_show'
      } else if (offset === 0) {
        status = startMin + durationMin < nowMin ? 'completato'
          : startMin <= nowMin ? 'in_corso' : 'confermato'
      } else {
        status = 'confermato'
      }

      appointments.push({
        id: `apt_${appointments.length + 1}`,
        clientId: pick(rng, clients).id, staffId: staff.id, serviceIds,
        start: start.toISOString(), durationMin, status,
        notes: rng() > 0.85 ? pick(rng, ['Prima volta da noi','Ha un evento la sera','Chiede consiglio taglio']) : '',
        source: rng() > 0.45 ? 'online' : 'salone',
        createdAt: addDays(start, -randInt(rng, 1, 20)).toISOString(),
      })
    }
  }
  /* --- stato "adesso" ------------------------------------------------
     La bacheca esiste per mostrare chi è in poltrona e chi sta per entrare:
     se il salone è aperto in questo momento, ci si assicura che entrambe le
     situazioni esistano davvero, invece di dipendere dal caso. */
  if (SETTINGS.openDays.includes(today.getDay())) {
    const openMin = 9 * 60
    const closeMin = 19 * 60 + 30

    const inject = (offsetMin: number, status: AppointmentStatus) => {
      const startMin = nowMin + offsetMin
      if (startMin < openMin || startMin > closeMin - 45) return

      const staff = STAFF.find((s) => {
        if (!s.workDays.includes(today.getDay())) return false
        if (startMin < Number(s.startHour.split(':')[0]) * 60) return false
        // Solo chi è davvero libero in quella finestra, confrontando gli
        // appuntamenti di OGGI: senza il filtro sul giorno collidono le ore
        // di date diverse e ogni operatore risulta sempre occupato.
        const todayKey = dayKey(today)
        return !appointments.some((a) => {
          if (a.staffId !== s.id || dayKey(a.start) !== todayKey) return false
          const aStart = new Date(a.start)
          const aMin = aStart.getHours() * 60 + aStart.getMinutes()
          return startMin < aMin + a.durationMin && aMin < startMin + 45
        })
      })
      if (!staff) return

      const service = SERVICES.find((s) => staff.skills.includes(s.category) && s.durationMin >= 40)
      if (!service) return

      const start = new Date(today)
      start.setHours(0, startMin, 0, 0)
      appointments.push({
        id: `apt_live_${status}`,
        clientId: pick(rng, clients).id,
        staffId: staff.id,
        serviceIds: [service.id],
        start: start.toISOString(),
        durationMin: service.durationMin,
        status,
        notes: '',
        source: 'salone',
        createdAt: addDays(today, -2).toISOString(),
      })
    }

    inject(-20, 'in_corso')   // già in poltrona
    inject(8, 'confermato')   // sta per arrivare: è quello che lampeggia
  }

  appointments.sort((a, b) => a.start.localeCompare(b.start))

  /* --- scontrini --- */
  const sales: Sale[] = []
  const retail = PRODUCTS.filter((p) => p.price > 0)
  let num = 1
  for (const apt of appointments) {
    if (apt.status !== 'completato') continue
    const items: SaleItem[] = apt.serviceIds.map((sid) => {
      const svc = SERVICES.find((s) => s.id === sid)!
      return { kind: 'servizio', refId: svc.id, name: svc.name, qty: 1, unitPrice: svc.price }
    })
    if (rng() > 0.8) {
      const prod = pick(rng, retail)
      items.push({ kind: 'prodotto', refId: prod.id, name: prod.name, qty: 1, unitPrice: prod.price })
    }
    const discountPct = rng() > 0.88 ? pick(rng, [5, 10, 15]) : 0
    const gross = items.reduce((a, it) => a + it.unitPrice * it.qty, 0)
    const total = Math.round(gross * (1 - discountPct / 100) * 100) / 100
    if (total <= 0) continue
    sales.push({
      id: `sal_${num}`, number: num, clientId: apt.clientId, staffId: apt.staffId,
      appointmentId: apt.id, items, discountPct,
      method: pick(rng, ['carta', 'carta', 'contanti', 'satispay'] as const), total,
      createdAt: new Date(new Date(apt.start).getTime() + apt.durationMin * 60000).toISOString(),
    })
    num++
  }

  /* --- fedeltà --- */
  const loyaltyLedger: LoyaltyEntry[] = []
  let e = 1
  const entry = (clientId: string, points: number, reason: LoyaltyEntry['reason'], createdAt: string, saleId: string | null = null, rewardId: string | null = null, note = ''): LoyaltyEntry =>
    ({ id: `loy_${e++}`, clientId, points, reason, saleId, rewardId, note, createdAt })

  for (const c of clients) loyaltyLedger.push(entry(c.id, SETTINGS.loyalty.welcomePoints, 'benvenuto', c.createdAt))

  // Saldo riportato dalla vecchia tessera: proporzionale all'anzianità, così i
  // livelli non restano tutti fermi al primo scalino.
  for (const c of clients) {
    const ageDays = Math.round((today.getTime() - new Date(c.createdAt).getTime()) / 86400000)
    if (ageDays < 60) continue
    const historical = Math.round(ageDays * (0.3 + rng() * 1.1))
    if (historical > 0) loyaltyLedger.push(entry(c.id, historical, 'storico', addDays(new Date(c.createdAt), 1).toISOString()))
  }

  for (const s of sales) {
    if (!s.clientId) continue
    const pts = Math.round(s.total * SETTINGS.loyalty.pointsPerEuro)
    if (pts > 0) loyaltyLedger.push(entry(s.clientId, pts, 'acquisto', s.createdAt, s.id))
  }

  const balances = new Map<string, number>()
  for (const l of loyaltyLedger) balances.set(l.clientId, (balances.get(l.clientId) ?? 0) + l.points)

  for (const [clientId, balance] of balances) {
    if (balance < 400 || rng() > 0.35) continue
    const reward = pick(rng, REWARDS.filter((r) => r.cost <= balance))
    if (!reward) continue
    loyaltyLedger.push(entry(clientId, -reward.cost, 'riscatto', addDays(today, -randInt(rng, 1, 60)).toISOString(), null, reward.id, reward.name))
    balances.set(clientId, balance - reward.cost)
  }

  loyaltyLedger.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  for (const c of clients) c.points = balances.get(c.id) ?? 0

  return {
    version: STATE_VERSION, settings: SETTINGS, services: SERVICES, staff: STAFF,
    clients, appointments, products: PRODUCTS, sales, rewards: REWARDS, loyaltyLedger,
  }
}

/** Slot "HH:MM" del giorno, secondo gli orari di apertura. */
export function slotsForDay(settings: SalonSettings, day: Date, stepMin?: number): string[] {
  if (!settings.openDays.includes(day.getDay())) return []
  const step = stepMin ?? settings.slotMinutes
  const out: string[] = []
  const open = atTime(day, settings.openHour).getTime()
  const close = atTime(day, settings.closeHour).getTime()
  for (let t = open; t < close; t += step * 60000) {
    const d = new Date(t)
    out.push(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`)
  }
  return out
}
