import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { Loader2, LogIn } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'
import { Logo } from '@/components/features/site-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { login } from '@/lib/api/auth'
import { fieldErrors, loginSchema } from '@/lib/schemas'

/** N'accepte que des chemins internes pour éviter les redirections ouvertes. */
const safeRedirect = (value?: string): string =>
  value && value.startsWith('/') && !value.startsWith('//') ? value : '/'

export const Route = createFileRoute('/login')({
  validateSearch: z.object({ redirect: z.string().optional() }),
  beforeLoad: ({ context, search }) => {
    if (context.user) throw redirect({ href: safeRedirect(search.redirect) })
  },
  head: () => ({ meta: [{ title: 'Connexion — Figui' }] }),
  component: LoginPage,
})

const DEMO_ACCOUNTS = [
  { name: 'Martines', email: 'martines@figui.app' },
  { name: 'Léa Bernard', email: 'lea@figui.app' },
]

function LoginPage() {
  const router = useRouter()
  const search = Route.useSearch()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [pending, setPending] = useState(false)

  const signIn = async (values: { name: string; email: string }) => {
    const parsed = loginSchema.safeParse(values)
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error))
      return
    }
    setErrors({})
    setPending(true)
    try {
      const user = await login({ data: parsed.data })
      toast.success(`Bienvenue ${user.name} !`)
      await router.invalidate()
      router.history.push(safeRedirect(search.redirect))
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Connexion impossible',
      )
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="mx-auto max-w-md py-8">
      <Card className="rounded-2xl">
        <CardHeader className="items-center gap-4 text-center">
          <div className="flex justify-center">
            <Logo />
          </div>
          <CardTitle className="text-2xl">Connexion</CardTitle>
          <p className="text-sm text-muted-foreground">
            Connectez-vous pour créer un voyage, ajouter des étapes ou rejoindre
            une aventure.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault()
              void signIn({ name, email })
            }}
            noValidate
          >
            <div className="space-y-2">
              <Label htmlFor="name">Nom</Label>
              <Input
                id="name"
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                aria-invalid={!!errors.name}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full rounded-full"
              disabled={pending}
            >
              {pending ? <Loader2 className="animate-spin" /> : <LogIn />}
              Continuer
            </Button>
          </form>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <Separator className="flex-1" />
            Comptes de démonstration
            <Separator className="flex-1" />
          </div>

          <div className="grid gap-2">
            {DEMO_ACCOUNTS.map((account) => (
              <Button
                key={account.email}
                variant="outline"
                className="justify-between rounded-full"
                disabled={pending}
                onClick={() => void signIn(account)}
              >
                {account.name}
                <span className="text-xs text-muted-foreground">
                  {account.email}
                </span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
