import { Link, createFileRoute } from '@tanstack/react-router'
import { ArrowLeft, Pencil } from 'lucide-react'
import { DeleteTripButton } from '@/components/features/delete-trip-button'
import { ItineraryTimeline } from '@/components/features/itinerary-timeline'
import { TravelersCard } from '@/components/features/travelers-card'
import { TripHero } from '@/components/features/trip-hero'
import { TripOverview } from '@/components/features/trip-overview'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getTripBySlug } from '@/lib/api/trips'
import { canEditItinerary, isOrganizer } from '@/lib/permissions'

export const Route = createFileRoute('/trips/$slug/')({
  loader: ({ params }) => getTripBySlug({ data: { slug: params.slug } }),
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.title} — Figui` },
          { name: 'description', content: loaderData.description },
          { property: 'og:title', content: loaderData.title },
          { property: 'og:image', content: loaderData.coverImageUrl },
        ]
      : [],
  }),
  component: TripDetailPage,
})

function TripDetailPage() {
  const trip = Route.useLoaderData()
  const { user } = Route.useRouteContext()
  const organizer = isOrganizer(trip, user)

  return (
    <div className="space-y-6">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm font-medium hover:text-primary"
      >
        <ArrowLeft className="size-4" />
        Tous les voyages
      </Link>

      <TripHero
        trip={trip}
        actions={
          organizer && (
            <>
              <Button
                asChild
                variant="outline"
                className="rounded-lg border-white/60 bg-white text-foreground hover:bg-white/90"
              >
                <Link to="/trips/$slug/edit" params={{ slug: trip.slug }}>
                  <Pencil />
                  Modifier
                </Link>
              </Button>
              <DeleteTripButton trip={trip} />
            </>
          )
        }
      />

      <TripOverview trip={trip} />

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="min-w-0 space-y-6">
          {trip.description && (
            <Card className="rounded-2xl py-5">
              <CardContent className="px-5 whitespace-pre-line sm:px-6">
                {trip.description}
              </CardContent>
            </Card>
          )}
          <ItineraryTimeline
            trip={trip}
            canEdit={canEditItinerary(trip, user)}
          />
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24">
          <TravelersCard trip={trip} user={user} />
        </aside>
      </div>
    </div>
  )
}
