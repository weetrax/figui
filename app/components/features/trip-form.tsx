import { Globe, Loader2, Lock } from 'lucide-react'
import { useState } from 'react'
import { CountryMultiSelect } from '@/components/features/country-multi-select'
import { CoverImage } from '@/components/features/cover-image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { TRIP_TAGS } from '@/lib/constants'
import { fieldErrors, tripInputSchema } from '@/lib/schemas'
import { cn } from '@/lib/utils'
import type { TripInput } from '@/types'

interface TripFormProps {
  initialValues?: TripInput
  submitLabel: string
  onSubmit: (values: TripInput) => Promise<void>
  onCancel: () => void
}

/** Valeurs du formulaire : les nombres restent des chaînes pendant la saisie. */
interface FormState extends Omit<
  TripInput,
  'estimatedBudget' | 'maxTravelers'
> {
  estimatedBudget: string
  maxTravelers: string
}

const EMPTY: FormState = {
  title: '',
  coverImageUrl: '',
  description: '',
  startDate: '',
  endDate: '',
  isDateFlexible: false,
  isPublic: true,
  tags: [],
  countries: [],
  estimatedBudget: '',
  maxTravelers: '4',
}

const toFormState = (values?: TripInput): FormState =>
  values
    ? {
        ...values,
        estimatedBudget: String(values.estimatedBudget),
        maxTravelers: String(values.maxTravelers),
      }
    : EMPTY

export const TripForm: React.FC<TripFormProps> = ({
  initialValues,
  submitLabel,
  onSubmit,
  onCancel,
}) => {
  const [form, setForm] = useState<FormState>(() => toFormState(initialValues))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [pending, setPending] = useState(false)

  const set = <TKey extends keyof FormState>(
    key: TKey,
    value: FormState[TKey],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    // L'erreur d'un champ disparaît dès qu'il est modifié.
    setErrors((prev) => {
      if (!(key in prev)) return prev
      const { [key]: _removed, ...rest } = prev
      return rest
    })
  }

  const toggleTag = (tag: string) =>
    set(
      'tags',
      form.tags.includes(tag)
        ? form.tags.filter((t) => t !== tag)
        : [...form.tags, tag],
    )

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const parsed = tripInputSchema.safeParse({
      ...form,
      estimatedBudget:
        form.estimatedBudget === '' ? 0 : Number(form.estimatedBudget),
      maxTravelers: Number(form.maxTravelers),
    })
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error))
      return
    }
    setErrors({})
    setPending(true)
    try {
      await onSubmit(parsed.data)
    } finally {
      setPending(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="grid gap-6 lg:grid-cols-3"
    >
      <Card className="gap-5 rounded-2xl lg:col-span-2">
        <CardContent className="grid gap-5">
          <Field label="Titre du voyage" htmlFor="title" error={errors.title}>
            <Input
              id="title"
              placeholder="Ex : Philippines"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              aria-invalid={!!errors.title}
            />
          </Field>

          <Field label="Pays" htmlFor="countries" error={errors.countries}>
            <CountryMultiSelect
              id="countries"
              value={form.countries}
              onChange={(codes) => set('countries', codes)}
              invalid={!!errors.countries}
            />
          </Field>

          <Field
            label="Description"
            htmlFor="description"
            error={errors.description}
          >
            <Textarea
              id="description"
              rows={4}
              placeholder="Ex : Road trip aux Philippines, d’îles en îles…"
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Date de début"
              htmlFor="startDate"
              error={errors.startDate}
            >
              <Input
                id="startDate"
                type="date"
                value={form.startDate}
                onChange={(e) => set('startDate', e.target.value)}
                aria-invalid={!!errors.startDate}
              />
            </Field>
            <Field label="Date de fin" htmlFor="endDate" error={errors.endDate}>
              <Input
                id="endDate"
                type="date"
                min={form.startDate || undefined}
                value={form.endDate}
                onChange={(e) => set('endDate', e.target.value)}
                aria-invalid={!!errors.endDate}
              />
            </Field>
          </div>

          <ToggleRow
            id="isDateFlexible"
            label="Dates flexibles"
            hint="Les dates peuvent bouger de quelques jours selon les voyageurs."
            checked={form.isDateFlexible}
            onChange={(v) => set('isDateFlexible', v)}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Budget estimé (€)"
              htmlFor="estimatedBudget"
              error={errors.estimatedBudget}
            >
              <Input
                id="estimatedBudget"
                type="number"
                min={0}
                inputMode="numeric"
                placeholder="2000"
                value={form.estimatedBudget}
                onChange={(e) => set('estimatedBudget', e.target.value)}
                aria-invalid={!!errors.estimatedBudget}
              />
            </Field>
            <Field
              label="Voyageurs max (vous inclus)"
              htmlFor="maxTravelers"
              error={errors.maxTravelers}
            >
              <Input
                id="maxTravelers"
                type="number"
                min={1}
                max={50}
                inputMode="numeric"
                value={form.maxTravelers}
                onChange={(e) => set('maxTravelers', e.target.value)}
                aria-invalid={!!errors.maxTravelers}
              />
            </Field>
          </div>

          <Field label="Style de voyage" error={errors.tags}>
            <div className="flex flex-wrap gap-2">
              {TRIP_TAGS.map((tag) => {
                const active = form.tags.includes(tag)
                return (
                  <button
                    key={tag}
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggleTag(tag)}
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-sm font-medium transition',
                      active
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'bg-card hover:bg-accent',
                    )}
                  >
                    {tag}
                  </button>
                )
              })}
            </div>
          </Field>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card className="gap-4 rounded-2xl pt-0">
          <CoverImage
            src={form.coverImageUrl}
            alt="Aperçu de la couverture"
            className="aspect-[16/10] w-full rounded-t-2xl"
          />
          <CardContent>
            <Field
              label="Image de couverture (URL)"
              htmlFor="coverImageUrl"
              error={errors.coverImageUrl}
            >
              <Input
                id="coverImageUrl"
                type="url"
                placeholder="https://images.unsplash.com/…"
                value={form.coverImageUrl}
                onChange={(e) => set('coverImageUrl', e.target.value)}
                aria-invalid={!!errors.coverImageUrl}
              />
            </Field>
          </CardContent>
        </Card>

        <Card className="gap-4 rounded-2xl">
          <CardContent>
            <ToggleRow
              id="isPublic"
              label={form.isPublic ? 'Voyage public' : 'Voyage privé'}
              icon={form.isPublic ? Globe : Lock}
              hint={
                form.isPublic
                  ? 'Visible par tous, chacun peut demander à rejoindre.'
                  : 'Visible uniquement par vous et les participants.'
              }
              checked={form.isPublic}
              onChange={(v) => set('isPublic', v)}
            />
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1 rounded-full"
            onClick={onCancel}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            className="flex-1 rounded-full"
            disabled={pending}
          >
            {pending && <Loader2 className="animate-spin" />}
            {submitLabel}
          </Button>
        </div>
      </div>
    </form>
  )
}

const Field: React.FC<{
  label: string
  htmlFor?: string
  error?: string
  children: React.ReactNode
}> = ({ label, htmlFor, error, children }) => (
  <div className="grid gap-2">
    <Label htmlFor={htmlFor}>{label}</Label>
    {children}
    {error && <p className="text-sm text-destructive">{error}</p>}
  </div>
)

const ToggleRow: React.FC<{
  id: string
  label: string
  hint: string
  checked: boolean
  icon?: React.ComponentType<{ className?: string }>
  onChange: (value: boolean) => void
}> = ({ id, label, hint, checked, icon: Icon, onChange }) => (
  <div className="flex items-start justify-between gap-4">
    <div className="space-y-1">
      <Label htmlFor={id} className="flex items-center gap-2">
        {Icon && <Icon className="size-4 text-muted-foreground" />}
        {label}
      </Label>
      <p className="text-sm text-muted-foreground">{hint}</p>
    </div>
    <Switch id={id} checked={checked} onCheckedChange={onChange} />
  </div>
)
