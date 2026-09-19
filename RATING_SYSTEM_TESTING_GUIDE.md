# Rating System Testing Guide

## Prerequisites

1. ✅ Database migration applied (`20251126000000_add_recipe_ratings.sql`)
2. ✅ App running on device/simulator
3. ✅ User logged in
4. ✅ At least one recipe available to cook

## Test Scenarios

### 1. Basic Rating Flow

**Steps:**
1. Navigate to a recipe
2. Click "Start Cooking"
3. Go through all cooking steps
4. Click "Finish Cooking"
5. Rating modal should appear

**Expected:**
- Modal shows recipe title
- 5 rating dimensions visible
- All stars clickable
- Time adjuster shows suggested prep time
- Submit button enabled only when all ratings filled

**Verify:**
- [ ] Modal appears after clicking "Finish Cooking"
- [ ] Recipe title displayed correctly
- [ ] All 5 rating sections present
- [ ] Stars change color when tapped
- [ ] Time adjuster +/- buttons work
- [ ] Modifications text input works
- [ ] Would-cook-again toggle works
- [ ] Submit button behavior correct

### 2. Complete Rating Submission

**Steps:**
1. Complete basic rating flow above
2. Fill in all 5 ratings (overall + 4 dimensions)
3. Adjust time if desired
4. Add modifications text (optional)
5. Toggle "Would Cook Again"
6. Click "Submit Rating"

**Expected:**
- Rating saved to database
- Completion record created/updated
- XP/points awarded
- Level-up modal if applicable
- Navigate to home screen

**Verify:**
- [ ] No errors in console
- [ ] Rating saved (check database or Supabase dashboard)
- [ ] `user_completed_meals` record has `rating_id` and `user_rating`
- [ ] User XP increased
- [ ] Level-up modal appears if leveled up
- [ ] Returns to home after dismissing modal

### 3. Database Validation

**Query 1: Check rating was saved**
```sql
SELECT * FROM recipe_ratings 
WHERE user_id = 'YOUR_USER_ID' 
ORDER BY created_at DESC 
LIMIT 1;
```

**Expected Fields:**
- `overall_rating`: 1-5
- `difficulty_rating`: 1-5
- `time_accuracy_rating`: 1-5
- `taste_rating`: 1-5
- `instructions_rating`: 1-5
- `actual_time_minutes`: number
- `suggested_time_minutes`: number
- `modifications`: text or null
- `would_cook_again`: true/false
- `completion_id`: UUID reference

**Query 2: Check completion record updated**
```sql
SELECT * FROM user_completed_meals 
WHERE user_id = 'YOUR_USER_ID' 
AND recipe_id = 'RECIPE_ID' 
ORDER BY completed_at DESC 
LIMIT 1;
```

**Expected:**
- `rating_id`: matches rating.id from Query 1
- `user_rating`: matches overall_rating from Query 1

**Query 3: Check aggregated stats**
```sql
SELECT * FROM recipe_rating_stats 
WHERE recipe_id = 'RECIPE_ID';
```

**Expected:**
- `total_ratings`: >= 1
- `avg_overall_rating`: between 1 and 5
- `would_cook_again_percentage`: 0-100

### 4. Multiple Completions

**Steps:**
1. Complete the same recipe 2-3 times
2. Rate each completion differently

**Expected:**
- Each completion gets its own rating record
- All ratings linked to correct completions
- Stats view shows aggregated averages

**Verify:**
- [ ] Multiple rating records exist
- [ ] Each has unique `completion_id`
- [ ] `recipe_rating_stats` shows correct count
- [ ] Average ratings calculated correctly

### 5. Edge Cases

#### A. Skip Rating (if possible)
**Note:** Currently rating modal is required. Test after adding skip functionality.

#### B. Rapid Tap Protection
**Steps:**
1. Go through rating flow
2. Tap submit button multiple times rapidly

**Expected:**
- Only one rating created
- No duplicate entries
- No race conditions

**Verify:**
- [ ] Only one rating in database
- [ ] No errors in console

#### C. Network Error
**Steps:**
1. Turn on airplane mode
2. Complete rating flow
3. Try to submit

**Expected:**
- Graceful error message
- User notified
- Option to retry

**Verify:**
- [ ] Error alert shown
- [ ] Explains the issue clearly
- [ ] No crash

#### D. Empty Modifications
**Steps:**
1. Complete rating
2. Leave modifications field empty
3. Submit

**Expected:**
- Rating saved successfully
- `modifications` field is null
- No errors

**Verify:**
- [ ] Rating saved
- [ ] No validation errors

#### E. Maximum Time Adjustment
**Steps:**
1. Adjust time to extreme values (e.g., 300 minutes)
2. Submit rating

**Expected:**
- Time saved correctly
- No overflow errors

**Verify:**
- [ ] `actual_time_minutes` saved correctly
- [ ] Stats calculation handles large values

### 6. RLS Security Testing

**Test User A:**
```sql
-- As User A, try to read User B's ratings
SELECT * FROM recipe_ratings WHERE user_id = 'USER_B_ID';
```

**Expected:** No results (RLS blocks)

**Test Insert:**
```sql
-- As User A, try to insert rating with User B's ID
INSERT INTO recipe_ratings (user_id, recipe_id, overall_rating, ...)
VALUES ('USER_B_ID', ...);
```

**Expected:** Permission denied (RLS blocks)

**Verify:**
- [ ] Users can only see their own ratings
- [ ] Users cannot impersonate other users
- [ ] RLS policies working correctly

### 7. UI/UX Testing

#### Star Rating Interaction
- [ ] Tap 1st star → fills 1 star
- [ ] Tap 3rd star → fills 3 stars
- [ ] Tap same star → deselects (if implemented)
- [ ] Visual feedback immediate
- [ ] All 5 dimensions independent

#### Time Adjuster
- [ ] Shows suggested time initially
- [ ] + button increments by 5 minutes
- [ ] - button decrements by 5 minutes
- [ ] Can't go below 0 (if validation added)
- [ ] Updates actual_time_minutes

#### Modifications Text
- [ ] Keyboard appears on tap
- [ ] Multiline supported
- [ ] Character limit (if any) enforced
- [ ] Placeholder text clear

#### Would Cook Again Toggle
- [ ] Default state clear
- [ ] Tap to toggle
- [ ] Visual state change
- [ ] Persists to database

#### Submit Button
- [ ] Disabled when ratings incomplete
- [ ] Enabled when all required filled
- [ ] Shows loading state during save
- [ ] Doesn't allow double-tap

### 8. Performance Testing

**Recipe with Many Ratings:**
1. Add 100+ ratings to a recipe (script/manual)
2. View recipe stats
3. Measure load time

**Expected:**
- Stats load in < 2 seconds
- No N+1 queries
- View performs well

**Verify:**
- [ ] Acceptable load time
- [ ] Consider index optimization if slow
- [ ] Consider caching if needed

### 9. Recommendation Impact (Future)

Once recommendation system uses ratings:

**Test:**
1. Rate recipe 5 stars, "would cook again"
2. Check recommendations
3. Should rank higher

**Verify:**
- [ ] Highly rated recipes prioritized
- [ ] "Would cook again" influences score
- [ ] Time accuracy affects future estimates

## Test Data Examples

### Good Rating
```typescript
{
  overallRating: 5,
  difficulty: 2,
  timeAccuracy: 4,
  taste: 5,
  instructions: 5,
  actualTime: 30,
  modifications: "Added extra garlic and used olive oil instead of butter",
  wouldCookAgain: true
}
```

### Critical Rating
```typescript
{
  overallRating: 2,
  difficulty: 5,
  timeAccuracy: 1,
  taste: 3,
  instructions: 2,
  actualTime: 90,
  modifications: "Took way longer than expected, instructions unclear at step 3",
  wouldCookAgain: false
}
```

### Neutral Rating
```typescript
{
  overallRating: 3,
  difficulty: 3,
  timeAccuracy: 3,
  taste: 3,
  instructions: 3,
  actualTime: 45,
  modifications: "",
  wouldCookAgain: true
}
```

## Console Logs to Monitor

```
📝 Rating submitted: {...}
🏁 recipeService.completeRecipe: Starting...
🏁 recipeService.completeRecipe: Completion recorded: { completionId: ..., pointsAwarded: ... }
🎉 FINISH COOKING: Function called
```

## Common Issues & Solutions

### Issue: Modal doesn't appear
**Check:**
- `showRatingModal` state
- `finishCooking()` called
- No JavaScript errors

### Issue: Rating not saving
**Check:**
- Network connection
- Supabase connection
- RLS policies
- Console errors
- Database constraints

### Issue: Completion ID null
**Check:**
- `recipeService.completeRecipe()` returns completionId
- Insert query uses `.select('id')`
- No errors in completion insert

### Issue: Stats not updating
**Check:**
- View definition correct
- Trigger running
- Cache invalidation
- Foreign keys correct

## Success Criteria

✅ All test scenarios pass
✅ No console errors
✅ Database constraints respected
✅ RLS policies working
✅ UI responsive and intuitive
✅ Data persists correctly
✅ Stats calculate accurately
✅ Performance acceptable

## Regression Testing

After each code change, verify:
1. Basic rating flow still works
2. No new console errors
3. Database writes successful
4. No performance degradation

## Automated Testing (Future)

Consider adding:
- Unit tests for `ratingService`
- Integration tests for complete flow
- E2E tests with Detox/Maestro
- Mock database for fast tests

## Accessibility Testing

- [ ] Screen reader announces rating values
- [ ] All buttons have labels
- [ ] Color contrast sufficient
- [ ] Touch targets >= 44x44 pixels
- [ ] Keyboard navigation works (web)

## Localization Testing (Future)

When adding i18n:
- [ ] All text translatable
- [ ] Number formats locale-aware
- [ ] Date/time formats correct
- [ ] RTL layouts work

## Notes

- Test on both iOS and Android
- Test on different screen sizes
- Test with slow network (throttling)
- Test with database offline
- Test after app backgrounding
- Test after device rotation
