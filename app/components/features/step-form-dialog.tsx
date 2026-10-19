import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { STEP_TAGS, STEP_TAG_NAMES } from '@/lib/constants'
import { fieldErrors, stepInputSchema } from '@/lib/schemas'
import { cn } from '@/lib/utils'
import type { StepFormValues } from '@/lib/schemas'
import type { ItineraryStep, Trip } from '@/types'

interface StepFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  trip: Pick<Trip, 'startDate' | 'endDate'>
  /** Étape à modifier ; absente en création. */
  step?: ItineraryStep | null
  /** Date proposée par défaut en création (`YYYY-MM-DD`). */
  defaultDate: string
  onSubmit: (values: StepFormValues) => Promise<void>
}

interface FormState {
  title: string
  date: string
  time: string
  location: string
  estimatedBudget: string
  description: string
  tags: Array<string>
}

const toFormState = (
  step: ItineraryStep | null | undefined,
  defaultDate: string,
): FormState => {
  if (!step) {
    return {
      title: '',
      date: defaultDate,
      time: '09:00',
      location: '',
      estimatedBudget: '',
      description: '',
      tags: [],
    }
  }
  const [date, time] = step.datetime.split('T')
  return {
    title: step.title,
    date,
    time,
    location: step.location,
    estimatedBudget:
      step.estimatedBudget === undefined ? '' : String(step.estimatedBudget),
    description: step.description ?? '',
    tags: step.tags,
  }
}

export const StepFormDialog: React.FC<StepFormDialogProps> = ({
  open,
  onOpenChange,
  trip,
  step,
  defaultDate,
  onSubmit,
}) => {
  const [form, setForm] = useState<FormState>(() =>
    toFormState(step, defaultDate),
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [pending, setPending] = useState(false)

  // Réinitialise le formulaire à chaque ouverture.
  useEffect(() => {
    if (open) {
      setForm(toFormState(step, defaultDate))
      setErrors({})
    }
  }, [open, step, defaultDate])

  const set = <TKey extends keyof FormState>(
    key: TKey,
    value: FormState[TKey],
  ) => setForm((prev) => ({ ...prev, [key]: value }))

  const toggleTag = (tag: string) =>
    set(
      'tags',
      form.tags.includes(tag)
        ? form.tags.filter((t) => t !== tag)
        : [...form.tags, tag],
    )

  const outsideTrip =
    !!form.date && (form.date < trip.startDate || form.date > trip.endDate)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const parsed = stepInputSchema.safeParse({
      title: form.title,
      datetime: `${form.date}T${form.time}`,
      location: form.location,
      description: form.description || undefined,
      estimatedBudget:
        form.estimatedBudget === '' ? undefined : Number(form.estimatedBudget),
      tags: form.tags,
    })
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error))
      return
    }
    setPending(true)
    try {
      await onSubmit(parsed.data)
      onOpenChange(false)
    } catch {
      // L'appelant affiche l'erreur ; on garde la saisie ouverte.
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {step ? 'Modifier l’étape' : 'Nouvelle étape'}
          </DialogTitle>
          <DialogDescription>
            Transport, nuit, visite ou resto : chaque moment du voyage.
          </DialogDescription>
        </DialogHeader>

        <form
          id="step-form"
          onSubmit={handleSubmit}
          noValidate
          className="grid gap-4"
        >
          <div className="grid gap-2">
            <Label htmlFor="step-title">Titre</Label>
            <Input
              id="step-title"
              placeholder="Ex : Arrivée Manille"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              aria-invalid={!!errors.title}
              autoFocus
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="step-date">Date</Label>
              <Input
                id="step-date"
                type="date"
                value={form.date}
                onChange={(e) => set('date', e.target.value)}
                aria-invalid={!!errors.datetime}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="step-time">Heure</Label>
              <Input
                id="step-time"
                type="time"
                value={form.time}
                onChange={(e) => set('time', e.target.value)}
                aria-invalid={!!errors.datetime}
              />
            </div>
            {errors.datetime && (
              <p className="col-span-2 text-sm text-destructive">
                {errors.datetime}
              </p>
            )}
            {!errors.datetime && outsideTrip && (
              <p className="col-span-2 text-sm text-amber-700 dark:text-amber-400">
                Cette date est en dehors des dates du voyage.
              </p>
            )}
          </div>

          <div className="grid grid-cols-[1fr_8rem] gap-3">
            <div className="grid gap-2">
              <Label htmlFor="step-location">Lieu</Label>
              <Input
                id="step-location"
                placeholder="Ex : Coron"
                value={form.location}
                onChange={(e) => set('location', e.target.value)}
                aria-invalid={!!errors.location}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="step-budget">Budget (€)</Label>
              <Input
                id="step-budget"
                type="number"
                min={0}
                inputMode="numeric"
                placeholder="—"
                value={form.estimatedBudget}
                onChange={(e) => set('estimatedBudget', e.target.value)}
                aria-invalid={!!errors.estimatedBudget}
              />
            </div>
            {(errors.location || errors.estimatedBudget) && (
              <p className="col-span-2 text-sm text-destructive">
                {errors.location || errors.estimatedBudget}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label>Catégories</Label>
            <div className="flex flex-wrap gap-2">
              {STEP_TAG_NAMES.map((tag) => {
                const { icon: Icon, badge } = STEP_TAGS[tag]
                const active = form.tags.includes(tag)
                return (
                  <button
                    key={tag}
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggleTag(tag)}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium transition',
                      active
                        ? cn(badge, 'border-current')
                        : 'bg-card text-muted-foreground hover:bg-accent',
                    )}
                  >
                    <Icon className="size-3.5" />
                    {tag}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="step-description">Note (optionnel)</Label>
            <Textarea
              id="step-description"
              rows={2}
              placeholder="Ex : Macdo centre-ville"
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
            />
          </div>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button type="submit" form="step-form" disabled={pending}>
            {pending && <Loader2 className="animate-spin" />}
            {step ? 'Enregistrer' : 'Ajouter l’étape'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
