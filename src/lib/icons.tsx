/**
 * Icone per categoria e per stato.
 * Ogni informazione che ha un colore ha anche un'icona: il colore da solo non
 * basta a chi non lo distingue, e su una bacheca vista da lontano l'icona si
 * legge prima della parola.
 */

import {
  Armchair, CalendarCheck, CircleCheck, CircleX, Droplets, Hourglass, Palette,
  Scissors, Sparkles, UserX, Wind, Zap,
} from 'lucide-react'
import type { AppointmentStatus, ServiceCategory } from './types'
import type { Phase } from './selectors'

type Icon = typeof Scissors

export const CATEGORY_ICON: Record<ServiceCategory, Icon> = {
  taglio: Scissors,
  colore: Palette,
  trattamento: Droplets,
  piega: Wind,
  barba: Zap,
  extra: Sparkles,
}

export const STATUS_ICON: Record<AppointmentStatus, Icon> = {
  confermato: CalendarCheck,
  in_corso: Armchair,
  completato: CircleCheck,
  annullato: CircleX,
  no_show: UserX,
}

export const PHASE_ICON: Record<Phase, Icon> = {
  ora: Armchair,
  imminente: Hourglass,
  attesa: CalendarCheck,
  concluso: CircleCheck,
  saltato: CircleX,
}
