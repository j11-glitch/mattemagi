import { MAX_STARS } from '../domain/scoring'
import { nb } from '../i18n/nb'

interface WeekStripProps {
  days: readonly string[]
  today: string
  starsOn: (date: string) => number | null
}

/** Monday to Sunday with the stars earned each day (null = nothing played). */
export function WeekStrip({ days, today, starsOn }: WeekStripProps) {
  return (
    <section className="week" aria-label={nb.thisWeek}>
      <h3 className="week__title">{nb.thisWeek}</h3>
      <ol className="week__days">
        {days.map((date, i) => {
          const stars = starsOn(date)
          return (
            <li key={date} className={`week__day${date === today ? ' week__day--today' : ''}`}>
              <span className="week__name">{date === today ? nb.today : nb.weekdays[i]}</span>
              <span className="week__stars">{stars === null ? '·' : stars}</span>
              {stars !== null && <span className="week__max">/{MAX_STARS * 3}</span>}
            </li>
          )
        })}
      </ol>
    </section>
  )
}
