import { Link } from '@tanstack/react-router'
import { CalendarDays, MapPin, Users, Wallet } from 'lucide-react'
import { CoverImage } from '@/components/features/cover-image'
import {
  PrivateBadge,
  TripStatusBadge,
  TripTagBadge,
} from '@/components/features/trip-badges'
import { UserAvatar } from '@/components/features/user-avatar'
import { countryName } from '@/lib/countries'
import { formatCurrency, formatDateRange } from '@/lib/format'
import { spotsLeft, travelersCount } from '@/lib/permissions'
import { cn } from '@/lib/utils'
import type { Trip } from '@/types'

interface TripCardProps {
  trip: Trip
}

export const TripCard: React.FC<TripCardProps> = ({ trip }) => {
  const remaining = spotsLeft(trip)
  // Voyage passé : carte atténuée, couleurs rétablies au survol / focus.
  const isPast = trip.status === 'Terminé'

  return (
    <Link
      to="/trips/$slug"
      params={{ slug: trip.slug }}
      className={cn(
        'group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
        isPast && 'bg-card/60 shadow-none',
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <CoverImage
          src={trip.coverImageUrl}
          alt={trip.title}
          className={cn(
            'size-full transition duration-500 group-hover:scale-105',
            isPast &&
              'grayscale-[85%] group-hover:grayscale-0 group-focus-visible:grayscale-0',
          )}
        />
        {isPast && (
          <div
            aria-hidden
            className="absolute inset-0 bg-background/45 transition duration-500 group-hover:opacity-0 group-focus-visible:opacity-0"
          />
        )}
        <div className="absolute top-3 left-3 flex gap-1.5">
          <TripStatusBadge status={trip.status} />
          {!trip.isPublic && <PrivateBadge />}
        </div>
      </div>

      <div
        className={cn(
          'flex flex-1 flex-col gap-3 p-4 transition',
          isPast &&
            'opacity-60 group-hover:opacity-100 group-focus-visible:opacity-100',
        )}
      >
        <div>
          <p className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
            <MapPin className="size-3.5" />
            <span className="truncate">
              {trip.countries.map(countryName).join(' · ')}
            </span>
          </p>
          <h3 className="mt-1 line-clamp-1 text-lg font-bold">{trip.title}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {trip.description}
          </p>
        </div>

        {trip.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {trip.tags.slice(0, 3).map((tag) => (
              <TripTagBadge key={tag} tag={tag} />
            ))}
          </div>
        )}

        <div className="mt-auto grid gap-1.5 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <CalendarDays className="size-4" />
            {formatDateRange(trip.startDate, trip.endDate)}
            {trip.isDateFlexible && (
              <span className="text-xs text-primary">· flexible</span>
            )}
          </span>
          <span className="flex items-center gap-2">
            <Wallet className="size-4" />
            {formatCurrency(trip.estimatedBudget)} estimés
          </span>
        </div>

        <div className="flex items-center justify-between border-t pt-3">
          <span className="flex items-center gap-2 text-sm">
            <UserAvatar user={trip.organizer} size="sm" />
            <span className="font-medium">{trip.organizer.name}</span>
          </span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users className="size-3.5" />
            {travelersCount(trip)}/{trip.maxTravelers}
            {remaining === 0 ? (
              <span className="font-semibold text-foreground">· Complet</span>
            ) : null}
          </span>
        </div>
      </div>
    </Link>
  )
}
