import { MAX_STARS } from '../domain/scoring'

interface StarsProps {
  filled: number
  total?: number
  size?: 'sm' | 'md' | 'lg'
  label?: string
}

const STAR_PATH = 'M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z'

export function Stars({ filled, total = MAX_STARS, size = 'md', label }: StarsProps) {
  return (
    <span className={`stars stars--${size}`} role="img" aria-label={label ?? `${filled} / ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <svg key={i} viewBox="0 0 24 24" className={i < filled ? 'star star--on' : 'star'} aria-hidden="true">
          <path d={STAR_PATH} />
        </svg>
      ))}
    </span>
  )
}
