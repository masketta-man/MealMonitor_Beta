import { TutorialStep } from "@/components/TutorialOverlay"

export const APP_TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: "welcome",
    title: "Welcome to MealMonitor!",
    description:
      "Cook real meals, build a streak, and level up along the way. Here's a 30-second tour.",
    icon: "hand-right",
    position: "center",
  },
  {
    id: "pantry",
    title: "Start with your kitchen",
    description:
      "Add what you have on hand in the Ingredients tab. We use your pantry to match recipes you can actually make right now.",
    icon: "nutrition",
    position: "center",
  },
  {
    id: "recipes",
    title: "Find something to cook",
    description:
      "Browse recipes with a match score based on your pantry, goals, and dietary needs. The higher the score, the better the fit.",
    icon: "restaurant",
    position: "center",
  },
  {
    id: "cooking",
    title: "Cook step by step",
    description:
      "Guided cooking mode walks you through each step with built-in timers. Finish a recipe to auto-log calories and earn XP.",
    icon: "timer",
    position: "center",
  },
  {
    id: "rewards",
    title: "Earn as you go",
    description:
      "Every meal builds your streak and XP. Level up, unlock badges, and take on time-limited challenges for bonus rewards.",
    icon: "trophy",
    position: "center",
  },
  {
    id: "ready",
    title: "Let's cook your first meal",
    description:
      "The best way to start is to make something. Pick a recipe and we'll guide you the rest of the way.",
    icon: "checkmark-circle",
    position: "center",
    primaryAction: {
      label: "Cook your first recipe",
      route: "/(tabs)/recipes",
    },
  },
]

export interface TutorialPersonalization {
  /** Number of in-stock ingredients in the user's pantry. */
  pantryCount?: number
  /** Number of recommended recipes the user can already cook in full. */
  readyToCookCount?: number
}

/**
 * Returns a copy of the tutorial steps with a few descriptions tailored to what
 * the user set up during onboarding. Falls back to the generic copy whenever a
 * value is missing or zero, so the tour still reads well for an empty account.
 */
export function personalizeTutorialSteps(
  personalization: TutorialPersonalization = {},
): TutorialStep[] {
  const { pantryCount = 0, readyToCookCount = 0 } = personalization

  return APP_TUTORIAL_STEPS.map((step) => {
    if (step.id === "pantry" && pantryCount > 0) {
      return {
        ...step,
        description: `You've already got ${pantryCount} ${
          pantryCount === 1 ? "ingredient" : "ingredients"
        } in your pantry. Add more anytime in the Ingredients tab, and we'll match recipes you can actually make right now.`,
      }
    }

    if (step.id === "recipes" && readyToCookCount > 0) {
      return {
        ...step,
        description: `Nice, ${readyToCookCount} ${
          readyToCookCount === 1 ? "recipe is" : "recipes are"
        } already a full match for your pantry. Every recipe shows a match score based on your ingredients, goals, and dietary needs.`,
      }
    }

    return step
  })
}
