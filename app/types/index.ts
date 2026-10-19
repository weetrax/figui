export type TripStatus = 'A venir' | 'En cours' | 'Terminé'

export interface User {
  id: string
  name: string
  email: string
  avatarUrl?: string
}

/** Utilisateur exposé publiquement (sans email). */
export type PublicUser = Omit<User, 'email'>

export interface Trip {
  id: string
  title: string
  slug: string
  coverImageUrl: string
  description: string
  /** Date au format ISO `YYYY-MM-DD`. */
  startDate: string
  /** Date au format ISO `YYYY-MM-DD`. */
  endDate: string
  isDateFlexible: boolean
  isPublic: boolean
  tags: Array<string>
  country: string
  estimatedBudget: number
  maxTravelers: number
  organizer: PublicUser
  /** Membres ayant rejoint le voyage (hors organisateur). */
  participants: Array<PublicUser>
  status: TripStatus
}

export interface ItineraryStep {
  id: string
  tripId: string
  title: string
  description?: string
  /** Date + heure locale au format `YYYY-MM-DDTHH:mm`. */
  datetime: string
  location: string
  estimatedBudget?: number
  tags: Array<string>
}

export interface TripWithSteps extends Trip {
  steps: Array<ItineraryStep>
}

export type TripInput = Pick<
  Trip,
  | 'title'
  | 'coverImageUrl'
  | 'description'
  | 'startDate'
  | 'endDate'
  | 'isDateFlexible'
  | 'isPublic'
  | 'tags'
  | 'country'
  | 'estimatedBudget'
  | 'maxTravelers'
>

export type ItineraryStepInput = Omit<ItineraryStep, 'id' | 'tripId'>
