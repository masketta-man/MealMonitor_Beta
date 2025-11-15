# Migration Cleanup - Removed Duplicates

## Summary
After checking older migrations, **3 recipes were found to already exist** and have been removed from the new migration files.

## Duplicate Recipes Removed

### From Part 1:
1. ❌ **"Healthy Chicken Adobo"**
   - Already exists as: **"Filipino Chicken Adobo"**
   - Found in: `20251108224816_07_add_filipino_recipes_part1.sql`
   - ID: `550e8400-e29b-41d4-a716-446655440010`

2. ❌ **"Pinakbet (Filipino Vegetable Stew)"**
   - Already exists as: **"Pinakbet"**
   - Found in: `20251109204739_14_add_healthy_filipino_recipes_and_update_tags.sql`
   - ID: `550e8400-e29b-41d4-a716-446655440028`

3. ❌ **"Mediterranean Quinoa Bowl"**
   - Already exists as: **"Mediterranean Quinoa Bowl"**
   - Found in: `20251111000000_add_healthy_varied_recipes.sql`
   - ID: `a10e8400-e29b-41d4-a716-446655440006`

### From Part 2:
✅ All recipes are NEW (no duplicates found)

## New Migration Files (v3 - Clean)

### Part 1 - Only 2 Recipes Now:
✅ `20251112000001_add_filipino_dessert_recipes_part1_v3.sql`
- Greek Yogurt Berry Parfait
- Dark Chocolate Avocado Mousse

### Part 2 - All 7 Recipes (No Changes):
✅ `20251112000002_add_filipino_dessert_recipes_part2_v3.sql`
- Mango Chia Pudding
- Baked Cinnamon Apples
- Baked Turon (Banana Spring Rolls)
- Healthy Halo-Halo
- Healthy Pandan Coconut Cake
- Filipino Fruit Salad with Yogurt
- Healthy Matcha Brownies

## Files to Use

### ✅ USE THESE (v3 - No Duplicates):
- `20251112000001_add_filipino_dessert_recipes_part1_v3.sql`
- `20251112000002_add_filipino_dessert_recipes_part2_v3.sql`

### ❌ DELETE THESE (v2 - Had Duplicates):
- `20251112000001_add_filipino_dessert_recipes_part1_v2.sql`
- `20251112000002_add_filipino_dessert_recipes_part2_v3.sql`

## Total New Recipes: 9

**Part 1:** 2 recipes
**Part 2:** 7 recipes

All recipes have:
- ✅ Complete ingredients with amounts
- ✅ Step-by-step instructions
- ✅ Proper dietary tags (halal, kosher, vegan, etc.)
- ✅ Accurate nutritional data
- ✅ Schema matching (no cook_time, servings, fiber columns)

## How to Apply

```bash
cd e:\Desktop\MealMonitor\MealMonitor_Beta

# Apply the clean v3 migrations
npx supabase db push
```

Or apply individually:
```bash
psql -d your_db -f supabase/migrations/20251112000001_add_filipino_dessert_recipes_part1_v3.sql
psql -d your_db -f supabase/migrations/20251112000002_add_filipino_dessert_recipes_part2_v3.sql
```

## Verification

The migrations will still check for duplicates and skip if recipes exist, but now they only try to insert recipes that don't already exist in older migrations.

You should see:
```
NOTICE: Recipe "Greek Yogurt Berry Parfait" created successfully
NOTICE: Recipe "Dark Chocolate Avocado Mousse" created successfully
NOTICE: Recipe "Mango Chia Pudding" created successfully
... (7 more success messages)
```

No "already exists" messages for the 3 removed recipes.
