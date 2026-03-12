# Shadow Dice Forge

Web-based character creation and management for Shadowrun 6th Edition (SR6). Build and manage runners with a guided wizard, full character sheets, karma tracking, and SR6-compliant dice pool calculations.

## Features

- **Character creation wizard** — 5-step flow (mundane) or 6-step flow (magic users): Concept → Priorities (metatype, attributes, skills, magic, resources) → [Magic] → Qualities → Karma spend → Gear
- **Character sheet** — Tabbed editor: Core (attributes, skills, personal info, qualities, equipped gear), Notes, Weapons & Gear, Vehicles, Spells, Adept, Other
- **Karma tracking** — Ledger-based system with undo/refund; karma confirmation dialogs for attribute raises
- **Dice pool calculation** — Attribute + skill + modifiers from qualities, augmentations, gear; supports weapon accessories
- **Portrait upload** — Character portraits stored in Supabase Storage
- **Dashboard** — Create, duplicate, delete characters; list view with quick actions

## Tech Stack

- React 18, TypeScript, Vite
- Supabase (Auth, PostgreSQL, Storage)
- Tailwind CSS, shadcn-ui
- React Query, React Router, Zod, react-hook-form

Note: `form.tsx` (react-hook-form + zod) is available in `src/components/ui/` but currently unused; kept for future form-heavy features.

## Getting Started

**Prerequisites:** Node.js 18+ ([nvm](https://github.com/nvm-sh/nvm#installing-and-updating) recommended)

```sh
# Clone and install
git clone <YOUR_GIT_URL>
cd shadow-dice-forge
npm install

# Configure environment
cp .env.example .env.development
# Edit .env.development: set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY
# (from Supabase project settings → API)

# Start dev server (port 8080)
npm run dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (port 8080) |
| `npm run build` | Production build |
| `npm run build:dev` | Development build |
| `npm run lint` | ESLint |
| `npm run preview` | Preview production build |
| `npm run test` | Run tests once |
| `npm run test:watch` | Watch mode tests |
| `npm run audit:magic` | Audit magic references (spells, adept powers, complex forms) |
| `npm run audit:gear` | Audit gear items vs rulebook |

## Project Structure

| Directory | Purpose |
|-----------|---------|
| `src/components/character/` | Character sheet tab components |
| `src/components/wizard/` | Multi-step wizard steps |
| `src/pages/` | Routes (Auth, Dashboard, CharacterSheet, CharacterWizard) |
| `src/types/` | SR6 type definitions |
| `src/lib/` | Game logic (dice pools, karma costs, AR utilities) |
| `src/data/sr6-reference.ts` | Priority tables, rules data |
| `src/integrations/supabase/` | Supabase client and types |
| `supabase/migrations/` | Database schema migrations |

Path alias: `@/` maps to `src/`

## Supabase Setup

- Schema: apply migrations in `supabase/migrations/`
- Storage: `character-portraits` bucket for portrait uploads
- RLS policies enforce per-user data access
