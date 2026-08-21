# Tech Stack

## Framework & Runtime

- **React Native** 0.79.2 with **Expo** ~53.0.9
- **Expo Router** ~5.0.7 (file-based routing)
- **TypeScript** ~5.8.3 (strict mode enabled)
- **React** 19.0.0

## Backend

- **Supabase** (`@supabase/supabase-js` ^2.58.0) — auth, database (Postgres), realtime
- Supabase client is initialized in `lib/supabase.ts` and typed via `types/database.ts`
- Credentials loaded from `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` env vars

## Key Libraries

- `@react-navigation/bottom-tabs` + `@react-navigation/native` — navigation primitives (used under Expo Router)
- `react-native-reanimated` ~3.17.4 — animations
- `react-native-gesture-handler` ~2.24.0 — gesture support
- `react-native-safe-area-context` — safe area insets
- `expo-secure-store` — secure credential storage
- `expo-haptics` — haptic feedback
- `expo-linear-gradient` — gradient UI elements
- `@expo/vector-icons` (Ionicons) — icons throughout the app
- `firebase` ^11.8.1 — present as a dependency (secondary/legacy usage)

## Path Aliases

`@/` maps to the workspace root. Always use `@/` imports instead of relative paths across folders.

## Common Commands

```bash
# Start dev server
npx expo start

# Run on Android
npx expo run:android

# Run on iOS
npx expo run:ios

# Run on web
npx expo start --web

# Lint
npx expo lint
```

## Environment Variables

Copy `.env.example` to `.env` and fill in:

```
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

## Build / Distribution

- EAS project ID: `05f119bc-ab90-4c6a-8cd8-c353bed99ef3`
- Config in `eas.json`
- Android package: `com.jecardo.mealmonitor`
