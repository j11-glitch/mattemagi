import { describe, expect, it } from 'vitest'
import { isoWeekKey, localDateKey, parseDateKey, weekDateKeys } from './dates'

describe('dates', () => {
  it('formats local dates', () => {
    expect(localDateKey(new Date(2026, 8, 5))).toBe('2026-09-05')
  })

  it('parses valid date keys and rejects invalid ones', () => {
    expect(parseDateKey('2026-09-25')?.getDate()).toBe(25)
    expect(parseDateKey('2026-02-30')).toBeNull()
    expect(parseDateKey('25.09.2026')).toBeNull()
  })

  it.each([
    ['2026-09-25', '2026-W39'],
    ['2026-09-21', '2026-W39'],
    ['2026-09-27', '2026-W39'],
    ['2026-09-28', '2026-W40'],
    ['2026-01-01', '2026-W01'], // Thursday
    ['2027-01-01', '2026-W53'], // Friday belongs to the last week of 2026
    ['2024-12-30', '2025-W01'], // Monday belongs to 2025
  ])('%s is in ISO week %s', (date, week) => {
    expect(isoWeekKey(parseDateKey(date)!)).toBe(week)
  })

  it('lists Monday to Sunday of the week', () => {
    expect(weekDateKeys(new Date(2026, 8, 25))).toEqual([
      '2026-09-21',
      '2026-09-22',
      '2026-09-23',
      '2026-09-24',
      '2026-09-25',
      '2026-09-26',
      '2026-09-27',
    ])
  })
})
