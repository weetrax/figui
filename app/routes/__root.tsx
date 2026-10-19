import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { Compass } from 'lucide-react'
import { SiteHeader } from '@/components/features/site-header'
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { getSessionUser } from '@/lib/api/auth'

import appCss from '../styles.css?url'

export const Route = createRootRoute({
  beforeLoad: async () => ({ user: await getSessionUser() }),
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Figui — Trouvez vos compagnons de voyage' },
      {
        name: 'description',
        content:
          'Créez vos itinéraires, trouvez des compagnons de voyage et partez à l’aventure ensemble.',
      },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
    ],
  }),
  shellComponent: RootDocument,
  component: RootLayout,
  notFoundComponent: NotFound,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <HeadContent />
      </head>
      <body>
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster position="bottom-right" richColors />
        <TanStackDevtools
          config={{ position: 'bottom-left' }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}

function RootLayout() {
  const { user } = Route.useRouteContext()

  return (
    <>
      <SiteHeader user={user} />
      <main className="mx-auto max-w-6xl px-4 pt-8 pb-16 sm:px-6">
        <Outlet />
      </main>
    </>
  )
}

function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-24 text-center">
      <span className="grid size-14 place-items-center rounded-full bg-secondary">
        <Compass className="size-6 text-muted-foreground" />
      </span>
      <h1 className="text-2xl font-bold">Page introuvable</h1>
      <p className="text-muted-foreground">
        Ce voyage n’existe pas, a été supprimé ou est privé.
      </p>
      <Button asChild className="rounded-full">
        <Link to="/">Voir tous les voyages</Link>
      </Button>
    </div>
  )
}
