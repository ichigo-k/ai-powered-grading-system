/**
 * Grading scale utility.
 *
 * The scale is stored in system_settings.gradingScale as a JSON array:
 *   [{ label: string, minPercent: number }, ...]
 *
 * Entries should be sorted descending by minPercent (highest first).
 * The entry with minPercent: 0 acts as the catch-all (e.g. "F").
 *
 * computeGrade() is a pure function — pass the scale in so it can be called
 * anywhere without a DB round-trip (load the scale once per request at the
 * top level, then pass it down).
 */

export type GradeEntry = {
  label: string
  minPercent: number
}

export const DEFAULT_GRADING_SCALE: GradeEntry[] = [
  { label: 'A+', minPercent: 90 },
  { label: 'A',  minPercent: 85 },
  { label: 'A-', minPercent: 80 },
  { label: 'B+', minPercent: 75 },
  { label: 'B',  minPercent: 70 },
  { label: 'B-', minPercent: 65 },
  { label: 'C+', minPercent: 60 },
  { label: 'C',  minPercent: 55 },
  { label: 'C-', minPercent: 50 },
  { label: 'D+', minPercent: 45 },
  { label: 'D',  minPercent: 40 },
  { label: 'F',  minPercent: 0  },
]

/**
 * Compute a letter grade from a raw score and total marks.
 *
 * @param score       - The student's score (>= 0)
 * @param totalMarks  - The maximum possible score (> 0)
 * @param scale       - The grading scale to use (defaults to DEFAULT_GRADING_SCALE)
 * @returns           - The matching label string (e.g. "A+", "B", "F")
 */
export function computeGrade(
  score: number,
  totalMarks: number,
  scale: GradeEntry[] = DEFAULT_GRADING_SCALE,
): string {
  if (totalMarks <= 0) return scale[scale.length - 1]?.label ?? 'F'

  const percentage = (score / totalMarks) * 100

  // Sort descending so we match the highest threshold first
  const sorted = [...scale].sort((a, b) => b.minPercent - a.minPercent)

  for (const entry of sorted) {
    if (percentage >= entry.minPercent) {
      return entry.label
    }
  }

  // Fallback — should not reach here if scale has a 0-threshold entry
  return sorted[sorted.length - 1]?.label ?? 'F'
}

/**
 * Parse the raw JSON value from the DB into a typed GradeEntry array.
 * Falls back to the default scale if the value is missing or malformed.
 */
export function parseGradingScale(raw: unknown): GradeEntry[] {
  if (!Array.isArray(raw)) return DEFAULT_GRADING_SCALE
  const parsed = raw.filter(
    (e): e is GradeEntry =>
      typeof e === 'object' &&
      e !== null &&
      typeof (e as any).label === 'string' &&
      typeof (e as any).minPercent === 'number',
  )
  return parsed.length > 0 ? parsed : DEFAULT_GRADING_SCALE
}
