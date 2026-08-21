# Database & Supabase

## Database Access

The project uses **Supabase** (Postgres) for backend storage and authentication. The Supabase MCP server is configured and provides direct database access through Kiro.

### Available MCP Tools

Use these tools to interact with the Supabase project directly:

- `mcp_supabase_list_projects` — list all Supabase projects
- `mcp_supabase_get_project` — get project details
- `mcp_supabase_list_tables` — list tables in schemas (use `verbose: true` for full schema details)
- `mcp_supabase_list_extensions` — list installed Postgres extensions
- `mcp_supabase_list_migrations` — list applied migrations
- `mcp_supabase_apply_migration` — apply a new migration (DDL operations)
- `mcp_supabase_execute_sql` — run raw SQL queries (use for data operations, NOT DDL)
- `mcp_supabase_query_logs` — query unified logs with ClickHouse SQL
- `mcp_supabase_get_advisors` — check for security/performance issues
- `mcp_supabase_generate_typescript_types` — generate types from schema
- `mcp_supabase_list_edge_functions` — list Edge Functions
- `mcp_supabase_deploy_edge_function` — deploy Edge Function code
- `mcp_supabase_search_docs` — search Supabase documentation

### Schema Management

**Always use migrations for schema changes.** Never edit existing migration files in `supabase/migrations/`.

When modifying the database schema:

1. Use `mcp_supabase_apply_migration` with a descriptive snake_case name
2. The tool generates a timestamped file automatically
3. Test the migration on a branch first if possible

After schema changes, regenerate TypeScript types:

```typescript
mcp_supabase_generate_typescript_types
```

Update `types/database.ts` with the output.

### Table Structure

Key tables (see `types/database.ts` for full schema):

- `users` — user profiles, XP, level, streak
- `recipes` — recipe metadata, nutrition, points
- `recipe_ingredients` — ingredients per recipe
- `recipe_instructions` — cooking steps
- `recipe_tags` — flexible tagging (meal_type, cuisine, dietary, etc.)
- `ingredients` — ingredient catalog
- `user_ingredients` — user pantry tracking
- `user_favorites` — favorited recipes
- `user_completed_meals` — meal completion history
- `challenges` / `challenge_tasks` / `user_challenge_progress` — challenge system
- `badges` / `user_badges` — achievement badges
- `daily_calorie_log` / `meal_log` — calorie tracking
- `user_activity_log` — activity feed
- `user_settings` — user preferences

### Data Access Pattern

**Never query Supabase directly from screens or components.** All database access must go through service files in `services/`. Services use the typed Supabase client from `lib/supabase.ts` and return strongly-typed results based on `types/database.ts`.

### Row Level Security (RLS)

Many tables have RLS policies enabled. Use `mcp_supabase_get_advisors` with type `"security"` to check for missing RLS policies or other security issues.

### Checking Logs

Use `mcp_supabase_query_logs` to query logs. Filter by `source` field:

- `'edge_logs'` — Edge Function logs
- `'postgres_logs'` — Database query logs
- `'function_edge_logs'` — Function execution logs

Always specify `iso_timestamp_start` and `iso_timestamp_end` for time-bound queries.
