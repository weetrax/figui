import {
  BedDouble,
  Bus,
  Camera,
  Leaf,
  ShoppingBag,
  UtensilsCrossed,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export const TRIP_TAGS = [
  'Randonnée',
  'Food',
  'Culture',
  'Plage',
  'Aventure',
  'Détente',
  'Road trip',
  'Ville',
] as const

export interface StepTagStyle {
  icon: LucideIcon
  /** Classes du badge. */
  badge: string
  /** Classes de la pastille sur la frise. */
  dot: string
}

export const STEP_TAGS = {
  Transport: {
    icon: Bus,
    badge: 'bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
    dot: 'border-sky-500',
  },
  Hébergement: {
    icon: BedDouble,
    badge:
      'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
    dot: 'border-emerald-500',
  },
  Visite: {
    icon: Camera,
    badge:
      'bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
    dot: 'border-orange-500',
  },
  Nature: {
    icon: Leaf,
    badge: 'bg-lime-50 text-lime-700 dark:bg-lime-950 dark:text-lime-300',
    dot: 'border-lime-600',
  },
  Restaurant: {
    icon: UtensilsCrossed,
    badge: 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
    dot: 'border-rose-500',
  },
  Shopping: {
    icon: ShoppingBag,
    badge:
      'bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
    dot: 'border-violet-500',
  },
} satisfies Record<string, StepTagStyle>

export type StepTag = keyof typeof STEP_TAGS

export const STEP_TAG_NAMES = Object.keys(STEP_TAGS) as Array<StepTag>

export const isStepTag = (tag: string): tag is StepTag => tag in STEP_TAGS

export const DEFAULT_COVER_IMAGE =
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1600&q=80'
