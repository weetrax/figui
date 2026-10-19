import { CoverImage } from '@/components/features/cover-image'
import {
  PrivateBadge,
  TripStatusBadge,
} from '@/components/features/trip-badges'
import type { Trip } from '@/types'

interface TripHeroProps {
  trip: Trip
  actions?: React.ReactNode
}

export const TripHero: React.FC<TripHeroProps> = ({ trip, actions }) => (
  <section className="relative isolate overflow-hidden rounded-2xl border shadow-sm">
    <CoverImage
      src={trip.coverImageUrl}
      alt={trip.title}
      className="absolute inset-0 -z-10 size-full"
    />
    <div className="absolute inset-0 -z-10 bg-linear-to-t from-black/70 via-black/20 to-transparent" />

    <div className="flex min-h-72 flex-col justify-end gap-4 p-5 sm:min-h-80 sm:flex-row sm:items-end sm:justify-between sm:p-6">
      <div className="space-y-2 text-white">
        <div className="flex gap-1.5">
          <TripStatusBadge status={trip.status} />
          {!trip.isPublic && <PrivateBadge />}
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight drop-shadow-sm sm:text-4xl">
          {trip.title}
        </h1>
        <p className="text-sm text-white/80">
          Organisé par {trip.organizer.name}
        </p>
      </div>
      {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
    </div>
  </section>
)
