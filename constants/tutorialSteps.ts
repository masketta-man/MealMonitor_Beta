import { TutorialStep } from '@/components/TutorialOverlay'

export const APP_TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to MealMonitor!',
    description: 'Let\'s take a quick tour of the app to help you get started. You can skip this tour anytime.',
    icon: 'hand-right',
    position: 'center',
  },
  {
    id: 'home',
    title: 'Your Dashboard',
    description: 'This is your home screen where you\'ll see your daily meal plan, current streak, and quick stats. Check here daily to stay on track!',
    icon: 'home',
    position: 'center',
  },
  {
    id: 'recipes',
    title: 'Discover Recipes',
    description: 'Browse through our collection of healthy recipes. Filter by meal type, difficulty, and dietary preferences to find the perfect meal.',
    icon: 'restaurant',
    position: 'center',
  },
  {
    id: 'cooking',
    title: 'Start Cooking',
    description: 'Follow step-by-step instructions with built-in timers. Complete recipes to earn points and level up your cooking skills!',
    icon: 'timer',
    position: 'center',
  },
  {
    id: 'challenges',
    title: 'Take on Challenges',
    description: 'Join weekly challenges to earn bonus points and badges. Push yourself to try new recipes and build healthy habits!',
    icon: 'trophy',
    position: 'center',
  },
  {
    id: 'profile',
    title: 'Track Your Progress',
    description: 'View your level, earned badges, and activity history in your profile. See how far you\'ve come on your cooking journey!',
    icon: 'person',
    position: 'center',
  },
  {
    id: 'settings',
    title: 'Customize Your Experience',
    description: 'Set your personal goals, dietary restrictions, and activity level in Settings. The app will adapt to your preferences!',
    icon: 'settings',
    position: 'center',
  },
  {
    id: 'ready',
    title: 'You\'re All Set!',
    description: 'You\'re ready to start your healthy cooking adventure. Remember, consistency is key. Let\'s get cooking!',
    icon: 'checkmark-circle',
    position: 'center',
  },
]
