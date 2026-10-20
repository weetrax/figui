import {
  Link,
  createFileRoute,
  redirect,
  useRouter,
} from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { TripForm } from '@/components/features/trip-form'
import { Container } from '@/components/layout/container'
import { getTripBySlug, updateTrip } from '@/lib/api/trips'
import { isOrganizer } from '@/lib/permissions'
import type { TripInput } from '@/types'

export const Route = createFileRoute('/trips/$slug/edit')({
  beforeLoad: ({ context, location }) => {
    if (!context.user) {
      throw redirect({ to: '/login', search: { redirect: location.href } })
    }
  },
  loader: async ({ params, context }) => {
    const trip = await getTripBySlug({ data: { slug: params.slug } })
    if (!isOrganizer(trip, context.user)) {
      throw redirect({ to: '/trips/$slug', params: { slug: trip.slug } })
    }
    return trip
  },
  head: ({ loaderData }) => ({
    meta: [{ title: `Modifier ${loaderData?.title ?? 'le voyage'} — Figui` }],
  }),
  component: EditTripPage,
})

function EditTripPage() {
  const trip = Route.useLoaderData()
  const router = useRouter()

  const initialValues: TripInput = {
    title: trip.title,
    coverImageUrl: trip.coverImageUrl,
    description: trip.description,
    startDate: trip.startDate,
    endDate: trip.endDate,
    isDateFlexible: trip.isDateFlexible,
    isPublic: trip.isPublic,
    tags: trip.tags,
    countries: trip.countries,
    estimatedBudget: trip.estimatedBudget,
    maxTravelers: trip.maxTravelers,
  }

  const handleSubmit = async (values: TripInput) => {
    try {
      const updated = await updateTrip({ data: { id: trip.id, data: values } })
      toast.success('Voyage mis à jour')
      await router.navigate({
        to: '/trips/$slug',
        params: { slug: updated.slug },
      })
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Mise à jour impossible',
      )
    }
  }

  return (
    <Container className="space-y-6 pt-8">
      <Link
        to="/trips/$slug"
        params={{ slug: trip.slug }}
        className="inline-flex items-center gap-2 text-sm font-medium hover:text-primary"
      >
        <ArrowLeft className="size-4" />
        Retour au voyage
      </Link>
      <h1 className="text-3xl font-bold">Modifier « {trip.title} »</h1>
      <TripForm
        initialValues={initialValues}
        submitLabel="Enregistrer"
        onSubmit={handleSubmit}
        onCancel={() =>
          router.navigate({ to: '/trips/$slug', params: { slug: trip.slug } })
        }
      />
    </Container>
  )
}
