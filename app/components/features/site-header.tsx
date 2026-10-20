import { Link, useRouter } from '@tanstack/react-router'
import { LogIn, LogOut, Map, Plane, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { ThemeToggle } from '@/components/features/theme-toggle'
import { UserAvatar } from '@/components/features/user-avatar'
import { Container } from '@/components/layout/container'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { logout } from '@/lib/api/auth'
import type { User } from '@/types'

interface SiteHeaderProps {
  user: User | null
}

export const Logo: React.FC = () => (
  <Link to="/" className="flex items-center gap-2" aria-label="Figui — accueil">
    <span className="grid size-9 place-items-center rounded-full bg-linear-to-br from-orange-400 to-primary text-primary-foreground shadow-md shadow-primary/30">
      <Plane className="size-4.5 -rotate-45" />
    </span>
    <span className="text-xl font-extrabold tracking-tight">Figui</span>
  </Link>
)

export const SiteHeader: React.FC<SiteHeaderProps> = ({ user }) => {
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    await router.invalidate()
    await router.navigate({ to: '/' })
    toast.success('À bientôt !')
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Logo />
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <Button asChild className="rounded-full shadow-sm shadow-primary/30">
            <Link to="/trips/new">
              <Plus />
              <span className="hidden sm:inline">Nouveau voyage</span>
            </Link>
          </Button>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                className="rounded-full outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                aria-label="Menu du compte"
              >
                <UserAvatar user={user} />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <p className="font-semibold">{user.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/" hash="mes-voyages">
                    <Map />
                    Mes voyages
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={handleLogout}>
                  <LogOut />
                  Se déconnecter
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="outline" className="rounded-full">
              <Link to="/login">
                <LogIn />
                <span className="hidden sm:inline">Se connecter</span>
              </Link>
            </Button>
          )}
        </div>
      </Container>
    </header>
  )
}
