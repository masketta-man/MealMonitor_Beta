# Database Tags Required for Dietary Restrictions

## Issue Fixed
The filtering logic has been updated to properly handle **halal** and **kosher** dietary restrictions. However, for the filtering to work correctly, recipes in the database MUST have the appropriate tags.

## What Was Fixed

### 1. **recommendationService.ts** (Line 221)
- ✅ Added `'halal'` and `'kosher'` to the food restrictions filtering list

### 2. **recipeService.ts** (Line 620)
- ✅ Added `'halal'` and `'kosher'` to the food restrictions filtering in `enrichRecipesWithUserData()`

### 3. **settings.tsx** (Line 190)
- ✅ Already included `'halal'` and `'kosher'` in the food restrictions list

## How It Works Now

When a user selects a dietary restriction (e.g., "halal") in settings:
1. The setting is saved to `user_settings.dietary_restrictions`
2. The recommendation service filters out any recipes that DON'T have the "halal" tag
3. The recipe service also filters recipes when displaying them
4. Only recipes tagged with "halal" will appear in recommendations

## Database Requirements

### For Halal Recipes
Recipes that are halal-compliant MUST have one of these tags in the database:
- `recipe_tags` table: `tag = 'Halal'` or `tag = 'halal'`
- OR `recipe_tag_mappings` table with a reference to a tag with `name = 'Halal'` or `name = 'halal'`

### For Kosher Recipes
Recipes that are kosher-compliant MUST have one of these tags in the database:
- `recipe_tags` table: `tag = 'Kosher'` or `tag = 'kosher'`
- OR `recipe_tag_mappings` table with a reference to a tag with `name = 'Kosher'` or `name = 'kosher'`

### Tag System
The app supports two tag systems:
1. **Legacy Tags** - `recipe_tags` table (direct tag strings)
2. **Enhanced Tags** - `recipe_tag_mappings` linked to `tags` table (more advanced)

Both systems work with the filtering logic.

## Complete List of Food Restrictions That Require Tags

All of these restrictions require recipes to have the corresponding tag:
- `gluten-free`
- `dairy-free`
- `nut-free`
- `soy-free`
- `egg-free`
- `shellfish-free`
- `halal`
- `kosher`

## Dietary Preferences That Require Tags

These work the same way:
- `vegetarian`
- `vegan`
- `pescatarian`
- `keto`
- `paleo`
- `low-carb`
- `mediterranean`

## Example SQL to Add Tags

### Add Halal Tag to Tags Table (Enhanced System)
```sql
-- First, ensure the tag exists
INSERT INTO tags (name, slug, category_id, base_weight, relevance_score, popularity_score)
VALUES ('Halal', 'halal', (SELECT id FROM tag_categories WHERE name = 'dietary'), 1.0, 1.0, 0.5)
ON CONFLICT (slug) DO NOTHING;

-- Then tag recipes as halal
INSERT INTO recipe_tag_mappings (recipe_id, tag_id, relevance_weight, confidence_score)
SELECT r.id, (SELECT id FROM tags WHERE slug = 'halal'), 1.0, 1.0
FROM recipes r
WHERE r.title LIKE '%Chicken%' -- Replace with actual halal recipes
ON CONFLICT DO NOTHING;
```

### Add Halal Tag Directly (Legacy System)
```sql
-- Add halal tag to specific recipes
INSERT INTO recipe_tags (recipe_id, tag, tag_type)
SELECT id, 'Halal', 'dietary'
FROM recipes
WHERE title LIKE '%Chicken%' -- Replace with actual halal recipes
ON CONFLICT DO NOTHING;
```

## Testing

To test if the filtering works:
1. Go to Settings
2. Select "Halal" under Dietary Restrictions
3. Save settings
4. Return to Dashboard
5. Only recipes tagged with "halal" should appear in recommendations
6. If non-halal recipes still appear, it means those recipes don't have the "halal" tag in the database

## Action Required

**Database Administrator should:**
1. Review all recipes in the database
2. Add appropriate tags (`halal`, `kosher`, etc.) to recipes that meet those dietary restrictions
3. Ensure tag names are lowercase and consistent
4. Test the filtering after tagging recipes

**Alternative Approach:**
If you don't want to tag every recipe, you can:
- Tag only the recipes that ARE halal/kosher
- Change the filtering logic to be "exclusive" instead of "inclusive" (i.e., filter out recipes tagged with pork, alcohol, etc.)
