import type { ItineraryStep, Trip, User } from '@/types'

/*
 * Base de données en mémoire (MVP). Les données sont réinitialisées au
 * redémarrage du serveur. Remplacer ce module par un vrai stockage
 * (Postgres, SQLite...) sans toucher aux server functions.
 */

export interface DbTrip extends Omit<
  Trip,
  'organizer' | 'participants' | 'status'
> {
  organizerId: string
  participantIds: Array<string>
  createdAt: string
}

export interface Db {
  users: Array<User>
  trips: Array<DbTrip>
  steps: Array<ItineraryStep>
}

const unsplash = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=1600&q=80&auto=format&fit=crop`

const seed = (): Db => ({
  users: [
    { id: 'u-martines', name: 'Martines', email: 'martines@figui.app' },
    { id: 'u-lea', name: 'Léa Bernard', email: 'lea@figui.app' },
    { id: 'u-karim', name: 'Karim Haddad', email: 'karim@figui.app' },
    { id: 'u-sofia', name: 'Sofia Rossi', email: 'sofia@figui.app' },
  ],
  trips: [
    {
      id: 't-philippines',
      title: 'Phillipines',
      slug: 'phillipines',
      coverImageUrl: unsplash('1518509562904-e7ef99cdcc86'),
      description: 'Road Trip aux Phillipines',
      startDate: '2026-11-14',
      endDate: '2027-03-31',
      isDateFlexible: false,
      isPublic: true,
      tags: ['Plage', 'Aventure', 'Road trip'],
      countries: ['PH'],
      estimatedBudget: 2000,
      maxTravelers: 2,
      organizerId: 'u-martines',
      participantIds: [],
      createdAt: '2026-09-01T10:00:00Z',
    },
    {
      id: 't-vietnam',
      title: 'Vietnam du Nord au Sud',
      slug: 'vietnam-du-nord-au-sud',
      coverImageUrl: unsplash('1528127269322-539801943592'),
      description:
        'De Hanoï à Hô Chi Minh en passant par la baie d’Along et Hội An. Street food, croisière et vélo dans les rizières.',
      startDate: '2027-02-05',
      endDate: '2027-02-26',
      isDateFlexible: true,
      isPublic: true,
      tags: ['Food', 'Culture', 'Aventure'],
      countries: ['VN'],
      estimatedBudget: 1800,
      maxTravelers: 4,
      organizerId: 'u-lea',
      participantIds: ['u-karim'],
      createdAt: '2026-09-12T10:00:00Z',
    },
    {
      id: 't-maroc',
      title: 'Médinas du Maroc',
      slug: 'medinas-du-maroc',
      coverImageUrl: unsplash('1539020140153-e479b8c22e70'),
      description:
        'Fès, Chefchaouen et Marrakech : souks, riads et une nuit dans le désert d’Agafay.',
      startDate: '2026-12-10',
      endDate: '2026-12-20',
      isDateFlexible: true,
      isPublic: true,
      tags: ['Culture', 'Food'],
      countries: ['MA'],
      estimatedBudget: 950,
      maxTravelers: 5,
      organizerId: 'u-karim',
      participantIds: ['u-sofia'],
      createdAt: '2026-09-20T10:00:00Z',
    },
    {
      id: 't-patagonie',
      title: 'Trek en Patagonie',
      slug: 'trek-en-patagonie',
      coverImageUrl: unsplash('1464822759023-fed622ff2c3b'),
      description:
        'Le W du Torres del Paine puis El Chaltén. Bivouacs, glaciers et vent de face.',
      startDate: '2026-10-10',
      endDate: '2026-10-30',
      isDateFlexible: false,
      isPublic: true,
      tags: ['Randonnée', 'Aventure'],
      countries: ['CL', 'AR'],
      estimatedBudget: 2600,
      maxTravelers: 3,
      organizerId: 'u-sofia',
      participantIds: ['u-lea', 'u-karim'],
      createdAt: '2026-06-02T10:00:00Z',
    },
    {
      id: 't-bali',
      title: 'Bali slow travel',
      slug: 'bali-slow-travel',
      coverImageUrl: unsplash('1555400038-63f5ba517a47'),
      description:
        'Rizières d’Ubud, plongée à Amed et couchers de soleil à Uluwatu.',
      startDate: '2026-07-02',
      endDate: '2026-07-18',
      isDateFlexible: false,
      isPublic: true,
      tags: ['Plage', 'Détente'],
      countries: ['ID'],
      estimatedBudget: 1400,
      maxTravelers: 4,
      organizerId: 'u-sofia',
      participantIds: ['u-martines'],
      createdAt: '2026-03-15T10:00:00Z',
    },
    {
      id: 't-japon',
      title: 'Japon en famille',
      slug: 'japon-en-famille',
      coverImageUrl: unsplash('1493976040374-85c8e12f0c0e'),
      description:
        'Tokyo, Kyoto et Nara au printemps — voyage privé entre proches.',
      startDate: '2027-04-01',
      endDate: '2027-04-15',
      isDateFlexible: false,
      isPublic: false,
      tags: ['Culture', 'Ville'],
      countries: ['JP'],
      estimatedBudget: 3200,
      maxTravelers: 4,
      organizerId: 'u-martines',
      participantIds: [],
      createdAt: '2026-10-01T10:00:00Z',
    },
  ],
  steps: [
    {
      id: 's-1',
      tripId: 't-philippines',
      title: 'Arrivée Manille',
      description: 'Arrivée Aéroport',
      datetime: '2026-11-14T17:00',
      location: 'Aéroport',
      tags: ['Transport'],
    },
    {
      id: 's-2',
      tripId: 't-philippines',
      title: 'Nuit APA Hotel',
      datetime: '2026-11-14T20:00',
      location: 'Manille',
      estimatedBudget: 12,
      tags: ['Hébergement'],
    },
    {
      id: 's-3',
      tripId: 't-philippines',
      title: 'Départ Coron',
      datetime: '2026-11-15T09:15',
      location: 'Coron',
      estimatedBudget: 10,
      tags: ['Transport'],
    },
    {
      id: 's-4',
      tripId: 't-philippines',
      title: 'Arrivée Coron',
      datetime: '2026-11-15T12:45',
      location: 'Coron',
      tags: ['Transport'],
    },
    {
      id: 's-5',
      tripId: 't-philippines',
      title: 'Visite Parc Naturel',
      datetime: '2026-11-15T14:30',
      location: 'Coron Park',
      tags: ['Visite', 'Nature'],
    },
    {
      id: 's-6',
      tripId: 't-philippines',
      title: 'Night Diner',
      description: 'Macdo Centre Ville',
      datetime: '2026-11-15T20:30',
      location: 'Coron',
      estimatedBudget: 10,
      tags: ['Restaurant'],
    },
    {
      id: 's-7',
      tripId: 't-vietnam',
      title: 'Street food tour à Hanoï',
      datetime: '2027-02-05T19:00',
      location: 'Hanoï',
      estimatedBudget: 25,
      tags: ['Restaurant', 'Visite'],
    },
    {
      id: 's-8',
      tripId: 't-vietnam',
      title: 'Croisière baie d’Along',
      description: 'Nuit à bord, kayak au lever du soleil.',
      datetime: '2027-02-07T08:00',
      location: 'Baie d’Along',
      estimatedBudget: 140,
      tags: ['Nature', 'Hébergement'],
    },
  ],
})

const globalForDb = globalThis as typeof globalThis & { __figuiDb?: Db }

/** Instance unique, conservée entre deux rechargements à chaud. */
export const db: Db = (globalForDb.__figuiDb ??= seed())

export const generateId = (prefix: string): string =>
  `${prefix}-${crypto.randomUUID().slice(0, 8)}`
