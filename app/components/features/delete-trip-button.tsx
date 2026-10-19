import { useRouter } from '@tanstack/react-router'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { deleteTrip } from '@/lib/api/trips'
import type { Trip } from '@/types'

export const DeleteTripButton: React.FC<{ trip: Trip }> = ({ trip }) => {
  const router = useRouter()

  const handleDelete = async () => {
    try {
      await deleteTrip({ data: { id: trip.id } })
      toast.success('Voyage supprimé')
      await router.navigate({ to: '/' })
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Suppression impossible',
      )
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="rounded-lg">
          <Trash2 />
          Supprimer
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer « {trip.title} » ?</AlertDialogTitle>
          <AlertDialogDescription>
            Le voyage, son programme et la liste des voyageurs seront
            définitivement supprimés.
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
  )
}
