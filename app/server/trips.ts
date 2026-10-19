import { notFound } from '@tanstack/react-router'
import { computeTripStatus, sortSteps } from '@/lib/format'
import { db } from '@/server/db'
import type { DbTrip } from '@/server/db'
import type { PublicUser, Trip, TripWithSteps, User } from '@/types'

const toPublicUser = (userId: string): PublicUser => {
  const user = db.users.find((u) => u.id === userId)
  return user
    ? { id: user.id, name: user.name, avatarUrl: user.avatarUrl }
    : { id: userId, name: 'Voyageur supprimé' }
}

export const toTrip = (trip: DbTrip): Trip => {
  const { organizerId, participantIds, createdAt: _createdAt, ...rest } = trip
  return {
    ...rest,
    organizer: toPublicUser(organizerId),
    participants: participantIds.map(toPublicUser),
    status: computeTripStatus(trip),
  }
}

export const toTripWithSteps = (trip: DbTrip): TripWithSteps => ({
  ...toTrip(trip),
  steps: sortSteps(db.steps.filter((step) => step.tripId === trip.id)),
})

const isDbMember = (trip: DbTrip, user: User | null): boolean =>
  !!user &&
  (trip.organizerId === user.id || trip.participantIds.includes(user.id))

/** Un voyage privé n'est visible que de ses membres. */
export const canView = (trip: DbTrip, user: User | null): boolean =>
  trip.isPublic || isDbMember(trip, user)

export const findTrip = (tripId: string): DbTrip => {
  const trip = db.trips.find((t) => t.id === tripId)
  if (!trip) throw notFound()
  return trip
}

export const assertOrganizer = (trip: DbTrip, user: User): void => {
  if (trip.organizerId !== user.id) {
    throw new Error('Seul l’organisateur peut modifier ce voyage.')
  }
}

export const assertMember = (trip: DbTrip, user: User): void => {
  if (!isDbMember(trip, user)) {
    throw new Error(
      'Seuls les membres du voyage peuvent modifier le programme.',
    )
  }
}

export const uniqueSlug = (base: string, excludeId?: string): string => {
  const root = base || 'voyage'
  let slug = root
  let i = 2
  while (db.trips.some((t) => t.slug === slug && t.id !== excludeId)) {
    slug = `${root}-${i++}`
  }
  return slug
}
