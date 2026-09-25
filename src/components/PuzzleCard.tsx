import { useEffect, useRef, useState, type FormEvent } from 'react'
import type { Puzzle } from '../domain/puzzles'
import { attemptsLeft, MAX_STARS, starsStillPossible, submitAnswer, type PuzzleResult } from '../domain/scoring'
import { nb } from '../i18n/nb'
import { Stars } from './Stars'

interface PuzzleCardProps {
  puzzle: Puzzle
  index: number
  total: number
  result: PuzzleResult
  isLast: boolean
  onResult: (result: PuzzleResult) => void
  onNext: () => void
}

type Feedback = { kind: 'correct' | 'wrong' | 'failed' | 'hint'; text: string; id: number }

/** One puzzle: answer, feedback, stars. Remount (key) per puzzle to reset local state. */
export function PuzzleCard({ puzzle, index, total, result, isLast, onResult, onNext }: PuzzleCardProps) {
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const nextRef = useRef<HTMLButtonElement>(null)
  const closed = result.status !== 'open'

  useEffect(() => {
    if (closed) nextRef.current?.focus()
    else inputRef.current?.focus()
  }, [closed])

  function show(kind: Feedback['kind'], text: string) {
    setFeedback((previous) => ({ kind, text, id: (previous?.id ?? 0) + 1 }))
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const { result: next, outcome } = submitAnswer(result, puzzle, input)
    switch (outcome) {
      case 'empty':
        show('hint', nb.emptyAnswer)
        return
      case 'correct':
        show('correct', nb.correct(next.stars))
        break
      case 'wrong':
        show('wrong', nb.wrong[next.attempts % nb.wrong.length])
        setInput('')
        break
      case 'failed':
        show('failed', nb.failed(`${puzzle.answer}${puzzle.unit ? ` ${puzzle.unit}` : ''}`))
        break
      case 'closed':
        return
    }
    onResult(next)
  }

  const tries = attemptsLeft(result)

  return (
    <article className="puzzle-card" aria-labelledby="puzzle-question">
      <header className="puzzle-card__header">
        <span className="puzzle-card__count">{nb.puzzleOf(index + 1, total)}</span>
        <span className="puzzle-card__possible" title={nb.starsPossible}>
          <Stars filled={starsStillPossible(result)} total={MAX_STARS} size="sm" label={nb.starsPossible} />
        </span>
      </header>

      <p id="puzzle-question" className="puzzle-card__question">
        {puzzle.question}
      </p>

      {!closed && (
        <form className="answer" onSubmit={handleSubmit}>
          <label htmlFor="answer" className="sr-only">
            {nb.answerLabel}
          </label>
          <div className="answer__field">
            <input
              id="answer"
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              inputMode={puzzle.input === 'text' ? 'text' : 'decimal'}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              placeholder={nb.answerPlaceholder}
              aria-describedby="answer-feedback"
            />
            {puzzle.unit && <span className="answer__unit">{puzzle.unit}</span>}
          </div>
          <button type="submit" className="button button--primary">
            {nb.emoji.wand} {nb.check}
          </button>
          <p className="answer__tries">{nb.triesLeft(tries)}</p>
        </form>
      )}

      <div id="answer-feedback" aria-live="polite">
        {feedback && (
          <p key={feedback.id} className={`feedback feedback--${feedback.kind}`}>
            {feedback.kind === 'correct' && <Stars filled={result.stars} size="md" />}
            <span>{feedback.text}</span>
          </p>
        )}
      </div>

      {closed && puzzle.explanation && (
        <div className="explanation">
          <h3>
            {nb.emoji.book} {nb.explanation}
          </h3>
          <p>{puzzle.explanation}</p>
        </div>
      )}

      {closed && (
        <button ref={nextRef} type="button" className="button button--primary puzzle-card__next" onClick={onNext}>
          {isLast ? `${nb.emoji.sparkles} ${nb.seeResult}` : `${nb.next} →`}
        </button>
      )}
    </article>
  )
}
