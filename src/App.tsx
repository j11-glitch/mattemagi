import { useCallback, useEffect, useMemo, useState } from 'react'
import { ChildPicker } from './components/ChildPicker'
import { DaySummary } from './components/DaySummary'
import { PuzzleCard } from './components/PuzzleCard'
import { WeekStrip } from './components/WeekStrip'
import { fetchChildren, fetchWeek } from './data'
import { isoWeekKey, localDateKey, parseDateKey, weekDateKeys } from './domain/dates'
import { puzzlesFor, type Child, type Puzzle, type WeekFile } from './domain/puzzles'
import { currentPuzzleIndex, NEW_RESULT, totalStars, type PuzzleResult } from './domain/scoring'
import { nb } from './i18n/nb'
import { loadResults, saveResults, type ResultsStore } from './storage'

const ICON_URL = `${import.meta.env.BASE_URL}icon-192.png`

/** Today, or the date in ?date=YYYY-MM-DD (handy for previewing a coming day). */
function activeDate(): Date {
  const override = new URLSearchParams(window.location.search).get('date')
  return (override && parseDateKey(override)) || new Date()
}

type LoadState = { status: 'loading' } | { status: 'error' } | { status: 'ready'; kids: Child[]; week: WeekFile | null }

export default function App() {
  const [date] = useState(activeDate)
  const today = localDateKey(date)
  const [load, setLoad] = useState<LoadState>({ status: 'loading' })
  const [results, setResults] = useState<ResultsStore>(loadResults)
  const [childId, setChildId] = useState<string | null>(null)

  const loadData = useCallback(() => {
    setLoad({ status: 'loading' })
    Promise.all([fetchChildren(), fetchWeek(isoWeekKey(date))])
      .then(([kids, week]) => setLoad({ status: 'ready', kids, week }))
      .catch(() => setLoad({ status: 'error' }))
  }, [date])

  useEffect(loadData, [loadData])
  useEffect(() => saveResults(results), [results])

  const week = load.status === 'ready' ? load.week : null
  const resultsFor = useCallback(
    (id: string, day = today): PuzzleResult[] => results[id]?.[day] ?? [],
    [results, today],
  )

  const updateResult = useCallback(
    (id: string, index: number, result: PuzzleResult) => {
      setResults((store) => {
        const day = [...(store[id]?.[today] ?? [])]
        while (day.length < index) day.push(NEW_RESULT)
        day[index] = result
        return { ...store, [id]: { ...store[id], [today]: day } }
      })
    },
    [today],
  )

  const child = load.status === 'ready' ? load.kids.find((k) => k.id === childId) : undefined

  return (
    <div className="app">
      <div className="sky" aria-hidden="true" />
      <header className="header">
        <img className="header__logo" src={ICON_URL} alt="" width={64} height={64} />
        <div>
          <h1>{nb.appName}</h1>
          <p className="header__tagline">
            {nb.emoji.sparkles} {nb.tagline}
          </p>
        </div>
        {child && (
          <button type="button" className="button button--ghost header__back" onClick={() => setChildId(null)}>
            {'←'} {nb.back}
          </button>
        )}
      </header>

      <main className="main">
        {load.status === 'loading' && (
          <p className="panel panel--center">
            {nb.emoji.crystal} {nb.loading}
          </p>
        )}
        {load.status === 'error' && (
          <div className="panel panel--center" role="alert">
            <p>{nb.loadError}</p>
            <button type="button" className="button button--primary" onClick={loadData}>
              {nb.retry}
            </button>
          </div>
        )}
        {load.status === 'ready' && !child && (
          <ChildPicker
            kids={load.kids}
            puzzleCount={(id) => puzzlesFor(week, today, id).length}
            resultsFor={(id) => resultsFor(id)}
            onPick={setChildId}
          />
        )}
        {load.status === 'ready' && child && (
          <ChildDay
            key={child.id}
            child={child}
            puzzles={puzzlesFor(week, today, child.id)}
            results={resultsFor(child.id)}
            weekDays={weekDateKeys(date)}
            today={today}
            starsOn={(day) => {
              const dayResults = resultsFor(child.id, day)
              return dayResults.length ? totalStars(dayResults) : null
            }}
            onResult={(index, result) => updateResult(child.id, index, result)}
            onDone={() => setChildId(null)}
          />
        )}
      </main>
    </div>
  )
}

interface ChildDayProps {
  child: Child
  puzzles: readonly Puzzle[]
  results: readonly PuzzleResult[]
  weekDays: readonly string[]
  today: string
  starsOn: (date: string) => number | null
  onResult: (index: number, result: PuzzleResult) => void
  onDone: () => void
}

/** Today's puzzles for one child, one at a time, then the summary. */
function ChildDay({ child, puzzles, results, weekDays, today, starsOn, onResult, onDone }: ChildDayProps) {
  // Stay on a finished puzzle until "next" is pressed, so its feedback can be read.
  const [viewIndex, setViewIndex] = useState(() => currentPuzzleIndex(results, puzzles.length))
  const dayResults = useMemo(() => puzzles.map((_, i) => results[i] ?? NEW_RESULT), [puzzles, results])

  if (puzzles.length === 0) {
    return (
      <div className="panel panel--center">
        <p className="panel__icon" aria-hidden="true">
          {nb.emoji.sleep}
        </p>
        <h2>{nb.noPuzzlesTitle}</h2>
        <p>{nb.noPuzzlesText}</p>
      </div>
    )
  }

  const done = viewIndex >= puzzles.length

  return (
    <div className="child-day">
      <div className="child-day__who">
        <span className="child-day__avatar" aria-hidden="true">
          {child.avatar}
        </span>
        <span className="child-day__name">{child.name}</span>
        <ol className="progress-dots" aria-hidden="true">
          {dayResults.map((r, i) => (
            <li
              key={i}
              className={`progress-dots__dot progress-dots__dot--${r.status}${i === viewIndex ? ' progress-dots__dot--current' : ''}`}
            />
          ))}
        </ol>
      </div>

      {done ? (
        <DaySummary name={child.name} results={dayResults} onDone={onDone} />
      ) : (
        <PuzzleCard
          key={viewIndex}
          puzzle={puzzles[viewIndex]}
          index={viewIndex}
          total={puzzles.length}
          result={dayResults[viewIndex]}
          isLast={viewIndex === puzzles.length - 1}
          onResult={(result) => onResult(viewIndex, result)}
          onNext={() => setViewIndex(currentPuzzleIndex(dayResults, puzzles.length))}
        />
      )}

      <WeekStrip days={weekDays} today={today} starsOn={starsOn} />
    </div>
  )
}
