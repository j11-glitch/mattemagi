# Mattemagi

*Tre magiske mattegåter hver dag* (three magic math puzzles a day).

A small web app with daily math puzzles for children. Every day each child gets three
puzzles in a row, types the answers, and earns stars. The app itself speaks Norwegian;
code and documentation are in English.

## Getting started

Requires Node.js 20+.

```bash
npm install
npm run dev
```

| Script          | What it does                                  |
| --------------- | --------------------------------------------- |
| `npm run dev`   | Start the dev server                          |
| `npm run build` | Type-check and build for production (`dist/`) |
| `npm test`      | Run the tests (including all puzzle files)    |

## How it works

1. The start page shows one card per child (from `public/children.json`) with today's
   status and stars.
2. A child taps their card and gets today's three puzzles, one at a time.
3. Stars per puzzle:

   | Result                      | Stars                                                   |
   | --------------------------- | ------------------------------------------------------- |
   | Correct on the 1st try      | 3                                                       |
   | Correct on the 2nd try      | 2                                                       |
   | Correct on the 3rd try      | 1                                                       |
   | Correct on the 4th try      | 0 (solved, no stars)                                    |
   | 4 wrong answers             | Failed, 0 stars; the answer and explanation are shown   |

   The limits are `MAX_ATTEMPTS` and `starsForAttempt` in `src/domain/scoring.ts`.

4. After the third puzzle the child sees the day's stars (out of 9) and a week overview.

Answers are forgiving: spaces and upper/lower case are ignored, `20,25` and `20.25` are the
same, `17` and `17 kr` both match a puzzle with unit `kr`, and `07` equals `7`.

Results are stored in the browser on the device (`localStorage`), per child and day.
A child cannot replay a finished day for more stars.

## Adding puzzles (every week)

Puzzles live in `public/puzzles/`, one file per ISO week, named like `2026-W40.json`
(weeks start on Monday). Add or edit the file directly on GitHub; the site redeploys by itself.

```json
{
  "week": "2026-W40",
  "days": {
    "2026-09-28": {
      "simo": [
        { "question": "Hva er 6 · 9?", "answer": 54 },
        { "question": "Hvor mange kroner er 3 tiere og 4 kroner?", "answer": 34, "unit": "kr" },
        { "question": "Hva er 3/4 som desimaltall?", "answer": "0,75", "accept": ["3/4"] }
      ],
      "aurora": [
        { "question": "...", "answer": 12, "explanation": "Shown after the puzzle is solved or failed." },
        { "question": "...", "answer": "tolv", "input": "text" },
        { "question": "...", "answer": 8 }
      ]
    }
  }
}
```

| Field         | Required | Meaning                                                         |
| ------------- | -------- | --------------------------------------------------------------- |
| `question`    | yes      | The puzzle text                                                 |
| `answer`      | yes      | The correct answer (number or text)                             |
| `accept`      | no       | Other answers that also count as correct                        |
| `unit`        | no       | Shown next to the input (`kr`, `cm`, `min` ...)                 |
| `explanation` | no       | Shown after the puzzle is finished                              |
| `input`       | no       | `"text"` for a normal keyboard; the default is the number pad   |

Rules, checked by `npm test` (and therefore before every deploy):

- the file name matches `"week"`, and every date belongs to that week;
- each child id exists in `public/children.json`;
- each child has exactly 3 puzzles per day, each with a question and an answer.

If a day has no puzzles, the children see a friendly "no puzzles today" message.
To preview a coming day, open the site with `?date=2026-09-28`.

## Children

`public/children.json` lists the children. The `id` is what the puzzle files use.

```json
[
  { "id": "simo", "name": "Simo", "grade": 4, "avatar": "🧙‍♂️" },
  { "id": "aurora", "name": "Aurora", "grade": 6, "avatar": "🧙‍♀️" }
]
```

A GitHub Pages site is public, including these names.

## App icon

`assets/icon-source.webp` is the artwork. `python3 scripts/generate-icons.py` (needs Pillow)
writes the home-screen icons and the favicon into `public/`.

## Project structure

```text
public/
  children.json           Children shown on the start page
  puzzles/<week>.json     Weekly puzzle files
src/
  domain/                 Pure logic, unit-tested
    dates.ts              Local dates and ISO weeks
    puzzles.ts            Puzzle types, answer checking, file validation
    scoring.ts            Tries, stars, day progress
  i18n/nb.ts              All Norwegian UI text (and emoji)
  components/             ChildPicker, PuzzleCard, DaySummary, WeekStrip, Stars
  data.ts                 Loads the children and the current week
  storage.ts              Results in localStorage
  App.tsx                 Screens and state
```

## Deployment

Every push to `main` runs the tests, builds the app and publishes it to GitHub Pages via
`.github/workflows/deploy.yml`.
