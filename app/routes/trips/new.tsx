import {
  Link,
  createFileRoute,
  redirect,
  useRouter,
} from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { TripForm } from '@/components/features/trip-form'
import { createTrip } from '@/lib/api/trips'
import type { TripInput } from '@/types'

export const Route = createFileRoute('/trips/new')({
  beforeLoad: ({ context, location }) => {
    if (!context.user) {
      throw redirect({ to: '/login', search: { redirect: location.href } })
    }
  },
  head: () => ({ meta: [{ title: 'Nouveau voyage — Figui' }] }),
  component: NewTripPage,
})

function NewTripPage() {
  const router = useRouter()

  const handleSubmit = async (values: TripInput) => {
    try {
      const trip = await createTrip({ data: values })
      toast.success('Voyage créé ! Ajoutez maintenant les étapes du programme.')
      await router.navigate({ to: '/trips/$slug', params: { slug: trip.slug } })
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Création impossible',
      )
    }
  }

  return (
    <div className="space-y-6">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm font-medium hover:text-primary"
      >
        <ArrowLeft className="size-4" />
        Tous les voyages
      </Link>
      <div>
        <h1 className="text-3xl font-bold">Nouveau voyage</h1>
        <p className="mt-1 text-muted-foreground">
          Décrivez votre projet, vous pourrez construire le programme juste
          après.
        </p>
      </div>
      <TripForm
        submitLabel="Créer le voyage"
        onSubmit={handleSubmit}
        onCancel={() => router.history.back()}
      />
    </div>
  )
}
