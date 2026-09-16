/** Modello dati di ONDA. */

export type ID = string

export type ServiceCategory = 'taglio' | 'colore' | 'trattamento' | 'piega' | 'barba' | 'extra'

/** L'etichetta arriva dal dizionario i18n con la chiave `cat.<id>`. */
export const SERVICE_CATEGORIES: { id: ServiceCategory; tint: string }[] = [
  { id: 'taglio', tint: '#7A3763' },
  { id: 'colore', tint: '#E8946A' },
  { id: 'trattamento', tint: '#8AA681' },
  { id: 'piega', tint: '#A47864' },
  { id: 'barba', tint: '#6B5A4B' },
  { id: 'extra', tint: '#E5BF68' },
]

export interface Service {
  id: ID
  name: string
  category: ServiceCategory
  durationMin: number
  price: number
  description: string
  active: boolean
}

export interface Staff {
  id: ID
  name: string
  role: string
  /** Colore identificativo nelle colonne dell'agenda e sulla bacheca. */
  color: string
  skills: ServiceCategory[]
  commissionPct: number
  /** 0 = domenica … 6 = sabato. */
  workDays: number[]
  startHour: string
  endHour: string
  phone: string
  email: string
  bio: string
  active: boolean
}

export interface Client {
  id: ID
  firstName: string
  lastName: string
  phone: string
  email: string
  birthday: string | null
  notes: string
  /** Formula colore, allergie, storico tecnico. */
  hairNotes: string
  tags: string[]
  marketingConsent: boolean
  createdAt: string
  cardCode: string
  points: number
}

export type AppointmentStatus = 'confermato' | 'in_corso' | 'completato' | 'annullato' | 'no_show'

export const APPOINTMENT_STATUS_LIST: AppointmentStatus[] = [
  'confermato',
  'in_corso',
  'completato',
  'annullato',
  'no_show',
]

/** Solo il colore semantico: l'etichetta arriva da `status.<id>`. */
export const STATUS_TONE: Record<AppointmentStatus, 'brand' | 'accent' | 'good' | 'mute' | 'bad'> = {
  confermato: 'brand',
  in_corso: 'accent',
  completato: 'good',
  annullato: 'mute',
  no_show: 'bad',
}

export interface Appointment {
  id: ID
  clientId: ID
  staffId: ID
  serviceIds: ID[]
  start: string
  durationMin: number
  status: AppointmentStatus
  notes: string
  source: 'salone' | 'online'
  createdAt: string
}

export interface Product {
  id: ID
  name: string
  brand: string
  sku: string
  stock: number
  minStock: number
  cost: number
  price: number
  unit: string
}

export type PaymentMethod = 'contanti' | 'carta' | 'satispay' | 'bonifico'

export const PAYMENT_METHODS: PaymentMethod[] = ['carta', 'contanti', 'satispay', 'bonifico']

export interface SaleItem {
  kind: 'servizio' | 'prodotto'
  refId: ID
  name: string
  qty: number
  unitPrice: number
}

export interface Sale {
  id: ID
  number: number
  clientId: ID | null
  staffId: ID
  appointmentId: ID | null
  items: SaleItem[]
  discountPct: number
  method: PaymentMethod
  total: number
  createdAt: string
}

/* ----------------------------------------------------------- fedeltà */

export type LoyaltyTierId = 'bronzo' | 'argento' | 'oro' | 'platino'

/** Soglie sui punti maturati nel tempo, non sul saldo residuo. */
export const LOYALTY_TIERS: { id: LoyaltyTierId; min: number; tint: string }[] = [
  { id: 'bronzo', min: 0, tint: '#A47864' },
  { id: 'argento', min: 300, tint: '#8E7C6B' },
  { id: 'oro', min: 800, tint: '#C39C45' },
  { id: 'platino', min: 2000, tint: '#7A3763' },
]

export interface Reward {
  id: ID
  name: string
  description: string
  cost: number
  active: boolean
}

export interface LoyaltyEntry {
  id: ID
  clientId: ID
  points: number
  reason: 'acquisto' | 'riscatto' | 'benvenuto' | 'manuale' | 'storico'
  saleId: ID | null
  rewardId: ID | null
  note: string
  createdAt: string
}

export interface LoyaltySettings {
  enabled: boolean
  pointsPerEuro: number
  welcomePoints: number
  cardBaseUrl: string
}

export interface SalonSettings {
  name: string
  tagline: string
  address: string
  city: string
  phone: string
  email: string
  instagram: string
  openDays: number[]
  openHour: string
  closeHour: string
  slotMinutes: number
  countryCode: string
  /** Minuti di anticipo con cui la bacheca segnala un appuntamento. */
  alertMinutes: number
  loyalty: LoyaltySettings
}

export interface SalonState {
  version: number
  settings: SalonSettings
  services: Service[]
  staff: Staff[]
  clients: Client[]
  appointments: Appointment[]
  products: Product[]
  sales: Sale[]
  rewards: Reward[]
  loyaltyLedger: LoyaltyEntry[]
}
