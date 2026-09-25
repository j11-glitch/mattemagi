import type { PuzzleResult } from './domain/scoring'

/** child id -> date ("YYYY-MM-DD") -> results of that day's puzzles, in order. */
export type ResultsStore = Record<string, Record<string, PuzzleResult[]>>

const STORAGE_KEY = 'mattemagi:results:v1'

export function loadResults(): ResultsStore {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const data: unknown = raw ? JSON.parse(raw) : {}
    return typeof data === 'object' && data !== null ? (data as ResultsStore) : {}
  } catch {
    return {}
  }
}

export function saveResults(store: ResultsStore): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  } catch {
    // Storage may be unavailable (private mode); the day still works, it just isn't remembered.
  }
}
