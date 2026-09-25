/** One puzzle in a weekly file (public/puzzles/<week>.json). */
export interface Puzzle {
  readonly question: string
  readonly answer: string | number
  /** Other accepted answers, e.g. ["3/4", "0,75"]. */
  readonly accept?: readonly (string | number)[]
  /** Shown after the input field, e.g. "kr" or "cm". Typing it in the answer is allowed. */
  readonly unit?: string
  /** Shown after the puzzle is solved or failed. */
  readonly explanation?: string
  /** Keyboard to show; defaults to "number". */
  readonly input?: 'number' | 'text'
}

/** A week of puzzles: date ("YYYY-MM-DD") -> child id -> puzzles for that day. */
export interface WeekFile {
  readonly week: string
  readonly days: Readonly<Record<string, Readonly<Record<string, readonly Puzzle[]>>>>
}

export interface Child {
  readonly id: string
  readonly name: string
  readonly grade: number
  readonly avatar: string
}

export const PUZZLES_PER_DAY = 3

export function puzzlesFor(week: WeekFile | null, date: string, childId: string): readonly Puzzle[] {
  return week?.days[date]?.[childId] ?? []
}

/** Normalizes a typed answer: trims, lowercases, drops spaces, the unit and uses "." for decimals. */
export function normalizeAnswer(value: string | number, unit?: string): string {
  let text = String(value).trim().toLowerCase().replace(/\s+/g, '')
  const normalizedUnit = unit?.toLowerCase().replace(/\s+/g, '')
  if (normalizedUnit && text.endsWith(normalizedUnit) && text.length > normalizedUnit.length) {
    text = text.slice(0, -normalizedUnit.length)
  }
  return text.replace(/,/g, '.')
}

export function isCorrectAnswer(puzzle: Puzzle, input: string): boolean {
  const given = normalizeAnswer(input, puzzle.unit)
  if (given === '') return false
  return [puzzle.answer, ...(puzzle.accept ?? [])].some((expected) => {
    const wanted = normalizeAnswer(expected, puzzle.unit)
    if (given === wanted) return true
    // Numbers compare by value, so "20.250" matches 20.25 and "07" matches 7.
    const a = Number(given)
    const b = Number(wanted)
    return given !== '' && wanted !== '' && Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) < 1e-9
  })
}

/** Problems in a week file (empty when valid). Used by tests to guard the published data. */
export function validateWeekFile(file: WeekFile, childIds: readonly string[], expectedWeek?: string): string[] {
  const errors: string[] = []
  if (expectedWeek && file.week !== expectedWeek) errors.push(`week is "${file.week}", expected "${expectedWeek}"`)
  for (const [date, children] of Object.entries(file.days ?? {})) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) errors.push(`${date}: date must be YYYY-MM-DD`)
    for (const [childId, puzzles] of Object.entries(children)) {
      const where = `${date} ${childId}`
      if (!childIds.includes(childId)) errors.push(`${where}: unknown child "${childId}"`)
      if (puzzles.length !== PUZZLES_PER_DAY) errors.push(`${where}: needs ${PUZZLES_PER_DAY} puzzles, has ${puzzles.length}`)
      puzzles.forEach((puzzle, i) => {
        if (!puzzle.question?.trim()) errors.push(`${where} #${i + 1}: missing question`)
        if (puzzle.answer === undefined || String(puzzle.answer).trim() === '') {
          errors.push(`${where} #${i + 1}: missing answer`)
        }
      })
    }
  }
  return errors
}
