# Halal & Kosher Dietary Tags Migration Guide

## Overview
This guide explains the database changes made to support halal and kosher dietary restrictions in the MealMonitor app.

## Files Changed

### 1. Application Code (Already Updated)
- ✅ `services/recommendationService.ts` - Line 221
- ✅ `services/recipeService.ts` - Line 620
- ✅ `app/(tabs)/settings.tsx` - Line 190 (already had halal/kosher)

### 2. Database Migration (NEW)
- ✅ `supabase/migrations/20251112000000_add_halal_kosher_dietary_tags.sql`

## What the Migration Does

### 1. **Enhanced Tagging System (Recommended)**
Creates halal and kosher tags in the `tags` table with:
- Proper categorization under 'dietary'
- High relevance weights (2.0) for filtering priority
- System-approved status
- Synonyms and related terms
- Auto-tagging based on ingredient analysis

### 2. **Legacy System Compatibility**
Also adds tags to `recipe_tags` table for backward compatibility with older code.

### 3. **Intelligent Auto-Tagging**

#### Halal Auto-Tagging Rules:
- ✅ Excludes recipes with pork products
- ✅ Excludes recipes with alcohol
- ⚠️ Sets 70% confidence (may need manual verification for meat source)

#### Kosher Auto-Tagging Rules:
- ✅ Excludes recipes with pork products
- ✅ Excludes recipes with shellfish
- ✅ Excludes recipes mixing meat and dairy
- ⚠️ Sets 70% confidence (may need manual verification)

### 4. **Tag Relationships**
Creates relationships between halal, kosher, and vegetarian tags for better recommendations.

## How to Apply the Migration

### Option 1: Using Supabase CLI (Recommended)
```bash
# Navigate to project directory
cd e:\Desktop\MealMonitor\MealMonitor_Beta

# Apply the migration
npx supabase db push

# Or if using Supabase CLI directly
supabase db push
```

### Option 2: Using Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of `supabase/migrations/20251112000000_add_halal_kosher_dietary_tags.sql`
4. Paste and run the SQL

### Option 3: Automatic Migration (If using migration runner)
The migration will be automatically applied on next deployment if your app has a migration runner configured.

## Verification Steps

After applying the migration, verify it worked:

### 1. Check Tags Were Created
```sql
SELECT * FROM tags WHERE slug IN ('halal', 'kosher');
```
Expected: 2 rows (one for halal, one for kosher)

### 2. Count Tagged Recipes
```sql
-- Halal recipes
SELECT COUNT(*) as halal_recipe_count 
FROM recipe_tag_mappings rtm
JOIN tags t ON rtm.tag_id = t.id
WHERE t.slug = 'halal';

-- Kosher recipes
SELECT COUNT(*) as kosher_recipe_count 
FROM recipe_tag_mappings rtm
JOIN tags t ON rtm.tag_id = t.id
WHERE t.slug = 'kosher';
```

### 3. View Sample Tagged Recipes
```sql
-- View halal recipes
SELECT r.id, r.title, r.meal_type, rtm.confidence_score
FROM recipes r
JOIN recipe_tag_mappings rtm ON r.id = rtm.recipe_id
JOIN tags t ON rtm.tag_id = t.id
WHERE t.slug = 'halal'
LIMIT 10;
```

### 4. Test in Application
1. Open the app
2. Go to Settings
3. Select "Halal" under Dietary Restrictions
4. Save settings
5. Return to Dashboard (with refresh=true param)
6. Verify only halal-tagged recipes appear in recommendations

## Expected Results

Based on typical recipe databases:
- **Halal recipes**: 60-80% of recipes (those without pork/alcohol)
- **Kosher recipes**: 40-60% of recipes (those without pork, shellfish, or meat+dairy)
- **Confidence**: 70% (auto-tagged) - may need manual review

## Manual Verification Recommended

The auto-tagging is conservative and may:
- ✅ **Under-tag**: Some halal/kosher recipes may not be tagged (false negatives)
- ✅ **Safe**: Unlikely to incorrectly tag non-halal/kosher recipes (low false positives)

### To manually review and adjust:

```sql
-- Find potential halal recipes that weren't auto-tagged
SELECT r.id, r.title, 
  STRING_AGG(i.name, ', ') as ingredients
FROM recipes r
JOIN recipe_ingredients ri ON r.id = ri.recipe_id
JOIN ingredients i ON ri.ingredient_id = i.id
WHERE NOT EXISTS (
  SELECT 1 FROM recipe_tag_mappings rtm
  JOIN tags t ON rtm.tag_id = t.id
  WHERE rtm.recipe_id = r.id AND t.slug = 'halal'
)
GROUP BY r.id, r.title
LIMIT 20;

-- Manually add halal tag to a recipe
INSERT INTO recipe_tag_mappings (recipe_id, tag_id, relevance_weight, confidence_score, source)
VALUES (
  '<recipe_id>',
  (SELECT id FROM tags WHERE slug = 'halal'),
  1.5,
  1.0,  -- 100% confidence for manual tagging
  'manual'
);
```

## Updating Existing Tags

If you want to update confidence scores or tag more recipes:

```sql
-- Update confidence score for auto-generated tags
UPDATE recipe_tag_mappings
SET confidence_score = 1.0,
    source = 'verified'
WHERE tag_id IN (
  SELECT id FROM tags WHERE slug IN ('halal', 'kosher')
)
AND source = 'auto_generated';
```

## Rollback (If Needed)

If you need to rollback this migration:

```sql
-- Remove tag mappings
DELETE FROM recipe_tag_mappings
WHERE tag_id IN (
  SELECT id FROM tags WHERE slug IN ('halal', 'kosher')
);

-- Remove from legacy system
DELETE FROM recipe_tags
WHERE LOWER(tag) IN ('halal', 'kosher');

-- Remove tags
DELETE FROM tags WHERE slug IN ('halal', 'kosher');

-- Remove relationships
DELETE FROM tag_relationships
WHERE tag_id IN (SELECT id FROM tags WHERE slug IN ('halal', 'kosher'))
   OR related_tag_id IN (SELECT id FROM tags WHERE slug IN ('halal', 'kosher'));
```

## Performance Impact

- ✅ **Minimal**: Adds ~2 tags and relationships
- ✅ **Indexed**: Tag lookups use existing indexes
- ✅ **Efficient**: Filtering uses WHERE clauses on indexed columns

## Next Steps

1. ✅ Apply the migration
2. ✅ Verify tag creation
3. ✅ Test filtering in the app
4. ⚠️ Manually review and adjust auto-tagged recipes as needed
5. ⚠️ Consider adding more specific halal/kosher certifications for restaurants
6. ⚠️ Update recipe creation forms to allow explicit halal/kosher tagging

## Support

If recipes still appear that shouldn't:
1. Check if the recipe actually has the halal/kosher tag
2. Verify the filtering logic is working (check browser console logs)
3. Ensure the database migration was applied successfully
4. Check if the recipe has ingredients that should exclude it

## Additional Notes

### Halal Considerations
- Auto-tagging doesn't verify meat is zabihah (properly slaughtered)
- Recipes with generic "chicken" or "beef" get 70% confidence
- Manual verification recommended for meat dishes

### Kosher Considerations
- Auto-tagging uses simplified kashrut rules
- Doesn't check for kosher certification of ingredients
- Doesn't handle pareve (neutral) designation
- Manual verification recommended for complex recipes

### Future Enhancements
- Add halal/kosher certification levels (basic, certified, etc.)
- Integrate with certification databases
- Add user-reported halal/kosher status
- Machine learning for better auto-tagging
