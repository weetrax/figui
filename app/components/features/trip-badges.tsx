import { Lock, Tag } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { STEP_TAGS, isStepTag } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { TripStatus } from '@/types'

const STATUS_STYLES: Record<TripStatus, string> = {
  'A venir': 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-100',
  'En cours':
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100',
  Terminé: 'bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200',
}

const STATUS_LABELS: Record<TripStatus, string> = {
  'A venir': 'À venir',
  'En cours': 'En cours',
  Terminé: 'Terminé',
}

export const TripStatusBadge: React.FC<{
  status: TripStatus
  className?: string
}> = ({ status, className }) => (
  <Badge className={cn('border-0', STATUS_STYLES[status], className)}>
    {STATUS_LABELS[status]}
  </Badge>
)

export const PrivateBadge: React.FC<{ className?: string }> = ({
  className,
}) => (
  <Badge
    className={cn(
      'border-0 bg-amber-100 text-amber-900 dark:bg-amber-900 dark:text-amber-100',
      className,
    )}
  >
    <Lock />
    Privé
  </Badge>
)

export const TripTagBadge: React.FC<{ tag: string }> = ({ tag }) => (
  <Badge variant="secondary" className="font-medium">
    {tag}
  </Badge>
)

export const StepTagBadge: React.FC<{ tag: string }> = ({ tag }) => {
  const style = isStepTag(tag) ? STEP_TAGS[tag] : null
  const Icon = style?.icon ?? Tag
  return (
    <Badge
      className={cn(
        'border-0 font-medium',
        style?.badge ?? 'bg-secondary text-secondary-foreground',
      )}
    >
      <Icon />
      {tag}
    </Badge>
  )
}
