import { useMemo, type CSSProperties } from 'react'
import { MAX_STARS, totalStars, type PuzzleResult } from '../domain/scoring'
import { nb } from '../i18n/nb'
import { Stars } from './Stars'

interface DaySummaryProps {
  name: string
  results: readonly PuzzleResult[]
  onDone: () => void
}

export function DaySummary({ name, results, onDone }: DaySummaryProps) {
  const stars = totalStars(results)
  const max = results.length * MAX_STARS
  return (
    <section className="summary">
      {stars > 0 && <Confetti />}
      <p className="summary__kicker">
        {nb.emoji.party} {name}
      </p>
      <h2>{nb.summaryTitle}</h2>
      <p className="summary__total">
        <span className="summary__big">{stars}</span>
        <span className="summary__of">/ {max}</span>
      </p>
      <p className="summary__stars-label">{nb.summaryStars(stars, max)}</p>
      <ol className="summary__list">
        {results.map((result, i) => (
          <li key={i}>
            <span>{nb.puzzleOf(i + 1, results.length)}</span>
            <Stars filled={result.stars} size="sm" />
          </li>
        ))}
      </ol>
      <p className="summary__message">{nb.summaryMessage(stars, max)}</p>
      <p className="summary__come-back">
        {nb.emoji.sleep} {nb.comeBack}
      </p>
      <button type="button" className="button button--primary" onClick={onDone}>
        {nb.backToStart}
      </button>
    </section>
  )
}

const COLORS = ['#ffd84d', '#ff6fb5', '#6ee7ff', '#9b7bff', '#6cf2a4', '#ff9f43']

function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 70 }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.6,
        duration: 2.4 + Math.random() * 1.8,
        drift: (Math.random() - 0.5) * 160,
        spin: 360 + Math.random() * 720,
        size: 6 + Math.random() * 6,
        color: COLORS[i % COLORS.length],
      })),
    [],
  )
  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((p, i) => (
        <span
          key={i}
          style={
            {
              left: `${p.left}%`,
              width: p.size,
              height: p.size * (i % 3 === 0 ? 1 : 0.45),
              borderRadius: i % 3 === 0 ? '50%' : 2,
              background: p.color,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              '--drift': `${p.drift}px`,
              '--spin': `${p.spin}deg`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  )
}
