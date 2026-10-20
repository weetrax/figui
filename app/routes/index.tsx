import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Check, Search, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { HomeHero } from '@/components/features/home-hero'
import { TripCard } from '@/components/features/trip-card'
import { Container } from '@/components/layout/container'
import { Input } from '@/components/ui/input'
import { listDestinations } from '@/lib/api/destinations'
import {
  listMyTrips,
  listPublicTrips,
  tripFiltersSchema,
} from '@/lib/api/trips'
import { TRIP_TAGS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { Destination, Trip } from '@/types'

export const Route = createFileRoute('/')({
  validateSearch: tripFiltersSchema,
  loaderDeps: ({ search }) => ({ q: search.q, tags: search.tags }),
  loader: async ({ deps, context }) => {
    const [trips, myTrips, destinations] = await Promise.all([
      listPublicTrips({ data: deps }),
      context.user ? listMyTrips() : Promise.resolve<Array<Trip>>([]),
      listDestinations(),
    ])
    return { trips, myTrips, destinations }
  },
  component: HomePage,
})

function HomePage() {
  const { trips, myTrips, destinations } = Route.useLoaderData()
  const { user } = Route.useRouteContext()
  const search = Route.useSearch()
  const navigate = useNavigate({ from: '/' })

  // Stable pour ne pas réinitialiser l'animation du globe à chaque rendu.
  const showDestination = useCallback(
    (destination: Destination) =>
      void navigate({
        search: { q: destination.name },
        hash: 'explorer',
      }),
    [navigate],
  )

  return (
    <>
      <HomeHero destinations={destinations} onSelect={showDestination} />

      <Container className="space-y-14 pt-14">
        {user && (
          <section id="mes-voyages" className="scroll-mt-24 space-y-5">
            <SectionHeading
              kicker={`Bonjour ${user.name}`}
              title="Mes voyages"
            />
            {myTrips.length > 0 ? (
              <TripGrid trips={myTrips} />
            ) : (
              <EmptyState
                title="Aucun voyage pour l’instant"
                text="Créez votre premier itinéraire ou rejoignez une aventure ci-dessous."
              />
            )}
          </section>
        )}

        <section id="explorer" className="scroll-mt-24 space-y-5">
          <SectionHeading
            kicker="Explorer"
            title="Voyages ouverts aux compagnons"
          />
          <Filters q={search.q} tags={search.tags ?? []} />
          {trips.length > 0 ? (
            <TripGrid trips={trips} />
          ) : (
            <EmptyState
              title="Aucun voyage ne correspond"
              text="Essayez une autre destination ou retirez les filtres."
            />
          )}
        </section>
      </Container>
    </>
  )
}

const SectionHeading: React.FC<{ kicker: string; title: string }> = ({
  kicker,
  title,
}) => (
  <div>
    <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
      {kicker}
    </p>
    <h2 className="mt-1 text-2xl font-bold">{title}</h2>
  </div>
)

const TripGrid: React.FC<{ trips: Array<Trip> }> = ({ trips }) => (
  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
    {trips.map((trip) => (
      <TripCard key={trip.id} trip={trip} />
    ))}
  </div>
)

const EmptyState: React.FC<{ title: string; text: string }> = ({
  title,
  text,
}) => (
  <div className="rounded-2xl border border-dashed bg-card/60 px-6 py-12 text-center">
    <p className="font-semibold">{title}</p>
    <p className="mt-1 text-sm text-muted-foreground">{text}</p>
  </div>
)

interface FiltersProps {
  q?: string
  tags: Array<string>
}

const Filters: React.FC<FiltersProps> = ({ q, tags }) => {
  const navigate = useNavigate({ from: '/' })
  const [query, setQuery] = useState(q ?? '')

  useEffect(() => setQuery(q ?? ''), [q])

  const setSearch = (next: { q?: string; tags?: Array<string> }) =>
    void navigate({
      search: (prev) => ({ ...prev, ...next }),
      resetScroll: false,
    })

  const toggleTag = (tag: string) => {
    const next = tags.includes(tag)
      ? tags.filter((t) => t !== tag)
      : [...tags, tag]
    setSearch({ tags: next.length ? next : undefined })
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    setSearch({ q: query.trim() || undefined })
  }

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="relative w-full sm:max-w-md">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Destination, pays…"
          aria-label="Rechercher un voyage"
          className="h-10 rounded-full bg-card pr-9 pl-9"
        />
        {query && (
          <button
            type="button"
            aria-label="Effacer la recherche"
            onClick={() => {
              setQuery('')
              setSearch({ q: undefined })
            }}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </form>

      <div
        role="group"
        aria-label="Filtrer par style de voyage"
        className="flex flex-wrap gap-2"
      >
        <TagChip
          label="Tous"
          active={tags.length === 0}
          onClick={() => setSearch({ tags: undefined })}
        />
        {TRIP_TAGS.map((tag) => (
          <TagChip
            key={tag}
            label={tag}
            active={tags.includes(tag)}
            onClick={() => toggleTag(tag)}
          />
        ))}
      </div>
    </div>
  )
}

interface TagChipProps {
  label: string
  active: boolean
  onClick: () => void
}

const TagChip: React.FC<TagChipProps> = ({ label, active, onClick }) => (
  <button
    type="button"
    aria-pressed={active}
    onClick={onClick}
    className={cn(
      'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition',
      active
        ? 'border-primary bg-primary text-primary-foreground'
        : 'bg-card hover:bg-accent',
    )}
  >
    {active && label !== 'Tous' && <Check className="size-3.5" />}
    {label}
  </button>
)
