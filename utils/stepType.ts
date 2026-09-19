import type { Ionicons } from "@expo/vector-icons"

/**
 * Classifies a cooking instruction into a visual "step type" so the UI can show a
 * matching icon. This makes the step list scannable at a glance — a run of prep
 * steps, then a long simmer, then plating reads instantly from the icons.
 *
 * Keyword matching over free text is inherently fuzzy, so this is deliberately
 * conservative: an unmatched step falls back to a neutral generic icon, and a
 * wrong guess is only cosmetic. Order matters — more specific/!decisive verbs are
 * checked before broad ones (e.g. "bake" before "mix", since batter is mixed then
 * baked and the bake is the salient action).
 */

export type StepType =
  | "prep"
  | "bake"
  | "fry"
  | "boil"
  | "mix"
  | "season"
  | "rest"
  | "serve"
  | "generic"

export interface StepTypeInfo {
  type: StepType
  icon: keyof typeof Ionicons.glyphMap
  color: string
  label: string
}

const STEP_TYPES: Record<StepType, Omit<StepTypeInfo, "type">> = {
  prep: { icon: "cut-outline", color: "#0891b2", label: "Prep" },
  bake: { icon: "flame-outline", color: "#ea580c", label: "Bake" },
  fry: { icon: "flame-outline", color: "#dc2626", label: "Cook" },
  boil: { icon: "water-outline", color: "#2563eb", label: "Boil" },
  mix: { icon: "sync-outline", color: "#7c3aed", label: "Mix" },
  season: { icon: "sparkles-outline", color: "#ca8a04", label: "Season" },
  rest: { icon: "hourglass-outline", color: "#64748b", label: "Rest" },
  serve: { icon: "restaurant-outline", color: "#16a34a", label: "Serve" },
  generic: { icon: "ellipse-outline", color: "#64748b", label: "Step" },
}

// Checked top to bottom; first match wins.
const KEYWORD_RULES: { type: StepType; pattern: RegExp }[] = [
  {
    type: "serve",
    pattern: /\b(serve|plate|garnish|drizzle|top with|enjoy|dish out)\b/,
  },
  {
    type: "bake",
    pattern: /\b(bake|roast|oven|broil|grill|toast)\b/,
  },
  {
    type: "fry",
    pattern:
      /\b(fry|fries|fried|frying|saut[eé]|sear|brown|stir[- ]?fry|pan|skillet|carameli[sz]e)\b/,
  },
  {
    type: "boil",
    pattern: /\b(boil|simmer|steam|blanch|poach|braise|stew|reduce|broth)\b/,
  },
  {
    type: "prep",
    pattern:
      /\b(chop|dice|mince|slice|cut|peel|grate|crush|trim|julienne|cube|shred)\b/,
  },
  {
    type: "season",
    pattern:
      /\b(season|salt|pepper|marinate|sprinkle|rub|spice|taste|dress)\b/,
  },
  {
    type: "rest",
    pattern: /\b(rest|chill|refrigerate|cool|freeze|set aside|let sit|soak)\b/,
  },
  {
    type: "mix",
    pattern:
      /\b(mix|stir|whisk|combine|fold|blend|beat|toss|knead|mash|puree|pur[eé]e)\b/,
  },
]

/**
 * Returns the visual descriptor for an instruction. Never throws; unmatched text
 * yields the generic descriptor.
 */
export const getStepType = (instruction: string): StepTypeInfo => {
  const text = (instruction || "").toLowerCase()

  for (const rule of KEYWORD_RULES) {
    if (rule.pattern.test(text)) {
      return { type: rule.type, ...STEP_TYPES[rule.type] }
    }
  }

  return { type: "generic", ...STEP_TYPES.generic }
}
