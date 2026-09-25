import { describe, expect, it } from 'vitest'
import {
  attemptsLeft,
  currentPuzzleIndex,
  NEW_RESULT,
  starsForAttempt,
  starsStillPossible,
  submitAnswer,
  totalStars,
  type PuzzleResult,
} from './scoring'

const puzzle = { question: 'Hva er 7 * 8?', answer: 56 }

function answer(result: PuzzleResult, ...inputs: string[]): PuzzleResult {
  return inputs.reduce((r, input) => submitAnswer(r, puzzle, input).result, result)
}

describe('stars', () => {
  it('gives 3, 2, 1 and 0 stars for a correct answer on try 1 to 4', () => {
    expect([1, 2, 3, 4].map(starsForAttempt)).toEqual([3, 2, 1, 0])
  })

  it('gives 3 stars when right on the first try', () => {
    const { result, outcome } = submitAnswer(NEW_RESULT, puzzle, '56')
    expect(outcome).toBe('correct')
    expect(result).toEqual({ attempts: 1, status: 'solved', stars: 3 })
  })

  it('gives 2 stars on the second try and 1 star on the third', () => {
    expect(answer(NEW_RESULT, '54', '56')).toEqual({ attempts: 2, status: 'solved', stars: 2 })
    expect(answer(NEW_RESULT, '54', '48', '56')).toEqual({ attempts: 3, status: 'solved', stars: 1 })
  })

  it('counts a correct fourth try as solved without stars', () => {
    expect(answer(NEW_RESULT, '1', '2', '3', '56')).toEqual({ attempts: 4, status: 'solved', stars: 0 })
  })

  it('fails the puzzle after four wrong answers', () => {
    const three = answer(NEW_RESULT, '1', '2', '3')
    expect(three.status).toBe('open')
    const { result, outcome } = submitAnswer(three, puzzle, '4')
    expect(outcome).toBe('failed')
    expect(result).toEqual({ attempts: 4, status: 'failed', stars: 0 })
  })

  it('ignores empty answers and answers after the puzzle is closed', () => {
    expect(submitAnswer(NEW_RESULT, puzzle, '  ')).toEqual({ result: NEW_RESULT, outcome: 'empty' })
    const solved = answer(NEW_RESULT, '56')
    expect(submitAnswer(solved, puzzle, '1')).toEqual({ result: solved, outcome: 'closed' })
  })

  it('shows how many stars and tries are left', () => {
    expect(starsStillPossible(NEW_RESULT)).toBe(3)
    expect(attemptsLeft(NEW_RESULT)).toBe(4)
    const oneWrong = answer(NEW_RESULT, '1')
    expect(starsStillPossible(oneWrong)).toBe(2)
    expect(attemptsLeft(oneWrong)).toBe(3)
  })
})

describe('day progress', () => {
  const solved: PuzzleResult = { attempts: 1, status: 'solved', stars: 3 }
  const failed: PuzzleResult = { attempts: 4, status: 'failed', stars: 0 }

  it('finds the first open puzzle', () => {
    expect(currentPuzzleIndex([], 3)).toBe(0)
    expect(currentPuzzleIndex([solved], 3)).toBe(1)
    expect(currentPuzzleIndex([solved, failed], 3)).toBe(2)
    expect(currentPuzzleIndex([solved, failed, solved], 3)).toBe(3)
  })

  it('adds up stars', () => {
    expect(totalStars([solved, failed, { attempts: 2, status: 'solved', stars: 2 }])).toBe(5)
  })
})
