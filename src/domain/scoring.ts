import { isCorrectAnswer, type Puzzle } from './puzzles'

/** Wrong answers allowed before a puzzle is failed. */
export const MAX_ATTEMPTS = 4
export const MAX_STARS = 3

export type PuzzleStatus = 'open' | 'solved' | 'failed'

export interface PuzzleResult {
  readonly attempts: number
  readonly status: PuzzleStatus
  readonly stars: number
}

export const NEW_RESULT: PuzzleResult = { attempts: 0, status: 'open', stars: 0 }

export type SubmitOutcome = 'correct' | 'wrong' | 'failed' | 'empty' | 'closed'

/** Correct on try 1 = 3 stars, try 2 = 2, try 3 = 1, try 4 = solved without stars. */
export function starsForAttempt(attempt: number): number {
  return Math.max(0, MAX_STARS + 1 - attempt)
}

/** Stars still possible for an open puzzle (for the "stars left" indicator). */
export function starsStillPossible(result: PuzzleResult): number {
  return result.status === 'open' ? starsForAttempt(result.attempts + 1) : result.stars
}

export function attemptsLeft(result: PuzzleResult): number {
  return result.status === 'open' ? MAX_ATTEMPTS - result.attempts : 0
}

export function submitAnswer(
  result: PuzzleResult,
  puzzle: Puzzle,
  input: string,
): { result: PuzzleResult; outcome: SubmitOutcome } {
  if (result.status !== 'open') return { result, outcome: 'closed' }
  if (input.trim() === '') return { result, outcome: 'empty' }

  const attempts = result.attempts + 1
  if (isCorrectAnswer(puzzle, input)) {
    return { result: { attempts, status: 'solved', stars: starsForAttempt(attempts) }, outcome: 'correct' }
  }
  if (attempts >= MAX_ATTEMPTS) {
    return { result: { attempts, status: 'failed', stars: 0 }, outcome: 'failed' }
  }
  return { result: { attempts, status: 'open', stars: 0 }, outcome: 'wrong' }
}

/** Index of the first puzzle that is still open, or the number of puzzles when the day is done. */
export function currentPuzzleIndex(results: readonly PuzzleResult[], count: number): number {
  for (let i = 0; i < count; i++) {
    if ((results[i] ?? NEW_RESULT).status === 'open') return i
  }
  return count
}

export function totalStars(results: readonly PuzzleResult[]): number {
  return results.reduce((sum, r) => sum + r.stars, 0)
}
