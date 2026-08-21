# Project Structure

## Top-Level Layout

```
app/          # Expo Router screens (file-based routing)
components/   # Reusable UI components
constants/    # Theme, colors, static config
contexts/     # React context providers
hooks/        # Custom React hooks
lib/          # Third-party client setup (supabase.ts)
services/     # All Supabase data-access logic
types/        # TypeScript types (database.ts, recipe.ts)
utils/        # Pure utility functions
assets/       # Images and fonts
supabase/     # SQL migration files
android/      # Native Android project
```

## Routing (`app/`)

Uses Expo Router file-based routing:

- `app/_layout.tsx` — root layout; handles auth state, splash screen, tutorial overlay, and renders `TabNavigation` + `FloatingActionButton` for authenticated users
- `app/(auth)/` — unauthenticated screens: `login`, `signup`, `forgot-password`, `onboarding`
- `app/(tabs)/` — all authenticated tab screens
  - Dynamic routes use `[id].tsx` pattern (e.g. `recipe/[id].tsx`, `challenges/[id].tsx`)
  - `create-recipe.tsx` and `edit-recipe/[id].tsx` are presented as modals
- The default tab bar is hidden; a custom `TabNavigation` component is rendered from the root layout

## Services (`services/`)

Each file exports a single service object with async methods. All Supabase queries live here — screens and hooks should not call `supabase` directly.

| File                       | Responsibility                               |
| -------------------------- | -------------------------------------------- |
| `recipeService.ts`         | CRUD, recommendations, favorites, completion |
| `ingredientService.ts`     | Pantry/ingredient management                 |
| `calorieService.ts`        | Daily calorie log                            |
| `challengeService.ts`      | Challenges and task progress                 |
| `userService.ts`           | Profile, XP, leveling                        |
| `badgeService.ts`          | Badge checks and awards                      |
| `streakService.ts`         | Streak tracking                              |
| `activityService.ts`       | Activity feed logging                        |
| `settingsService.ts`       | User settings                                |
| `tagService.ts`            | Recipe tagging                               |
| `recommendationService.ts` | Personalized recipe scoring                  |

## Components (`components/`)

- Flat structure for shared components
- `components/ui/` — lower-level primitives (`IconSymbol`, `TabBarBackground`)
- Platform-specific files use `.ios.tsx` suffix (e.g. `IconSymbol.ios.tsx`)
- Duplicate kebab-case files exist alongside PascalCase (legacy); prefer PascalCase

## Types (`types/`)

- `types/database.ts` — full typed schema generated from Supabase tables (Row/Insert/Update for each table). Always use these types for Supabase queries.
- `types/recipe.ts` — supplemental recipe types

## Constants (`constants/`)

- `Colors.ts` / `theme.ts` — color palette and font definitions. Brand greens: `#22c55e`, `#dcfce7`, `#166534`
- `tutorialSteps.ts` — tutorial step definitions

## Data Flow Pattern

```
Screen → useAuth / custom hook → service (Supabase query) → typed Database row
```

Auth state is managed by `hooks/useAuth.ts` and propagated via the root layout. User ID from `useAuth` is passed into service calls — services are stateless.

## Database Migrations (`supabase/migrations/`)

Sequential SQL files. When modifying the schema, add a new migration file with an incremented timestamp prefix. Never edit existing migration files.
