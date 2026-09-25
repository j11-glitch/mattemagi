import type { Child, WeekFile } from './domain/puzzles'

const BASE = import.meta.env.BASE_URL

async function fetchJson<T>(path: string): Promise<T | null> {
  // no-store: new weekly files should show up without waiting for a cache to expire.
  const response = await fetch(`${BASE}${path}`, { cache: 'no-store' })
  if (response.status === 404) return null
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${path}`)
  // Some servers (like the Vite dev server) answer a missing file with the HTML page instead of 404.
  if (!response.headers.get('content-type')?.includes('json')) return null
  return (await response.json()) as T
}

export async function fetchChildren(): Promise<Child[]> {
  return (await fetchJson<Child[]>('children.json')) ?? []
}

/** The puzzles of one ISO week, or null when that week has not been published yet. */
export async function fetchWeek(weekKey: string): Promise<WeekFile | null> {
  return fetchJson<WeekFile>(`puzzles/${weekKey}.json`)
}
