# Updated Recipe Migrations - Duplicate Prevention

## What Changed

The original migrations could cause errors if recipes already existed. The new **v2 migrations** now:
- ✅ Check if a recipe exists before inserting (by title)
- ✅ Skip recipes that already exist with a notice message
- ✅ Only add new recipes that don't exist yet
- ✅ Handle ingredients, instructions, and tags safely with `ON CONFLICT DO NOTHING`

## New Migration Files

### Original Files (DO NOT USE)
- ❌ `20251112000001_add_filipino_dessert_recipes_part1.sql` (partially edited, incomplete)
- ❌ `20251112000002_add_filipino_dessert_recipes_part2.sql` (no duplicate checking)

### Updated Files (USE THESE)
- ✅ `20251112000001_add_filipino_dessert_recipes_part1_v2.sql`
- ✅ `20251112000002_add_filipino_dessert_recipes_part2_v2.sql`

## How It Works

### Smart Insert Function
Both migrations create a temporary function `insert_recipe_if_not_exists()` that:

1. **Checks for existing recipe** by title
2. **If exists**: Returns the existing recipe ID and prints notice
3. **If new**: Inserts recipe, ingredients, instructions, and tags
4. **Cleanup**: Drops the function after use

### Example Output
```
NOTICE:  Recipe "Healthy Chicken Adobo" already exists, skipping...
NOTICE:  Recipe "Mango Chia Pudding" created successfully
NOTICE:  Recipe "Mediterranean Quinoa Bowl" created successfully
```

## Which Recipes Might Already Exist?

Common recipes that may already be in your database:
- Healthy Chicken Adobo
- Pinakbet
- Mediterranean Quinoa Bowl
- Greek Yogurt Berry Parfait
- Any generic Filipino or international recipes

The migrations will automatically detect and skip these!

## How to Apply

### Option 1: Delete Old Files and Use New Ones

```bash
# Delete or rename old migration files
cd e:\Desktop\MealMonitor\MealMonitor_Beta\supabase\migrations

# Rename to prevent confusion
ren 20251112000001_add_filipino_dessert_recipes_part1.sql 20251112000001_OLD_DONT_USE.sql

# Apply new migrations
npx supabase db push
```

### Option 2: Apply Only the v2 Files Directly

```bash
cd e:\Desktop\MealMonitor\MealMonitor_Beta

# Apply v2 migrations in order
psql -d your_database -f supabase/migrations/20251112000001_add_filipino_dessert_recipes_part1_v2.sql
psql -d your_database -f supabase/migrations/20251112000002_add_filipino_dessert_recipes_part2_v2.sql
```

### Option 3: Using Supabase CLI (if configured)

```bash
supabase db push --include-seed=false
```

## What Gets Added

### Part 1 (5 Recipes)
1. **Healthy Chicken Adobo** - Filipino, Halal, High-Protein
2. **Pinakbet** - Filipino, Vegan, Halal, Kosher
3. **Mediterranean Quinoa Bowl** - Vegan, Halal, Kosher
4. **Greek Yogurt Berry Parfait** - Vegetarian, Halal, Kosher
5. **Dark Chocolate Avocado Mousse** - Vegan, Halal, Kosher

### Part 2 (7 Recipes)
1. **Mango Chia Pudding** - Vegan, Halal, Kosher
2. **Baked Cinnamon Apples** - Vegetarian, Halal, Kosher
3. **Baked Turon** - Filipino, Vegetarian, Halal
4. **Healthy Halo-Halo** - Filipino, Vegan, Halal, Kosher
5. **Healthy Pandan Coconut Cake** - Filipino, Vegetarian, Halal
6. **Filipino Fruit Salad with Yogurt** - Filipino, Vegetarian, Halal
7. **Healthy Matcha Brownies** - Japanese, Vegetarian, Halal

## Verification

After running migrations, check what was added:

```sql
-- See which recipes were actually inserted
SELECT title, created_at 
FROM recipes 
WHERE created_at > NOW() - INTERVAL '5 minutes'
ORDER BY created_at DESC;

-- Count total recipes by cuisine
SELECT cuisine_type, COUNT(*) 
FROM recipes 
GROUP BY cuisine_type 
ORDER BY COUNT(*) DESC;

-- Check halal-tagged recipes
SELECT title FROM recipes r
JOIN recipe_tags rt ON r.id = rt.recipe_id
WHERE rt.tag = 'Halal'
ORDER BY r.created_at DESC;
```

## Safety Features

### No Duplicate Recipes
- Recipe title is used as unique identifier
- Existing recipes are preserved
- No data loss or overwrites

### Safe Inserts
- All ingredient/instruction/tag inserts use `ON CONFLICT DO NOTHING`
- Missing ingredients won't break the migration
- Duplicate tags won't cause errors

### Clean Function Removal
- Helper function is dropped after use
- No persistent changes to database schema
- Only data is added, not structure

## Comparison: Old vs New

### Old Migration (Problematic)
```sql
INSERT INTO recipes (...) VALUES (...);
-- Would fail if recipe exists!
```

### New Migration (Safe)
```sql
SELECT insert_recipe_if_not_exists(...);
-- Checks first, then inserts or skips
```

## Expected Results

Depending on your existing recipes:

### Scenario 1: Fresh Database
- **All 12 recipes** will be inserted
- You'll see 12 success notices

### Scenario 2: Some Recipes Exist
- **Existing recipes** are skipped with notice
- **New recipes** are inserted
- Mix of skip/success notices

### Scenario 3: All Recipes Exist
- **All recipes** skipped
- 12 skip notices
- No changes to database

## Troubleshooting

### If Migration Fails

**Error**: Function already exists
```
Solution: The function from a previous run wasn't cleaned up.
Run: DROP FUNCTION IF EXISTS insert_recipe_if_not_exists;
Then re-run migration.
```

**Error**: Ingredient not found
```
Solution: Some ingredients might not exist in your database.
The migration will skip those specific ingredients but continue.
Check your ingredients table.
```

**Error**: Recipe has no ingredients
```
This is OK! The recipe will be created, but you may need to
add ingredients manually later.
```

## Rollback (If Needed)

To remove recipes added by these migrations:

```sql
-- Find recipes added in last hour
SELECT id, title FROM recipes 
WHERE created_at > NOW() - INTERVAL '1 hour';

-- Delete specific recipe by title
DELETE FROM recipes WHERE title = 'Recipe Title Here';

-- Or delete all new Filipino desserts
DELETE FROM recipes 
WHERE created_at > NOW() - INTERVAL '1 hour'
AND (cuisine_type = 'Filipino' OR meal_type = 'Snack');
```

## Next Steps

1. ✅ Apply the v2 migrations
2. ✅ Check the console output for skip/success notices
3. ✅ Verify recipes in your app's dashboard
4. ✅ Test halal/kosher filtering
5. ⚠️ Update app if new recipe images don't load
6. ⚠️ Consider adding more recipes over time

## Files to Keep vs Delete

### Keep These
- ✅ `20251112000000_add_halal_kosher_dietary_tags.sql` (fixed version)
- ✅ `20251112000001_add_filipino_dessert_recipes_part1_v2.sql` (NEW)
- ✅ `20251112000002_add_filipino_dessert_recipes_part2_v2.sql` (NEW)

### Delete/Archive These
- ❌ `20251112000001_add_filipino_dessert_recipes_part1.sql` (incomplete)
- ❌ `20251112000002_add_filipino_dessert_recipes_part2.sql` (no dup check)

## Summary

The v2 migrations are **production-safe** and will:
- ✅ Not duplicate recipes
- ✅ Preserve existing data
- ✅ Add only new recipes
- ✅ Provide clear feedback
- ✅ Handle errors gracefully
- ✅ Work with any database state

You can safely run them multiple times without issues!
