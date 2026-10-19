import { Link, useRouter } from '@tanstack/react-router'
import { Loader2, LogIn, LogOut, UserPlus, Users } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { UserAvatar } from '@/components/features/user-avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { joinTrip, leaveTrip } from '@/lib/api/trips'
import {
  canJoin,
  isParticipant,
  spotsLeft,
  travelersCount,
} from '@/lib/permissions'
import type { PublicUser, Trip, User } from '@/types'

interface TravelersCardProps {
  trip: Trip
  user: User | null
}

export const TravelersCard: React.FC<TravelersCardProps> = ({ trip, user }) => {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const count = travelersCount(trip)
  const remaining = spotsLeft(trip)

  const run = async (action: () => Promise<unknown>, success: string) => {
    setPending(true)
    try {
      await action()
      toast.success(success)
      await router.invalidate()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Action impossible')
    } finally {
      setPending(false)
    }
  }

  const travelers: Array<{ user: PublicUser; role?: string }> = [
    { user: trip.organizer, role: 'Organisateur' },
    ...trip.participants.map((p) => ({ user: p })),
  ]

  return (
    <Card className="gap-5 rounded-2xl py-5">
      <CardContent className="space-y-5 px-5">
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="size-4" />
            Voyageurs
          </p>
          <span className="text-sm font-semibold">
            {count} / {trip.maxTravelers}
          </span>
        </div>

        <div className="space-y-2">
          <Progress
            value={(count / trip.maxTravelers) * 100}
            aria-label="Places occupées"
          />
          <p className="text-xs text-muted-foreground">
            {remaining === 0
              ? 'Complet'
              : `Encore ${remaining} place${remaining > 1 ? 's' : ''} disponible${remaining > 1 ? 's' : ''}`}
          </p>
        </div>

        <ul className="space-y-3">
          {travelers.map(({ user: traveler, role }) => (
            <li key={traveler.id} className="flex items-center gap-3">
              <UserAvatar user={traveler} />
              <span className="flex-1 truncate text-sm font-medium">
                {traveler.name}
                {user?.id === traveler.id && (
                  <span className="text-muted-foreground"> (vous)</span>
                )}
              </span>
              {role && (
                <Badge variant="secondary" className="font-medium">
                  {role}
                </Badge>
              )}
            </li>
          ))}
        </ul>

        {!user && trip.status !== 'Terminé' && remaining > 0 && (
          <Button asChild className="w-full rounded-full">
            <Link to="/login" search={{ redirect: `/trips/${trip.slug}` }}>
              <LogIn />
              Se connecter pour rejoindre
            </Link>
          </Button>
        )}

        {user && canJoin(trip, user) && (
          <Button
            className="w-full rounded-full"
            disabled={pending}
            onClick={() =>
              run(
                () => joinTrip({ data: { id: trip.id } }),
                'Vous avez rejoint le voyage !',
              )
            }
          >
            {pending ? <Loader2 className="animate-spin" /> : <UserPlus />}
            Rejoindre le voyage
          </Button>
        )}

        {isParticipant(trip, user) && (
          <Button
            variant="ghost"
            className="w-full rounded-full text-muted-foreground"
            disabled={pending}
            onClick={() =>
              run(
                () => leaveTrip({ data: { id: trip.id } }),
                'Vous avez quitté le voyage',
              )
            }
          >
            {pending ? <Loader2 className="animate-spin" /> : <LogOut />}
            Quitter le voyage
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
