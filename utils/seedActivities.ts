import { activityService } from '@/services/activityService'

export async function seedUserActivities(userId: string) {
  const activities = [
    {
      type: 'recipe_completed' as const,
      title: 'Completed Healthy Green Smoothie',
      description: 'Made a delicious and nutritious breakfast smoothie',
      points: 50,
      metadata: { recipe_id: 'sample-1' }
    },
    {
      type: 'challenge_completed' as const,
      title: 'Completed 7-Day Healthy Eating Challenge',
      description: 'Successfully completed the weekly healthy eating challenge',
      points: 200,
      metadata: { challenge_id: 'sample-1' }
    },
    {
      type: 'level_up' as const,
      title: 'Reached Level 3',
      description: 'Leveled up by earning experience points',
      points: 0,
      metadata: { level: 3 }
    },
    {
      type: 'badge_earned' as const,
      title: 'Earned "First Steps" Badge',
      description: 'Completed your first recipe',
      points: 25,
      metadata: { badge_id: 'sample-1' }
    },
    {
      type: 'ingredient_added' as const,
      title: 'Added Fresh Spinach to Pantry',
      description: 'Expanded your ingredient collection',
      points: 10,
      metadata: { ingredient_id: 'sample-1' }
    },
  ]

  for (const activity of activities) {
    await activityService.logActivity(
      userId,
      activity.type,
      activity.title,
      activity.description,
      activity.points,
      activity.metadata
    )

    await new Promise(resolve => setTimeout(resolve, 500))
  }

  console.log(`Seeded ${activities.length} activities for user ${userId}`)
}
