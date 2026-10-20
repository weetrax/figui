import { z } from 'zod'
import { STEP_TAG_NAMES } from '@/lib/constants'
import { isCountryCode } from '@/lib/countries'

const isoDate = z
  .string()
  .min(1, 'Choisissez une date')
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date invalide (AAAA-MM-JJ)')

const isoDateTime = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, 'Date et heure invalides')

export const tripInputSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(2, 'Le titre doit contenir au moins 2 caractères')
      .max(80),
    coverImageUrl: z.union([z.literal(''), z.url('URL d’image invalide')]),
    description: z.string().trim().max(2000),
    startDate: isoDate,
    endDate: isoDate,
    isDateFlexible: z.boolean(),
    isPublic: z.boolean(),
    tags: z.array(z.string().trim().min(1)).max(8),
    countries: z
      .array(z.string().refine(isCountryCode, 'Code pays ISO inconnu'))
      .min(1, 'Choisissez au moins un pays')
      .max(10, '10 pays maximum'),
    estimatedBudget: z.number().min(0, 'Le budget doit être positif'),
    maxTravelers: z
      .number()
      .int()
      .min(1, 'Au moins 1 voyageur')
      .max(50, '50 voyageurs maximum'),
  })
  .refine((trip) => trip.endDate >= trip.startDate, {
    message: 'La date de fin doit être après la date de début',
    path: ['endDate'],
  })

export const stepInputSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, 'Le titre doit contenir au moins 2 caractères')
    .max(80),
  description: z.string().trim().max(1000).optional(),
  datetime: isoDateTime,
  location: z.string().trim().min(1, 'Indiquez un lieu').max(80),
  estimatedBudget: z.number().min(0, 'Le budget doit être positif').optional(),
  tags: z.array(z.enum(STEP_TAG_NAMES)).max(6),
})

export const loginSchema = z.object({
  name: z.string().trim().min(2, 'Indiquez votre nom').max(40),
  email: z.email('Email invalide'),
})

/** Transforme une erreur zod en dictionnaire `champ → message`. */
export const fieldErrors = (error: z.ZodError): Record<string, string> => {
  const errors: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = issue.path.join('.')
    if (!(key in errors)) errors[key] = issue.message
  }
  return errors
}

export type StepFormValues = z.infer<typeof stepInputSchema>
