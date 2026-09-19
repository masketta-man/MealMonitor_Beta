/**
 * Rescales the numeric quantity at the start of a free-text ingredient amount,
 * leaving the unit and any trailing text untouched.
 *
 * Recipe amounts are stored as free text ("2 cups", "1/2 tsp", "3 cloves",
 * "2-3 tbsp", "½ onion"), so scaling for a different serving count means finding
 * the leading number, multiplying it, and formatting the result back in a form a
 * cook would actually write. Anything without a leading number ("to taste",
 * "a pinch") is returned unchanged.
 */

// Unicode fraction glyphs mapped to their decimal value.
const UNICODE_FRACTIONS: Record<string, number> = {
  "¼": 0.25,
  "½": 0.5,
  "¾": 0.75,
  "⅓": 1 / 3,
  "⅔": 2 / 3,
  "⅕": 0.2,
  "⅖": 0.4,
  "⅗": 0.6,
  "⅘": 0.8,
  "⅙": 1 / 6,
  "⅚": 5 / 6,
  "⅛": 0.125,
  "⅜": 0.375,
  "⅝": 0.625,
  "⅞": 0.875,
}

// Common decimals rendered back as the fractions a cook expects to read.
const DECIMAL_TO_FRACTION: { value: number; text: string }[] = [
  { value: 1 / 3, text: "1/3" },
  { value: 2 / 3, text: "2/3" },
  { value: 0.25, text: "1/4" },
  { value: 0.5, text: "1/2" },
  { value: 0.75, text: "3/4" },
  { value: 0.125, text: "1/8" },
  { value: 0.375, text: "3/8" },
  { value: 0.625, text: "5/8" },
  { value: 0.875, text: "7/8" },
]

const EPSILON = 0.02

/**
 * Parse the leading numeric token of a string into a decimal value and the
 * length of text it consumed. Handles:
 *   "2"        -> whole
 *   "2.5"      -> decimal
 *   "1/2"      -> ascii fraction
 *   "1 1/2"    -> mixed number
 *   "½" / "1½" -> unicode fraction, optionally after a whole number
 * Returns null if the string does not start with a number.
 */
const parseLeadingQuantity = (
  text: string,
): { value: number; length: number } | null => {
  // Mixed or simple ascii number: "1 1/2", "1/2", "2.5", "2"
  const asciiMatch = text.match(/^(\d+(?:\.\d+)?)(?:\s+(\d+)\/(\d+))?/)
  const asciiFractionMatch = text.match(/^(\d+)\/(\d+)/)

  // Pure ascii fraction like "1/2" (no leading whole number).
  if (asciiFractionMatch && text.indexOf("/") <= 2) {
    const numerator = parseInt(asciiFractionMatch[1], 10)
    const denominator = parseInt(asciiFractionMatch[2], 10)
    if (denominator !== 0) {
      return {
        value: numerator / denominator,
        length: asciiFractionMatch[0].length,
      }
    }
  }

  if (asciiMatch) {
    const whole = parseFloat(asciiMatch[1])
    // Mixed number: "1 1/2"
    if (asciiMatch[2] && asciiMatch[3]) {
      const denominator = parseInt(asciiMatch[3], 10)
      if (denominator !== 0) {
        const frac = parseInt(asciiMatch[2], 10) / denominator
        return { value: whole + frac, length: asciiMatch[0].length }
      }
    }

    // Whole/decimal possibly followed by a unicode fraction: "1½"
    const after = text.slice(asciiMatch[1].length)
    const unicodeAfter = after.match(/^\s*(.)/)
    if (unicodeAfter && UNICODE_FRACTIONS[unicodeAfter[1]] !== undefined) {
      return {
        value: whole + UNICODE_FRACTIONS[unicodeAfter[1]],
        length: asciiMatch[1].length + unicodeAfter[0].length,
      }
    }

    return { value: whole, length: asciiMatch[1].length }
  }

  // Leading unicode fraction on its own: "½ onion"
  const firstChar = text.charAt(0)
  if (UNICODE_FRACTIONS[firstChar] !== undefined) {
    return { value: UNICODE_FRACTIONS[firstChar], length: 1 }
  }

  return null
}

/**
 * Format a scaled decimal back into a cook-friendly string: whole numbers stay
 * whole, common fractions render as fractions ("1/2", "1 1/2"), everything else
 * falls back to at most two decimals.
 */
const formatQuantity = (value: number): string => {
  if (value <= 0) return "0"

  const whole = Math.floor(value + 1e-9)
  const remainder = value - whole

  if (remainder < EPSILON) {
    return String(whole)
  }

  for (const { value: fracValue, text } of DECIMAL_TO_FRACTION) {
    if (Math.abs(remainder - fracValue) < EPSILON) {
      return whole > 0 ? `${whole} ${text}` : text
    }
  }

  // No clean fraction: trim to 2 decimals and drop trailing zeros.
  const rounded = Math.round(value * 100) / 100
  return String(rounded)
}

/**
 * Scale a single free-text amount by `factor`.
 *
 * Supports a leading range ("2-3 cups" -> both ends scaled). Returns the input
 * unchanged when there is no leading number, or when factor is 1.
 */
export const scaleAmount = (amount: string, factor: number): string => {
  if (!amount || factor === 1 || !Number.isFinite(factor) || factor <= 0) {
    return amount
  }

  const trimmed = amount.trimStart()
  const leadingWhitespace = amount.slice(0, amount.length - trimmed.length)

  // Range: "2-3 cups" or "2 - 3 cups". Scale both bounds.
  const rangeMatch = trimmed.match(/^(.+?)\s*[-–]\s*(.+)/)
  if (rangeMatch) {
    const low = parseLeadingQuantity(rangeMatch[1])
    // Only treat as a range if the left side is purely a number.
    if (low && low.length === rangeMatch[1].trim().length) {
      const highText = rangeMatch[2]
      const high = parseLeadingQuantity(highText)
      if (high) {
        const scaledLow = formatQuantity(low.value * factor)
        const scaledHigh = formatQuantity(high.value * factor)
        const unit = highText.slice(high.length)
        return `${leadingWhitespace}${scaledLow}-${scaledHigh}${unit}`
      }
    }
  }

  const parsed = parseLeadingQuantity(trimmed)
  if (!parsed) return amount

  const scaled = formatQuantity(parsed.value * factor)
  const rest = trimmed.slice(parsed.length)
  return `${leadingWhitespace}${scaled}${rest}`
}
