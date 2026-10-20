import { CalendarDays, Flag, Wallet } from 'lucide-react'
import { TripTagBadge } from '@/components/features/trip-badges'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { countryFlag, countryName } from '@/lib/countries'
import {
  countDays,
  formatCurrency,
  formatDateRange,
  sumStepsBudget,
} from '@/lib/format'
import { cn } from '@/lib/utils'
import type { TripWithSteps } from '@/types'

interface TripOverviewProps {
  trip: TripWithSteps
}

const StatCard: React.FC<{
  icon: React.ComponentType<{ className?: string }>
  label: string
  children: React.ReactNode
}> = ({ icon: Icon, label, children }) => (
  <Card className="gap-4 rounded-2xl py-5">
    <CardContent className="space-y-3 px-5">
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="size-4" />
        {label}
      </p>
      {children}
    </CardContent>
  </Card>
)

export const TripOverview: React.FC<TripOverviewProps> = ({ trip }) => {
  const days = countDays(trip.startDate, trip.endDate)
  const allocated = sumStepsBudget(trip.steps)
  const ratio = trip.estimatedBudget > 0 ? allocated / trip.estimatedBudget : 0
  const overBudget = allocated > trip.estimatedBudget

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <StatCard icon={CalendarDays} label="Dates">
        <div>
          <p className="text-lg font-semibold">
            {formatDateRange(trip.startDate, trip.endDate)}
          </p>
          <p className="text-sm text-muted-foreground">
            {days} jour{days > 1 ? 's' : ''}
            {trip.isDateFlexible && ' · dates flexibles'}
          </p>
        </div>
      </StatCard>

      <StatCard icon={Flag} label="Pays">
        <div className="flex flex-wrap gap-1.5">
          {trip.countries.map((code) => (
            <Badge key={code} variant="outline" className="bg-card">
              <span aria-hidden>{countryFlag(code)}</span>
              {countryName(code)}
            </Badge>
          ))}
          {trip.tags.map((tag) => (
            <TripTagBadge key={tag} tag={tag} />
          ))}
        </div>
      </StatCard>

      <StatCard icon={Wallet} label="Budget">
        <p className="text-lg font-semibold">
          {formatCurrency(trip.estimatedBudget)}
        </p>
        <Progress
          value={Math.min(100, ratio * 100)}
          aria-label="Budget réparti dans les étapes"
          className={cn(overBudget && '[&>*]:bg-destructive')}
        />
        <p
          className={cn(
            'text-sm text-muted-foreground',
            overBudget && 'text-destructive',
          )}
        >
          {overBudget
            ? `Dépassement de ${formatCurrency(allocated - trip.estimatedBudget)}`
            : `${formatCurrency(allocated)} réparti(s) dans les étapes`}
        </p>
      </StatCard>
    </div>
  )
}
