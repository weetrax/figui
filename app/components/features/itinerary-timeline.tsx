import { useRouter } from '@tanstack/react-router'
import {
  Clock,
  MapPin,
  MoreHorizontal,
  Pencil,
  Plus,
  Route,
  Trash2,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { StepFormDialog } from '@/components/features/step-form-dialog'
import { StepTagBadge } from '@/components/features/trip-badges'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { createStep, deleteStep, updateStep } from '@/lib/api/trips'
import { STEP_TAGS, isStepTag } from '@/lib/constants'
import {
  countDays,
  formatCurrency,
  formatDayMonth,
  formatLongDay,
  formatTime,
  todayIso,
} from '@/lib/format'
import { cn } from '@/lib/utils'
import type { StepFormValues } from '@/lib/schemas'
import type { ItineraryStep, TripWithSteps } from '@/types'

interface ItineraryTimelineProps {
  trip: TripWithSteps
  canEdit: boolean
}

const kickerFor = (trip: TripWithSteps): string => {
  if (trip.status === 'En cours') return 'C’est parti !'
  if (trip.status === 'Terminé') return 'Souvenirs de voyage'
  const daysUntil = countDays(todayIso(), trip.startDate) - 1
  if (daysUntil <= 30) return 'On y est presque'
  return `Départ dans ${daysUntil} jours`
}

const dotClass = (step: ItineraryStep): string => {
  const tag = step.tags.find(isStepTag)
  return tag ? STEP_TAGS[tag].dot : 'border-muted-foreground'
}

export const ItineraryTimeline: React.FC<ItineraryTimelineProps> = ({
  trip,
  canEdit,
}) => {
  const router = useRouter()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<ItineraryStep | null>(null)
  const [deleting, setDeleting] = useState<ItineraryStep | null>(null)

  const lastDate = trip.steps.at(-1)?.datetime.split('T')[0]
  const defaultDate = lastDate ?? trip.startDate

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (step: ItineraryStep) => {
    setEditing(step)
    setFormOpen(true)
  }

  const handleSubmit = async (values: StepFormValues) => {
    try {
      if (editing) {
        await updateStep({ data: { id: editing.id, data: values } })
        toast.success('Étape mise à jour')
      } else {
        await createStep({ data: { tripId: trip.id, data: values } })
        toast.success('Étape ajoutée au programme')
      }
      await router.invalidate()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Enregistrement impossible',
      )
      throw error
    }
  }

  const handleDelete = async () => {
    if (!deleting) return
    try {
      await deleteStep({ data: { id: deleting.id } })
      toast.success('Étape supprimée')
      await router.invalidate()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Suppression impossible',
      )
    } finally {
      setDeleting(null)
    }
  }

  return (
    <Card className="gap-6 rounded-2xl py-6">
      <CardContent className="space-y-6 px-5 sm:px-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
              {kickerFor(trip)}
            </p>
            <h2 className="mt-1 text-2xl font-semibold">Le programme</h2>
          </div>
          {canEdit && (
            <Button
              variant="outline"
              className="rounded-lg"
              onClick={openCreate}
            >
              <Plus />
              <span className="hidden sm:inline">Ajouter une étape</span>
            </Button>
          )}
        </div>

        {trip.steps.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-10 text-center">
            <Route className="size-6 text-muted-foreground" />
            <p className="font-medium">Le programme est encore vide</p>
            <p className="text-sm text-muted-foreground">
              {canEdit
                ? 'Ajoutez la première étape : vol, hôtel, visite…'
                : 'L’organisateur n’a pas encore ajouté d’étapes.'}
            </p>
            {canEdit && (
              <Button size="sm" className="rounded-full" onClick={openCreate}>
                <Plus />
                Ajouter une étape
              </Button>
            )}
          </div>
        ) : (
          <ol>
            {trip.steps.map((step, index) => (
              <TimelineItem
                key={step.id}
                step={step}
                isLast={index === trip.steps.length - 1}
                canEdit={canEdit}
                onEdit={() => openEdit(step)}
                onDelete={() => setDeleting(step)}
              />
            ))}
          </ol>
        )}
      </CardContent>

      {canEdit && (
        <>
          <StepFormDialog
            open={formOpen}
            onOpenChange={setFormOpen}
            trip={trip}
            step={editing}
            defaultDate={defaultDate}
            onSubmit={handleSubmit}
          />
          <AlertDialog
            open={!!deleting}
            onOpenChange={(open) => !open && setDeleting(null)}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Supprimer cette étape ?</AlertDialogTitle>
                <AlertDialogDescription>
                  « {deleting?.title} » sera retirée du programme pour tous les
                  voyageurs.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-white hover:bg-destructive/90"
                  onClick={handleDelete}
                >
                  Supprimer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </Card>
  )
}

interface TimelineItemProps {
  step: ItineraryStep
  isLast: boolean
  canEdit: boolean
  onEdit: () => void
  onDelete: () => void
}

const TimelineItem: React.FC<TimelineItemProps> = ({
  step,
  isLast,
  canEdit,
  onEdit,
  onDelete,
}) => {
  const { day, month } = formatDayMonth(step.datetime)

  return (
    <li className="grid grid-cols-[2.75rem_1.5rem_1fr] gap-x-2 sm:grid-cols-[3.5rem_2rem_1fr]">
      <time
        dateTime={step.datetime}
        title={formatLongDay(step.datetime)}
        className="pt-0.5"
      >
        <span className="block text-lg leading-none font-semibold tabular-nums">
          {day}
        </span>
        <span className="mt-1 block text-xs text-muted-foreground capitalize">
          {month}
        </span>
      </time>

      <div className="relative flex justify-center">
        <span
          className={cn(
            'relative z-10 mt-1.5 size-3 rounded-full border-2 bg-card',
            dotClass(step),
          )}
        />
        {!isLast && (
          <span className="absolute top-6 bottom-1 w-px border-l border-dashed border-border" />
        )}
      </div>

      <div className={cn('min-w-0', !isLast && 'pb-8')}>
        <div className="flex items-start gap-2">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1">
            <h3 className="font-semibold">{step.title}</h3>
            {step.tags.map((tag) => (
              <StepTagBadge key={tag} tag={tag} />
            ))}
          </div>
          {canEdit && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="-mt-1 text-muted-foreground"
                  aria-label={`Actions pour ${step.title}`}
                >
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={onEdit}>
                  <Pencil />
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive" onSelect={onDelete}>
                  <Trash2 />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Clock className="size-3.5" />
            {formatTime(step.datetime)}
          </span>
          <span className="flex min-w-0 items-center gap-1.5">
            <MapPin className="size-3.5 shrink-0" />
            <span className="truncate">{step.location}</span>
          </span>
          {step.estimatedBudget !== undefined && (
            <span className="ml-auto font-medium text-foreground tabular-nums">
              {formatCurrency(step.estimatedBudget)}
            </span>
          )}
        </div>

        {step.description && (
          <p className="mt-2 text-sm text-muted-foreground">
            {step.description}
          </p>
        )}
      </div>
    </li>
  )
}
