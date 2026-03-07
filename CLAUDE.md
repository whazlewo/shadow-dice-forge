# Shadow Dice Forge

A web-based character creation and management tool for Shadowrun 6th Edition (SR6).

## Commands

```bash
npm run dev          # Start dev server on port 8080
npm run build        # Production build
npm run build:dev    # Development build
npm run lint         # ESLint
npm run preview      # Preview production build
npm run test         # Run tests once
npm run test:watch   # Watch mode testing
```

## Architecture

**Stack:** React 18 + TypeScript + Vite + Supabase + Tailwind CSS + shadcn-ui

**Key directories:**

- `src/components/character/` — Character sheet tab components
- `src/components/wizard/` — Multi-step character creation wizard
- `src/components/ui/` — shadcn-ui primitives (do not edit directly)
- `src/pages/` — Route-level pages (Auth, Dashboard, CharacterSheet, CharacterWizard)
- `src/types/` — Core SR6 type definitions (`character.ts`, `karma.ts`)
- `src/lib/` — Game logic utilities (dice pools, karma costs, AR utilities)
- `src/data/sr6-reference.ts` — SR6 rules data and priority tables
- `src/integrations/supabase/` — Supabase client + auto-generated DB types
- `supabase/migrations/` — Database schema migrations

**Path alias:** `@/` maps to `src/`

## Data Flow

- Supabase PostgreSQL is the source of truth for character data
- Character data is stored as nested JSON columns (attributes, skills, gear, karma ledger)
- Changes are debounced (1000ms) before saving to Supabase
- `src/integrations/supabase/types.ts` is auto-generated — do not edit manually

## Key Patterns

- Auth state lives in `AuthContext` (`src/contexts/AuthContext.tsx`); access via `useAuth()`
- Protected routes use the `ProtectedRoute` wrapper component
- Server state managed with React Query; local UI state with hooks
- Karma changes go through `KarmaTracker` and are stored as a ledger (`KarmaTransaction[]`)
- Dice pool = attribute + skill rating + modifiers (specialization +2, expertise +3)

## Styling

- Tailwind CSS with a custom Shadowrun neon theme (cyan, magenta, green, amber)
- Fonts: Orbitron (display), Rajdhani (body), Share Tech Mono (mono)
- Dark mode via Tailwind `class` strategy
- `cn()` from `src/lib/utils.ts` for conditional class merging

## Git Remotes

- `dev` — Lovable managed remote (AI-assisted development platform)
- `prod` — Personal/public GitHub remote
