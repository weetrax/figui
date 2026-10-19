import type { PublicUser, Trip } from '@/types'

type Viewer = Pick<PublicUser, 'id'> | null | undefined

export const isOrganizer = (trip: Trip, user: Viewer): boolean =>
  !!user && trip.organizer.id === user.id

export const isParticipant = (trip: Trip, user: Viewer): boolean =>
  !!user && trip.participants.some((p) => p.id === user.id)

export const isMember = (trip: Trip, user: Viewer): boolean =>
  isOrganizer(trip, user) || isParticipant(trip, user)

/** Organisateur inclus. */
export const travelersCount = (trip: Trip): number =>
  1 + trip.participants.length

export const spotsLeft = (trip: Trip): number =>
  Math.max(0, trip.maxTravelers - travelersCount(trip))

export const canJoin = (trip: Trip, user: Viewer): boolean =>
  !isMember(trip, user) && spotsLeft(trip) > 0 && trip.status !== 'Terminé'

/** Les membres du voyage peuvent construire le programme ensemble. */
export const canEditItinerary = (trip: Trip, user: Viewer): boolean =>
  isMember(trip, user)
