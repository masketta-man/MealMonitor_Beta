/**
 * Medical conditions the user can declare, used as a SOFT filter on recipe
 * recommendations: recipes carrying "favored" tags get nudged up, recipes with
 * "avoid" tags get nudged down. It never hides recipes outright (that's what the
 * dietary-restriction hard filter is for) — it just reorders.
 *
 * Every tag referenced here already exists in the recipe catalogue (dietary
 * tags like low-carb, high-fiber, high-protein, low-fat, low-calorie, omega-3,
 * mediterranean, vegetarian, vegan). We deliberately don't invent new tags,
 * since a bias against a tag no recipe has would do nothing.
 *
 * This is not medical advice — it's a gentle ranking aid based on common
 * dietary guidance, and the app should present it as such.
 */

export interface MedicalCondition {
  id: string
  label: string
  description: string
  /** Recipe tags (lowercase) to rank UP for someone with this condition. */
  favorTags: string[]
  /** Recipe tags (lowercase) to rank DOWN. */
  avoidTags: string[]
}

export const MEDICAL_CONDITIONS: MedicalCondition[] = [
  {
    id: "diabetes",
    label: "Diabetes",
    description: "Favor lower-carb, higher-fiber meals",
    favorTags: ["low-carb", "high-fiber", "low-calorie"],
    avoidTags: ["high-calorie"],
  },
  {
    id: "hypertension",
    label: "High blood pressure",
    description: "Favor lighter, heart-friendly meals",
    favorTags: ["low-fat", "mediterranean", "low-calorie", "high-fiber"],
    avoidTags: [],
  },
  {
    id: "heart_health",
    label: "Heart health",
    description: "Favor omega-3 and Mediterranean-style meals",
    favorTags: ["omega-3", "mediterranean", "low-fat", "high-fiber"],
    avoidTags: ["high-calorie"],
  },
  {
    id: "high_cholesterol",
    label: "High cholesterol",
    description: "Favor low-fat, high-fiber meals",
    favorTags: ["low-fat", "high-fiber", "mediterranean"],
    avoidTags: [],
  },
  {
    id: "weight_management",
    label: "Weight management",
    description: "Favor lower-calorie, higher-protein meals",
    favorTags: ["low-calorie", "high-protein", "low-carb", "high-fiber"],
    avoidTags: ["high-calorie"],
  },
]

const CONDITIONS_BY_ID = new Map(MEDICAL_CONDITIONS.map((c) => [c.id, c]))

/**
 * Compute a soft ranking adjustment for a recipe given the user's declared
 * conditions and the recipe's tag names (lowercased).
 *
 * Each favored tag present adds a small bonus, each avoided tag a small penalty,
 * capped so a recipe can't be dominated by this signal alone. Returns 0 when the
 * user has no conditions.
 */
export function medicalConditionBias(
  conditionIds: string[] | null | undefined,
  recipeTagNames: string[],
): number {
  if (!conditionIds || conditionIds.length === 0) return 0

  const tags = new Set(recipeTagNames.map((t) => t.toLowerCase()))
  let adjustment = 0

  for (const id of conditionIds) {
    const condition = CONDITIONS_BY_ID.get(id)
    if (!condition) continue

    for (const tag of condition.favorTags) {
      if (tags.has(tag)) adjustment += 6
    }
    for (const tag of condition.avoidTags) {
      if (tags.has(tag)) adjustment -= 8
    }
  }

  // Keep the total influence bounded so conditions nudge, not dominate.
  return Math.max(-20, Math.min(20, adjustment))
}
