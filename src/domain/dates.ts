/** Local calendar date as "YYYY-MM-DD" (the child's day, not UTC). */
export function localDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Parses "YYYY-MM-DD" as a local date, or returns null when invalid. */
export function parseDateKey(key: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key)
  if (!match) return null
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  return localDateKey(date) === key ? date : null
}

/** ISO 8601 week key such as "2026-W39" (weeks start on Monday; week 1 contains a Thursday). */
export function isoWeekKey(date: Date): string {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const weekday = (d.getDay() + 6) % 7 // Monday = 0
  d.setDate(d.getDate() - weekday + 3) // Thursday of this week decides the week-year
  const weekYear = d.getFullYear()
  const firstThursday = new Date(weekYear, 0, 4)
  firstThursday.setDate(firstThursday.getDate() - ((firstThursday.getDay() + 6) % 7) + 3)
  const week = 1 + Math.round((d.getTime() - firstThursday.getTime()) / (7 * 24 * 3600 * 1000))
  return `${weekYear}-W${String(week).padStart(2, '0')}`
}

/** The seven date keys (Monday to Sunday) of the ISO week containing `date`. */
export function weekDateKeys(date: Date): string[] {
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7))
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(monday)
    day.setDate(monday.getDate() + i)
    return localDateKey(day)
  })
}
