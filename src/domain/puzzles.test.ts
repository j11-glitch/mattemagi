import { describe, expect, it } from 'vitest'
import { isCorrectAnswer, normalizeAnswer, puzzlesFor, validateWeekFile, type Child, type WeekFile } from './puzzles'

describe('answers', () => {
  it('normalizes spaces, case, decimal comma and unit', () => {
    expect(normalizeAnswer(' 20,25 ')).toBe('20.25')
    expect(normalizeAnswer('17 KR', 'kr')).toBe('17')
    expect(normalizeAnswer('1 000')).toBe('1000')
  })

  it('accepts numbers written in different ways', () => {
    const puzzle = { question: 'q', answer: '20,25' }
    expect(isCorrectAnswer(puzzle, '20,25')).toBe(true)
    expect(isCorrectAnswer(puzzle, '20.25')).toBe(true)
    expect(isCorrectAnswer(puzzle, '20,250')).toBe(true)
    expect(isCorrectAnswer(puzzle, '20,2')).toBe(false)
  })

  it('accepts the answer with or without the unit', () => {
    const puzzle = { question: 'q', answer: 17, unit: 'kr' }
    expect(isCorrectAnswer(puzzle, '17')).toBe(true)
    expect(isCorrectAnswer(puzzle, '17 kr')).toBe(true)
    expect(isCorrectAnswer(puzzle, '18 kr')).toBe(false)
  })

  it('supports alternative answers and text answers', () => {
    expect(isCorrectAnswer({ question: 'q', answer: '3/4', accept: ['0,75'] }, '0.75')).toBe(true)
    expect(isCorrectAnswer({ question: 'q', answer: 'Tolv', input: 'text' }, ' tolv ')).toBe(true)
  })

  it('never accepts an empty answer', () => {
    expect(isCorrectAnswer({ question: 'q', answer: 0 }, '')).toBe(false)
    expect(isCorrectAnswer({ question: 'q', answer: 0 }, '0')).toBe(true)
  })
})

describe('week files', () => {
  const week: WeekFile = {
    week: '2026-W39',
    days: { '2026-09-25': { simo: [{ question: 'a', answer: 1 }, { question: 'b', answer: 2 }, { question: 'c', answer: 3 }] } },
  }

  it('returns the puzzles for a child and day', () => {
    expect(puzzlesFor(week, '2026-09-25', 'simo')).toHaveLength(3)
    expect(puzzlesFor(week, '2026-09-26', 'simo')).toEqual([])
    expect(puzzlesFor(null, '2026-09-25', 'simo')).toEqual([])
  })

  it('reports mistakes in a week file', () => {
    const broken: WeekFile = {
      week: '2026-W40',
      days: { '2026-9-25': { bob: [{ question: '', answer: '' }] } },
    }
    expect(validateWeekFile(broken, ['simo'], '2026-W39')).toEqual([
      'week is "2026-W40", expected "2026-W39"',
      '2026-9-25: date must be YYYY-MM-DD',
      '2026-9-25 bob: unknown child "bob"',
      '2026-9-25 bob: needs 3 puzzles, has 1',
      '2026-9-25 bob #1: missing question',
      '2026-9-25 bob #1: missing answer',
    ])
    expect(validateWeekFile(week, ['simo'], '2026-W39')).toEqual([])
  })
})

describe('published data', () => {
  const children = Object.values(
    import.meta.glob<Child[]>('../../public/children.json', { eager: true, import: 'default' }),
  )[0]
  const weeks = import.meta.glob<WeekFile>('../../public/puzzles/*.json', { eager: true, import: 'default' })

  it('has children with unique ids', () => {
    expect(children.length).toBeGreaterThan(0)
    expect(new Set(children.map((c) => c.id)).size).toBe(children.length)
  })

  it('has at least one week of puzzles', () => {
    expect(Object.keys(weeks).length).toBeGreaterThan(0)
  })

  it.each(Object.entries(weeks))('%s is valid', (path, week) => {
    const expectedWeek = path.split('/').pop()!.replace('.json', '')
    const errors = validateWeekFile(week, children.map((c) => c.id), expectedWeek)
    expect(errors).toEqual([])
  })

  it.each(Object.entries(weeks))('%s only has dates inside its week', async (path, week) => {
    const { isoWeekKey, parseDateKey } = await import('./dates')
    for (const date of Object.keys(week.days)) {
      expect(isoWeekKey(parseDateKey(date)!), `${path}: ${date}`).toBe(week.week)
    }
  })
})
