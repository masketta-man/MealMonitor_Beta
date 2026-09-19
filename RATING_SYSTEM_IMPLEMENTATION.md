# Recipe Rating System Implementation

## Overview
Implemented a comprehensive recipe rating system that captures dimensional feedback when users complete cooking a recipe.

## What Was Done

### 1. Database Schema (`supabase/migrations/20251126000000_add_recipe_ratings.sql`)

Created a new `recipe_ratings` table with:
- **Overall rating** (1-5 stars)
- **Dimensional ratings**:
  - Difficulty (1=Very Easy, 5=Very Hard)
  - Time Accuracy (1=Much longer, 3=Accurate, 5=Much faster)
  - Taste (1=Poor, 5=Excellent)
  - Instructions (1=Confusing, 5=Very Clear)
- **Time tracking**: actual vs suggested prep time
- **Feedback fields**: modifications text, would-cook-again boolean
- **Relationships**: Links to user, recipe, and completion record

Added columns to `user_completed_meals`:
- `rating_id`: Reference to the detailed rating
- `user_rating`: Simple 1-5 rating for quick queries

Created a `recipe_rating_stats` view for aggregated statistics per recipe:
- Average ratings across all dimensions
- Total rating count
- Would-cook-again percentage
- Average actual time

### 2. Rating Service (`services/ratingService.ts`)

Created a comprehensive service with methods:
- `createRating()` - Save new rating with all dimensions
- `getRatingByCompletion()` - Get rating for a specific completion
- `getRecipeRatings()` - Get all ratings for a recipe
- `getRecipeRatingStats()` - Get aggregated stats from view
- `getUserRatings()` - Get all ratings by user
- `updateRating()` - Update existing rating
- `deleteRating()` - Remove rating (and clear references)
- `hasRatedCompletion()` - Check if user already rated

### 3. Recipe Service Updates (`services/recipeService.ts`)

Modified `completeRecipe()` to:
- Return `completionId` in the result
- This allows the rating to be linked to the specific completion instance

### 4. Cooking Screen Integration (`app/(tabs)/cooking/[id].tsx`)

Updated `handleRatingSubmit()` to:
- Complete the recipe first to get the `completionId`
- Save the rating data via `ratingService.createRating()`
- Link the rating to the completion record
- Handle errors gracefully with user feedback
- Show level-up modal if applicable

### 5. TypeScript Types (`types/database.ts`)

Added types for:
- `recipe_ratings` table (Row, Insert, Update)
- Updated `user_completed_meals` table with rating fields
- All proper foreign key relationships

## Data Flow

1. **User finishes cooking** → Clicks "Finish Cooking"
2. **Rating modal shows** → User rates on multiple dimensions
3. **Submit rating** → `handleRatingSubmit()` called
4. **Recipe completed** → `recipeService.completeRecipe()` returns `completionId`
5. **Rating saved** → `ratingService.createRating()` stores rating
6. **Completion updated** → `rating_id` and `user_rating` fields set
7. **Navigation** → User sees level-up or returns to home

## Database Relationships

```
users ──┐
        ├──> recipe_ratings ──> recipes
        │         │
        │         └──> user_completed_meals
        │                   │
        └───────────────────┘
```

## Usage Example

```typescript
// When user submits rating
const { error } = await ratingService.createRating(
  userId,
  recipeId,
  completionId,
  suggestedTime,
  {
    overallRating: 5,
    difficulty: 3,
    timeAccuracy: 4,
    taste: 5,
    instructions: 5,
    actualTime: 35,
    modifications: "Added extra garlic",
    wouldCookAgain: true
  }
)

// Get stats for a recipe
const { data: stats } = await ratingService.getRecipeRatingStats(recipeId)
// stats.avg_overall_rating
// stats.would_cook_again_percentage
// stats.avg_actual_time
```

## Migration Status

⚠️ **Migration not yet applied** - The Supabase project is currently inactive.

### To apply the migration:

1. Restore the Supabase project (if paused)
2. Use Supabase MCP tool:
   ```typescript
   mcp_supabase_apply_migration({
     project_id: "maroymbcazdisgazwiyx",
     name: "add_recipe_ratings",
     query: "..." // contents of 20251126000000_add_recipe_ratings.sql
   })
   ```
3. Or use Supabase CLI:
   ```bash
   supabase db push
   ```

## Next Steps

### Required Before Testing:
- [ ] Apply the migration to the database
- [ ] Test on device with actual recipe completion
- [ ] Verify RLS policies work correctly

### Future Enhancements:
- [ ] Display rating stats on recipe detail screen
- [ ] Show user's previous ratings in profile
- [ ] Use ratings to improve recommendation algorithm
- [ ] Add rating filters/sorting to recipe list
- [ ] Show "Top Rated" recipes section
- [ ] Export rating data for ML model training
- [ ] Add rating distribution charts (histogram)
- [ ] Allow users to edit their ratings

## Benefits

1. **Data Quality**: Dimensional ratings provide richer insights than simple 1-5 stars
2. **Time Accuracy**: Track actual vs estimated prep time for better estimates
3. **User Engagement**: "Would cook again" flag helps surface recipes users love
4. **Personalization**: Rich rating data enables better recommendation tuning
5. **Recipe Improvement**: Modifications field captures user creativity
6. **ML Ready**: Structured data perfect for training recommendation models

## Security

- **Row Level Security (RLS)** enabled on `recipe_ratings`
- Users can only:
  - View their own ratings
  - Insert ratings for recipes they completed
  - Update/delete their own ratings
- Backend validation ensures:
  - Ratings are 1-5 range
  - One rating per completion
  - Proper user authentication

## Performance Considerations

- **Indexes** added on:
  - `user_id` - Fast user rating lookups
  - `recipe_id` - Fast recipe rating aggregation
  - `created_at` - Temporal queries
  - `overall_rating` - Filter by rating value
- **Materialized view alternative**: If `recipe_rating_stats` becomes slow, consider materializing it with periodic refresh
- **Caching**: Consider caching aggregated stats in Redis for high-traffic recipes
