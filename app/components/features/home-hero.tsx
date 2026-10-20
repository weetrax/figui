import { Link } from '@tanstack/react-router'
import { Compass, Plus } from 'lucide-react'
import { DestinationsGlobe } from '@/components/features/destinations-globe'
import { Container } from '@/components/layout/container'
import { Button } from '@/components/ui/button'
import { countryFlag } from '@/lib/countries'
import { cn } from '@/lib/utils'
import type { Destination } from '@/types'

interface HomeHeroProps {
  destinations: Array<Destination>
  onSelect: (destination: Destination) => void
}

const HeroActions: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('flex flex-wrap gap-3', className)}>
    <Button asChild size="lg" className="rounded-full">
      <Link to="/trips/new">
        <Plus />
        Créer un voyage
      </Link>
    </Button>
    <Button
      asChild
      size="lg"
      variant="outline"
      className="rounded-full bg-background/70 backdrop-blur"
    >
      <a href="#explorer">
        <Compass />
        Explorer les voyages
      </a>
    </Button>
  </div>
)

const Kicker: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
    {children}
  </p>
)

/**
 * Hero « horizon » de l'accueil : texte centré et globe géant qui se lève
 * depuis le bas de l'écran, à moitié visible.
 */
export const HomeHero: React.FC<HomeHeroProps> = ({
  destinations,
  onSelect,
}) => (
  <section className="relative isolate flex min-h-[calc(100svh-4rem)] flex-col overflow-hidden border-b bg-linear-to-b from-sky-50 via-background to-orange-50 dark:from-sky-950/50 dark:via-background dark:to-orange-950/40">
    <Container className="relative z-10 flex flex-col items-center pt-20 text-center sm:pt-24">
      <Kicker>Voyager ensemble</Kicker>
      <h1 className="mt-4 max-w-4xl text-4xl leading-[1.05] font-extrabold tracking-tight text-balance sm:text-6xl lg:text-7xl">
        Le monde est grand.
        <span className="block bg-linear-to-r from-orange-500 to-primary bg-clip-text pb-[0.12em] text-transparent">
          Partez accompagné.
        </span>
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-pretty text-muted-foreground">
        Publiez votre projet de voyage, trouvez des compagnons qui partagent vos
        envies et construisez l’itinéraire ensemble.
      </p>
      <HeroActions className="mt-8 justify-center" />

      {destinations.length > 0 && (
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {destinations.map((destination) => (
            <button
              key={destination.code}
              type="button"
              onClick={() => onSelect(destination)}
              className="inline-flex items-center gap-1.5 rounded-full border bg-background/70 px-3 py-1 text-sm font-medium backdrop-blur transition hover:border-primary hover:text-primary"
            >
              <span aria-hidden>{countryFlag(destination.code)}</span>
              {destination.name}
            </button>
          ))}
        </div>
      )}
    </Container>

    {/* Espace réservé à la moitié visible du globe. */}
    <div aria-hidden className="h-[min(60vw,560px)] shrink-0" />

    <DestinationsGlobe
      destinations={destinations}
      onSelect={onSelect}
      tilt={30}
      className="absolute bottom-0 left-1/2 w-[min(125vw,1150px)] -translate-x-1/2 translate-y-[50%]"
    />
  </section>
)
