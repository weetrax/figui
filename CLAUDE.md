# Figui - Guide du Développeur & Documentation Projet

## 🌟 Vision & Concept du Projet

**Figui** est une application web moderne conçue pour connecter les voyageurs du monde entier. La plateforme permet aux utilisateurs de trouver des compagnons de voyage partageant les mêmes centres d'intérêt, de créer des projets de voyage personnalisés et d'inviter d'autres membres à rejoindre leurs aventures.

### Fonctionnalités Clés
- **Profils Voyageurs :** Préférences de voyage, centres d'intérêt, historique des séjours, niveau de budget et avis/recommandations entre membres.
- **Création de Voyages & Itinéraires :** Publication de projets détaillés (destination, dates, étapes, budget estimé, nombre de participants max, type d'activités).
- **Système de Recherche & Filtres :** Filtres avancés par destination, période, style de voyage (sac à dos, road-trip, détente, randonnée) et tranche d'âge.
- **Invitations & Correspondances :** Envoi et gestion des demandes pour rejoindre un voyage, avec messagerie dédiée aux projets.

---

## 🛠️ Stack Technique Obligatoire

- **Build & Framework :** Vite avec [TanStack Start](https://tanstack.com/start)
- **Routing :** [TanStack Router](https://tanstack.com/router) (file-based routing)
- **UI & Style :** [shadcn/ui](https://ui.shadcn.com/) + Tailwind CSS
- **Langage :** TypeScript (mode strict)

---

## ⚡ Commandes Courantes

```bash
# Développement
npm run dev           # Démarrer le serveur de développement Vite / TanStack Start

# Build & Production
npm run build         # Compiler l'application pour la production
npm run start         # Servir le build de production (vite preview — ajouter un adapter Nitro/Vercel pour déployer)

# Qualité du code
npm run lint          # Exécuter ESLint
npm run format        # Formater le code avec Prettier
npm run typecheck     # Vérifier les types TypeScript

# Tests
npm run test          # Lancer la suite de tests
npm run test:watch    # Lancer les tests en mode observation
```

---

## 🏗️ Architecture & Structure des Dossiers

Le projet suit la structure standard recommandée pour **TanStack Start** et **TanStack Router** :

```text
/app
  ├── components/
  │   ├── ui/              # Composants générés par shadcn/ui (ne pas éditer à la main, exclus d'ESLint)
  │   ├── features/        # Composants métier (trip-card, itinerary-timeline, travelers-card...)
  │   └── layout/          # Structure de page (container : largeur centrée max-w-6xl + gouttières)
  ├── routes/              # Routing basé sur les fichiers (TanStack Router)
  │   ├── __root.tsx       # Document HTML + layout global (header) + session dans le contexte
  │   ├── index.tsx        # Accueil : hero, "Mes voyages", voyages publics filtrables (?q=&tag=)
  │   ├── login.tsx        # Connexion (démo)
  │   └── trips/           # new.tsx, $slug/index.tsx (détail), $slug/edit.tsx
  ├── lib/
  │   ├── api/             # Server functions (createServerFn) : auth.ts, trips.ts
  │   ├── schemas.ts       # Schémas zod partagés client/serveur
  │   ├── permissions.ts   # Règles d'accès (organisateur, membre, places...)
  │   ├── format.ts        # Dates (fr-FR, sans fuseau), monnaie, slug...
  │   └── utils.ts         # cn()
  ├── server/              # Code serveur uniquement : db.ts (store mémoire), auth.ts (cookie), trips.ts
  ├── types/               # Types globaux (Trip, ItineraryStep, User...)
  ├── router.tsx           # Création du router
  └── styles.css           # Tailwind v4 + tokens du thème
```

- Le dossier source est `app/` (`tanstackStart({ srcDirectory: 'app' })` dans `vite.config.ts`).
- Alias d'import : `@/*` → `app/*`.
- **Mise en page :** `<main>` ne contraint pas la largeur ; chaque page enveloppe son contenu dans `<Container>` (`@/components/layout/container`), ce qui permet des sections pleine largeur (ex. le hero du globe sur l'accueil).
- **Données :** stockage en mémoire (`app/server/db.ts`), réinitialisé au redémarrage. **Auth :** cookie de démo non signé (`app/server/auth.ts`) — à remplacer avant production.
- **Accès :** la lecture des voyages publics est libre ; création/édition/suppression réservées à l'organisateur, programme éditable par les membres, voyages privés visibles des seuls membres (404 sinon). Les contrôles sont faits côté serveur.
---

## 📐 Directives de Code & Normes TypeScript

- **TypeScript Strict :** Pas d'utilisation du type `any`. Typer explicitement toutes les props, réponses d'API et états.
- **Conventions de nommage :**
  - **Fichiers de composants :** `kebab-case.tsx` (ex: `trip-card.tsx`)
  - **Fichiers de routes :** `kebab-case.tsx` ou dossier nommé selon la convention TanStack Router.
  - **Utilitaires et hooks :** `camelCase.ts` (ex: `useTripFilters.ts`)
  - **Types & Interfaces :** `PascalCase` précédé d'un nom descriptif (ex: `TripMember`, `UserProfile`).
- **Composants :** Privilégier les composants fonctionnels avec déclaration `const Component: React.FC<Props>`.

---

## 🎨 Composants shadcn/ui & Style (Tailwind CSS)

- **Composants UI :** Tous les composants de base doivent provenir de la bibliothèque `shadcn/ui` (situés dans `app/components/ui/`).
- **Ajout de composants :** Utiliser la CLI `npx shadcn@latest add <component-name>` pour ajouter de nouveaux éléments.
- **Stylisation :**
  - Utiliser exclusivement les classes utilitaires **Tailwind CSS**.
  - Ne pas écrire de fichier CSS personnalisé sauf cas exceptionnel dans `styles/globals.css`.
  - Employer la fonction utilitaire `cn()` (`lib/utils.ts`) pour la fusion dynamique des classes Tailwind.