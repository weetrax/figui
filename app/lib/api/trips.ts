import { notFound } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { DEFAULT_COVER_IMAGE } from '@/lib/constants'
import { slugify } from '@/lib/format'
import { stepInputSchema, tripInputSchema } from '@/lib/schemas'
import { getCurrentUser, requireUser } from '@/server/auth'
import { db, generateId } from '@/server/db'
import {
  assertMember,
  assertOrganizer,
  canView,
  findTrip,
  toTrip,
  toTripWithSteps,
  uniqueSlug,
} from '@/server/trips'
import type { ItineraryStep, Trip, TripWithSteps } from '@/types'

const idSchema = z.object({ id: z.string().min(1) })

export const tripFiltersSchema = z.object({
  q: z.string().optional(),
  tag: z.string().optional(),
})

export type TripFilters = z.infer<typeof tripFiltersSchema>

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()

/* ----------------------------------------------------------------------------
 * Lecture
 * ------------------------------------------------------------------------- */

/** Voyages publics, consultables sans connexion. */
export const listPublicTrips = createServerFn({ method: 'GET' })
  .validator(tripFiltersSchema)
  .handler(({ data }): Array<Trip> => {
    const query = data.q ? normalize(data.q.trim()) : ''
    return db.trips
      .filter((trip) => trip.isPublic)
      .filter((trip) => !data.tag || trip.tags.includes(data.tag))
      .filter(
        (trip) =>
          !query ||
          normalize(
            `${trip.title} ${trip.country} ${trip.description}`,
          ).includes(query),
      )
      .map(toTrip)
      .sort((a, b) => {
        // Voyages terminés en dernier, puis par date de départ.
        const done =
          Number(a.status === 'Terminé') - Number(b.status === 'Terminé')
        return done || a.startDate.localeCompare(b.startDate)
      })
  })

/** Voyages organisés ou rejoints par l'utilisateur connecté (privés inclus). */
export const listMyTrips = createServerFn({ method: 'GET' }).handler(
  (): Array<Trip> => {
    const user = getCurrentUser()
    if (!user) return []
    return db.trips
      .filter(
        (trip) =>
          trip.organizerId === user.id || trip.participantIds.includes(user.id),
      )
      .map(toTrip)
      .sort((a, b) => a.startDate.localeCompare(b.startDate))
  },
)

export const getTripBySlug = createServerFn({ method: 'GET' })
  .validator(z.object({ slug: z.string().min(1) }))
  .handler(({ data }): TripWithSteps => {
    const trip = db.trips.find((t) => t.slug === data.slug)
    // Un voyage privé est indiscernable d'un voyage inexistant.
    if (!trip || !canView(trip, getCurrentUser())) throw notFound()
    return toTripWithSteps(trip)
  })

/* ----------------------------------------------------------------------------
 * Voyages
 * ------------------------------------------------------------------------- */

export const createTrip = createServerFn({ method: 'POST' })
  .validator(tripInputSchema)
  .handler(({ data }): Trip => {
    const user = requireUser()
    const trip = {
      ...data,
      id: generateId('t'),
      slug: uniqueSlug(slugify(data.title)),
      coverImageUrl: data.coverImageUrl || DEFAULT_COVER_IMAGE,
      tags: [...new Set(data.tags)],
      organizerId: user.id,
      participantIds: [],
      createdAt: new Date().toISOString(),
    }
    db.trips.push(trip)
    return toTrip(trip)
  })

export const updateTrip = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.string().min(1), data: tripInputSchema }))
  .handler(({ data: { id, data } }): Trip => {
    const user = requireUser()
    const trip = findTrip(id)
    assertOrganizer(trip, user)
    if (data.maxTravelers < 1 + trip.participantIds.length) {
      throw new Error(
        `Le voyage compte déjà ${1 + trip.participantIds.length} voyageurs.`,
      )
    }
    Object.assign(trip, {
      ...data,
      coverImageUrl: data.coverImageUrl || DEFAULT_COVER_IMAGE,
      tags: [...new Set(data.tags)],
      slug: uniqueSlug(slugify(data.title), trip.id),
    })
    return toTrip(trip)
  })

export const deleteTrip = createServerFn({ method: 'POST' })
  .validator(idSchema)
  .handler(({ data }) => {
    const user = requireUser()
    const trip = findTrip(data.id)
    assertOrganizer(trip, user)
    db.trips = db.trips.filter((t) => t.id !== trip.id)
    db.steps = db.steps.filter((s) => s.tripId !== trip.id)
  })

/* ----------------------------------------------------------------------------
 * Participants
 * ------------------------------------------------------------------------- */

export const joinTrip = createServerFn({ method: 'POST' })
  .validator(idSchema)
  .handler(({ data }): Trip => {
    const user = requireUser()
    const trip = findTrip(data.id)
    const view = toTrip(trip)
    if (!canView(trip, user)) throw notFound()
    if (trip.organizerId === user.id || trip.participantIds.includes(user.id)) {
      throw new Error('Vous faites déjà partie de ce voyage.')
    }
    if (view.status === 'Terminé') throw new Error('Ce voyage est terminé.')
    if (1 + trip.participantIds.length >= trip.maxTravelers) {
      throw new Error('Ce voyage est complet.')
    }
    trip.participantIds.push(user.id)
    return toTrip(trip)
  })

export const leaveTrip = createServerFn({ method: 'POST' })
  .validator(idSchema)
  .handler(({ data }): Trip => {
    const user = requireUser()
    const trip = findTrip(data.id)
    trip.participantIds = trip.participantIds.filter((id) => id !== user.id)
    return toTrip(trip)
  })

/* ----------------------------------------------------------------------------
 * Étapes du programme
 * ------------------------------------------------------------------------- */

const findStep = (stepId: string): ItineraryStep => {
  const step = db.steps.find((s) => s.id === stepId)
  if (!step) throw notFound()
  return step
}

const cleanStep = (data: z.infer<typeof stepInputSchema>) => ({
  ...data,
  description: data.description || undefined,
  tags: [...new Set(data.tags)],
})

export const createStep = createServerFn({ method: 'POST' })
  .validator(z.object({ tripId: z.string().min(1), data: stepInputSchema }))
  .handler(({ data: { tripId, data } }): ItineraryStep => {
    const user = requireUser()
    assertMember(findTrip(tripId), user)
    const step: ItineraryStep = {
      id: generateId('s'),
      tripId,
      ...cleanStep(data),
    }
    db.steps.push(step)
    return step
  })

export const updateStep = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.string().min(1), data: stepInputSchema }))
  .handler(({ data: { id, data } }): ItineraryStep => {
    const user = requireUser()
    const step = findStep(id)
    assertMember(findTrip(step.tripId), user)
    Object.assign(step, { estimatedBudget: undefined }, cleanStep(data))
    return step
  })

export const deleteStep = createServerFn({ method: 'POST' })
  .validator(idSchema)
  .handler(({ data }) => {
    const user = requireUser()
    const step = findStep(data.id)
    assertMember(findTrip(step.tripId), user)
    db.steps = db.steps.filter((s) => s.id !== step.id)
  })
