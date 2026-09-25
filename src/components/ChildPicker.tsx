import type { Child } from '../domain/puzzles'
import { PUZZLES_PER_DAY } from '../domain/puzzles'
import { MAX_STARS, totalStars, type PuzzleResult } from '../domain/scoring'
import { nb } from '../i18n/nb'
import { Stars } from './Stars'

interface ChildPickerProps {
  kids: readonly Child[]
  puzzleCount: (childId: string) => number
  resultsFor: (childId: string) => readonly PuzzleResult[]
  onPick: (childId: string) => void
}

export function ChildPicker({ kids, puzzleCount, resultsFor, onPick }: ChildPickerProps) {
  return (
    <section className="picker">
      <h2 className="picker__title">{nb.chooseChild}</h2>
      <div className="picker__cards">
        {kids.map((child, i) => {
          const count = puzzleCount(child.id)
          const results = resultsFor(child.id)
          const done = results.filter((r) => r.status !== 'open').length
          const stars = totalStars(results)
          const status =
            count === 0
              ? nb.statusNone
              : done >= count
                ? nb.statusDone
                : done > 0
                  ? nb.statusProgress(done, count)
                  : nb.statusReady
          return (
            <button key={child.id} type="button" className={`child-card child-card--${i % 4}`} onClick={() => onPick(child.id)}>
              <span className="child-card__avatar" aria-hidden="true">
                {child.avatar}
              </span>
              <span className="child-card__name">{child.name}</span>
              <span className="child-card__grade">{nb.grade(child.grade)}</span>
              {count > 0 && (
                <Stars
                  filled={Math.round((stars / (count * MAX_STARS)) * PUZZLES_PER_DAY)}
                  total={PUZZLES_PER_DAY}
                  size="sm"
                  label={nb.starsToday(stars, count * MAX_STARS)}
                />
              )}
              <span className="child-card__status">{status}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
