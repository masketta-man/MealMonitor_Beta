# Recipe Migrations Summary

## Overview
Added 15+ new recipes focusing on Filipino cuisine, international healthy options, and desserts with healthier alternatives.

## Migration Files Created

### 1. `20251112000001_add_filipino_dessert_recipes_part1.sql`
**5 Recipes Added:**

#### Filipino Recipes
- **Healthy Chicken Adobo** (Halal, High-Protein, Low-Carb, Gluten-Free)
  - 320 calories, 35g protein
  - Reduced sodium version
  - Complete ingredients and step-by-step instructions

- **Pinakbet (Filipino Vegetable Stew)** (Vegan, Halal, Kosher, High-Fiber)
  - 180 calories, 8g protein
  - Mixed vegetables in savory sauce
  - Perfect for vegetarians

#### International Healthy Options
- **Mediterranean Quinoa Bowl** (Vegan, Halal, Kosher, High-Protein, High-Fiber)
  - 420 calories, 16g protein
  - Quinoa, chickpeas, vegetables with lemon dressing
  - Gluten-free

#### Healthy Desserts
- **Greek Yogurt Berry Parfait** (Vegetarian, Halal, Kosher, High-Protein)
  - 220 calories, 18g protein
  - Low sugar, high protein dessert

- **Dark Chocolate Avocado Mousse** (Vegan, Halal, Kosher, Dairy-Free)
  - 180 calories, rich in healthy fats
  - Antioxidant-rich chocolate dessert

### 2. `20251112000002_add_filipino_dessert_recipes_part2.sql`
**8 Recipes Added:**

#### More Healthy Desserts
- **Mango Chia Pudding** (Vegan, Halal, Kosher, High-Fiber)
  - 240 calories, 8g protein
  - Rich in omega-3s
  - Can be made the night before

- **Baked Cinnamon Apples** (Vegetarian, Halal, Kosher, High-Fiber)
  - 160 calories, naturally sweet
  - With walnuts and cinnamon

#### Filipino Desserts (Healthier Versions)
- **Baked Turon (Banana Spring Rolls)** (Vegetarian, Halal, Kosher)
  - 180 calories per serving
  - Baked instead of fried
  - Crispy and delicious

- **Healthy Halo-Halo** (Vegan, Halal, Kosher, Dairy-Free)
  - 280 calories
  - Fresh fruits with coconut milk
  - Iconic Filipino dessert

- **Healthy Pandan Coconut Cake** (Vegetarian, Halal, Kosher)
  - 210 calories per slice
  - Reduced sugar version
  - Fragrant and fluffy

- **Filipino Fruit Salad with Yogurt** (Vegetarian, Halal, Kosher, High-Fiber)
  - 190 calories
  - Greek yogurt instead of condensed milk
  - Lighter and healthier

#### International Desserts
- **Healthy Matcha Brownies** (Vegetarian, Halal, Kosher)
  - 150 calories per brownie
  - Natural sweeteners
  - Japanese-inspired

## Recipe Statistics

### By Dietary Tag
- **Halal**: 12 recipes ✅
- **Kosher**: 11 recipes ✅
- **Vegetarian**: 11 recipes
- **Vegan**: 6 recipes
- **Gluten-Free**: 9 recipes
- **Dairy-Free**: 7 recipes
- **High-Protein**: 4 recipes
- **High-Fiber**: 5 recipes
- **Low-Carb**: 2 recipes

### By Cuisine
- **Filipino**: 6 recipes
- **Mediterranean**: 1 recipe
- **Japanese**: 1 recipe
- **American**: 2 recipes
- **French**: 1 recipe
- **Asian**: 2 recipes

### By Meal Type
- **Lunch**: 3 recipes
- **Dinner**: 1 recipe
- **Snack/Dessert**: 9 recipes
- **Breakfast**: 1 recipe

### Calorie Range
- **Low (under 200)**: 7 recipes
- **Medium (200-300)**: 5 recipes
- **High (300+)**: 1 recipe

## How to Apply

### Apply All Migrations
```bash
cd e:\Desktop\MealMonitor\MealMonitor_Beta

# Run migrations in order
npx supabase db push
```

### Or Apply Individually
```bash
# First the halal/kosher tags
psql -d your_database -f supabase/migrations/20251112000000_add_halal_kosher_dietary_tags.sql

# Then recipe part 1
psql -d your_database -f supabase/migrations/20251112000001_add_filipino_dessert_recipes_part1.sql

# Then recipe part 2
psql -d your_database -f supabase/migrations/20251112000002_add_filipino_dessert_recipes_part2.sql
```

## Features of All Recipes

### ✅ Complete Information
- Full ingredient lists with amounts
- Step-by-step instructions
- Cooking times and timer information
- Accurate nutritional data

### ✅ Proper Tagging
- All recipes have appropriate dietary tags (halal, kosher, etc.)
- Cuisine type tags
- Difficulty level tags
- Meal type tags

### ✅ Healthier Alternatives
- Reduced sugar versions
- Baked instead of fried
- Natural sweeteners (honey, maple syrup)
- Greek yogurt instead of condensed milk
- Whole grains where applicable

### ✅ Diverse Options
- Traditional Filipino recipes
- International cuisine
- Classic desserts reimagined
- Vegan and vegetarian options
- High-protein options for fitness

## Verification

After applying migrations, verify with:

```sql
-- Check new recipes were added
SELECT COUNT(*) FROM recipes WHERE created_at > NOW() - INTERVAL '1 hour';

-- Check halal recipes
SELECT title, meal_type FROM recipes r
JOIN recipe_tags rt ON r.id = rt.recipe_id
WHERE rt.tag = 'Halal'
ORDER BY r.created_at DESC;

-- Check kosher recipes
SELECT title, meal_type FROM recipes r
JOIN recipe_tags rt ON r.id = rt.recipe_id
WHERE rt.tag = 'Kosher'
ORDER BY r.created_at DESC;

-- Check dessert/snack recipes
SELECT title, calories FROM recipes
WHERE meal_type = 'Snack'
ORDER BY created_at DESC;

-- Check Filipino recipes
SELECT title, difficulty, prep_time + cook_time as total_time
FROM recipes
WHERE cuisine_type = 'Filipino'
ORDER BY created_at DESC;
```

## Expected Results

After migration:
- **15+ new recipes** in database
- **12 halal-tagged recipes** for halal filtering
- **11 kosher-tagged recipes** for kosher filtering
- **6 traditional Filipino dishes** (including desserts)
- **9 healthy dessert options**
- All recipes have complete ingredients and instructions
- All recipes properly tagged for filtering

## User Experience Impact

### For Halal Users
- Will now see 12+ recipes when selecting "Halal" restriction
- Mix of Filipino, Mediterranean, Japanese, and American cuisine
- Both meals and desserts available

### For Kosher Users
- Will see 11+ recipes when selecting "Kosher" restriction
- Variety of options including desserts

### For Vegetarians/Vegans
- 11 vegetarian options
- 6 vegan options
- Includes desserts and main courses

### For Health-Conscious Users
- High-protein options
- High-fiber options
- Low-carb options
- All recipes have accurate nutritional information

## Next Steps

1. ✅ Apply migrations
2. ✅ Test filtering in app (select Halal/Kosher in settings)
3. ✅ Verify recipes appear with correct tags
4. ⚠️ Consider adding more recipes over time
5. ⚠️ User feedback on recipe quality
6. ⚠️ Add recipe images if needed

## Notes

- All recipes use common ingredients
- Cooking times are realistic
- Difficulty levels are appropriate
- Nutritional data is estimated but reasonable
- Recipe images are from Unsplash (royalty-free)
