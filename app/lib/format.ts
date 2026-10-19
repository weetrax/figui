import type { ItineraryStep, Trip, TripStatus } from '@/types'

/*
 * Les dates sont manipulées comme des valeurs "murales" (sans fuseau) :
 * on les convertit en UTC et on formate en UTC pour éviter tout décalage
 * entre le serveur et le navigateur.
 */

const DAY_MS = 24 * 60 * 60 * 1000

/** `YYYY-MM-DD` ou `YYYY-MM-DDTHH:mm` → Date UTC. */
export const parseWallDate = (value: string): Date => {
  const [datePart, timePart = '00:00'] = value.split('T')
  const [y, m, d] = datePart.split('-').map(Number)
  const [hh, mm] = timePart.split(':').map(Number)
  return new Date(Date.UTC(y, m - 1, d, hh, mm))
}

/** Date courante sous forme `YYYY-MM-DD`. */
export const todayIso = (now: Date = new Date()): string => {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

const dayFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit',
  timeZone: 'UTC',
})

const monthFormatter = new Intl.DateTimeFormat('fr-FR', {
  month: 'short',
  timeZone: 'UTC',
})

const longDayFormatter = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  timeZone: 'UTC',
})

const timeFormatter = new Intl.DateTimeFormat('fr-FR', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'UTC',
})

const currencyFormatter = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})

export const formatDate = (value: string): string =>
  dateFormatter.format(parseWallDate(value))

export const formatDateRange = (start: string, end: string): string =>
  `${formatDate(start)} – ${formatDate(end)}`

export const formatLongDay = (value: string): string =>
  longDayFormatter.format(parseWallDate(value))

export const formatTime = (value: string): string =>
  timeFormatter.format(parseWallDate(value))

/** `{ day: '14', month: 'nov.' }` pour la colonne date de la frise. */
export const formatDayMonth = (
  value: string,
): { day: string; month: string } => {
  const date = parseWallDate(value)
  return {
    day: dayFormatter.format(date),
    month: monthFormatter.format(date).replace('.', ''),
  }
}

export const formatCurrency = (amount: number): string =>
  currencyFormatter.format(amount)

/** Nombre de jours inclusifs entre deux dates. */
export const countDays = (start: string, end: string): number =>
  Math.round(
    (parseWallDate(end).getTime() - parseWallDate(start).getTime()) / DAY_MS,
  ) + 1

export const computeTripStatus = (
  trip: Pick<Trip, 'startDate' | 'endDate'>,
  today: string = todayIso(),
): TripStatus => {
  if (today < trip.startDate) return 'A venir'
  if (today > trip.endDate) return 'Terminé'
  return 'En cours'
}

export const slugify = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export const sumStepsBudget = (
  steps: Array<Pick<ItineraryStep, 'estimatedBudget'>>,
): number =>
  steps.reduce((total, step) => total + (step.estimatedBudget ?? 0), 0)

export const sortSteps = <T extends Pick<ItineraryStep, 'datetime'>>(
  steps: Array<T>,
): Array<T> => [...steps].sort((a, b) => a.datetime.localeCompare(b.datetime))

export const initials = (name: string): string =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
