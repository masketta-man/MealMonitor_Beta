import { TutorialStep } from '@/components/TutorialOverlay'

export const APP_TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to MealMonitor!',
    description: 'Your personal cooking companion for building healthy eating habits. Let\'s take a quick tour of the features!',
    icon: 'hand-right',
    position: 'center',
  },
  {
    id: 'home',
    title: 'Your Dashboard',
    description: 'Track your daily progress with the calorie counter, maintain your cooking streak, and monitor your level & XP. View active challenges and your recent activity feed all in one place!',
    icon: 'home',
    position: 'center',
  },
  {
    id: 'recipes',
    title: 'Discover Recipes',
    description: 'Browse curated recipes with detailed nutrition info. Filter by meal type, difficulty, and dietary needs. Get AI-powered recommendations based on your goals with personalized match scores!',
    icon: 'restaurant',
    position: 'center',
  },
  {
    id: 'cooking',
    title: 'Interactive Cooking Mode',
    description: 'Follow step-by-step instructions with built-in timers for each cooking stage. Complete recipes to earn XP points, level up, and log calories automatically!',
    icon: 'timer',
    position: 'center',
  },
  {
    id: 'challenges',
    title: 'Complete Challenges',
    description: 'Join time-limited challenges with specific tasks to complete. Earn bonus XP, unlock badges, and build healthy cooking habits. Check upcoming challenges before they expire!',
    icon: 'trophy',
    position: 'center',
  },
  {
    id: 'profile',
    title: 'Your Progress & Achievements',
    description: 'View your current level, total XP, and earned badges. Check your activity feed to see completed meals, earned achievements, and cooking milestones!',
    icon: 'person',
    position: 'center',
  },
  {
    id: 'settings',
    title: 'Personalize Your Experience',
    description: 'Set your daily calorie goals, dietary restrictions (vegetarian, vegan, etc.), and activity level. Manage your ingredient pantry for better recipe recommendations. The app adapts to you!',
    icon: 'settings',
    position: 'center',
  },
  {
    id: 'ready',
    title: 'You\'re Ready to Cook!',
    description: 'Start by browsing recipes or taking on a challenge. Every meal you cook earns XP, maintains your streak, and moves you closer to your health goals. Happy cooking!',
    icon: 'checkmark-circle',
    position: 'center',
  },
]
