/**
 * Central place for anything that turns a user's goals + activity level into a
 * daily calorie target, plus the activity-level definitions the onboarding and
 * settings screens both render.
 *
 * Activity level used to be a dead input: it was collected but never read, so
 * the calorie target (which drives calorie tracking AND recipe recommendation
 * scoring) was identical regardless of how active a user was. This module makes
 * it matter by layering an activity multiplier on top of a goal-derived base.
 *
 * Note: this is a pragmatic estimate, not a clinical TDEE. We don't collect
 * weight/height/age, so we start from a goal-based baseline rather than a BMR.
 */

export type ActivityLevel =
  | "sedentary"
  | "lightly_active"
  | "moderately_active"
  | "very_active"
  | "extremely_active"

export interface ActivityLevelOption {
  id: ActivityLevel
  label: string
  description: string
}

/** Shared list rendered by both onboarding and settings so they never drift. */
export const ACTIVITY_LEVELS: ActivityLevelOption[] = [
  { id: "sedentary", label: "Sedentary", description: "Little to no exercise" },
  {
    id: "lightly_active",
    label: "Lightly Active",
    description: "Exercise 1-3 times/week",
  },
  {
    id: "moderately_active",
    label: "Moderately Active",
    description: "Exercise 3-5 times/week",
  },
  {
    id: "very_active",
    label: "Very Active",
    description: "Exercise 6-7 times/week",
  },
  {
    id: "extremely_active",
    label: "Extremely Active",
    description: "Physical job or training twice/day",
  },
]

/**
 * Standard activity multipliers (the same ones used in TDEE estimates). These
 * are expressed relative to "moderately_active" so that the goal-based baseline
 * — which already assumes a moderately active person — stays unchanged for that
 * level and scales sensibly up or down from there.
 */
const ACTIVITY_MULTIPLIER: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  extremely_active: 1.9,
}

const BASELINE_MULTIPLIER = ACTIVITY_MULTIPLIER.moderately_active

const DEFAULT_CALORIE_GOAL = 2000

// Keys must match the HEALTH_GOALS option labels used in onboarding exactly.
const GOAL_CALORIE_MAP: Record<string, number> = {
  "Lose weight": 1800,
  "Gain muscle": 2500,
  "Maintain weight": 2000,
  "Improve energy": 2000,
  "Eat healthier": 2000,
  "Manage a health condition": 2000,
}

/**
 * The goal-derived baseline calorie figure, assuming a moderately active person.
 * Kept separate from the activity scaling so both onboarding and settings can
 * share the exact same goal logic.
 */
function baselineFromGoals(healthGoals: string[]): number {
  if (!healthGoals || healthGoals.length === 0) {
    return DEFAULT_CALORIE_GOAL
  }

  const selectedGoalCalories = healthGoals
    .map((goal) => GOAL_CALORIE_MAP[goal])
    .filter((cal): cal is number => cal !== undefined)

  if (selectedGoalCalories.length === 0) {
    return DEFAULT_CALORIE_GOAL
  }

  const hasLoseWeight = healthGoals.includes("Lose weight")
  const hasGainMuscle = healthGoals.includes("Gain muscle")
  const hasMaintainWeight = healthGoals.includes("Maintain weight")

  // Conflicting goals (lose + gain) resolve to a balanced middle ground.
  if (hasLoseWeight && hasGainMuscle) {
    return DEFAULT_CALORIE_GOAL
  }

  // Maintain weight alongside other goals anchors to maintenance.
  if (hasMaintainWeight && selectedGoalCalories.length > 1) {
    return DEFAULT_CALORIE_GOAL
  }

  return Math.round(
    selectedGoalCalories.reduce((sum, cal) => sum + cal, 0) /
      selectedGoalCalories.length,
  )
}

/**
 * Compute the daily calorie target from the user's health goals and activity
 * level. The goal sets the baseline; the activity level scales it relative to a
 * moderately active person. Rounded to the nearest 10 for a tidy number.
 */
export function calculateCalorieGoal(
  healthGoals: string[],
  activityLevel: ActivityLevel = "moderately_active",
): number {
  const baseline = baselineFromGoals(healthGoals)
  const multiplier =
    ACTIVITY_MULTIPLIER[activityLevel] ?? BASELINE_MULTIPLIER
  const scaled = baseline * (multiplier / BASELINE_MULTIPLIER)
  return Math.round(scaled / 10) * 10
}

/**
 * How strongly a user's activity level should pull recommendations toward
 * heavier (energy-dense / high-protein) vs. lighter (low-calorie) recipes.
 *
 * Returns a value in roughly [-1, 1]:
 *   > 0  favor heavier, protein-rich meals (more active)
 *   < 0  favor lighter, low-calorie meals (less active)
 *   0    neutral (moderately active)
 */
export function activityRecommendationBias(
  activityLevel: ActivityLevel | string | null | undefined,
): number {
  switch (activityLevel) {
    case "sedentary":
      return -1
    case "lightly_active":
      return -0.5
    case "very_active":
      return 0.5
    case "extremely_active":
      return 1
    case "moderately_active":
    default:
      return 0
  }
}
