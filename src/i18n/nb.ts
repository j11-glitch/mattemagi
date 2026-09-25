// All text the children see, in Norwegian Bokmål. Emoji live here too.

export const nb = {
  appName: 'Mattemagi',
  tagline: 'Tre magiske mattegåter hver dag',

  loading: 'Tryller frem gåtene ...',
  loadError: 'Klarte ikke å hente gåtene. Sjekk nettet og prøv igjen.',
  retry: 'Prøv igjen',

  chooseChild: 'Hvem skal trylle i dag?',
  grade: (grade: number) => `${grade}. trinn`,
  statusReady: 'Klar for dagens gåter!',
  statusProgress: (done: number, total: number) => `${done} av ${total} gåter ferdig`,
  statusDone: 'Ferdig for i dag!',
  statusNone: 'Ingen gåter i dag',
  starsToday: (stars: number, max: number) => `${stars} av ${max} stjerner i dag`,

  back: 'Tilbake',
  puzzleOf: (index: number, total: number) => `Gåte ${index} av ${total}`,
  answerLabel: 'Ditt svar',
  answerPlaceholder: 'Skriv svaret her',
  check: 'Sjekk svaret',
  next: 'Neste gåte',
  seeResult: 'Se dagens stjerner',
  starsPossible: 'Stjerner du kan få',
  triesLeft: (tries: number) => (tries === 1 ? 'Siste forsøk!' : `${tries} forsøk igjen`),
  emptyAnswer: 'Skriv et svar først.',

  correct: (stars: number) =>
    stars === 3
      ? 'Magisk! Riktig på første forsøk!'
      : stars > 0
        ? `Riktig! Du fikk ${stars} ${stars === 1 ? 'stjerne' : 'stjerner'}.`
        : 'Riktig! Ingen stjerner denne gangen, men godt jobbet!',
  wrong: ['Nesten! Prøv igjen.', 'Ikke helt. Tenk en gang til!', 'Hmm, prøv en gang til!'],
  failed: (answer: string) => `Denne var vrien! Svaret er ${answer}.`,
  explanation: 'Slik kan du tenke',

  summaryTitle: 'Dagens magi er ferdig!',
  summaryStars: (stars: number, max: number) => `Du fikk ${stars} av ${max} stjerner`,
  summaryMessage: (stars: number, max: number) =>
    stars === max
      ? 'Full pott! Du er en ekte mattetrollmann!'
      : stars >= max * 0.66
        ? 'Kjempebra jobbet!'
        : stars >= max * 0.33
          ? 'Godt jobbet! Øvelse gjør mester.'
          : 'Bra at du prøvde! I morgen kommer nye gåter.',
  comeBack: 'Nye gåter kommer i morgen.',
  backToStart: 'Til forsiden',

  noPuzzlesTitle: 'Ingen gåter i dag',
  noPuzzlesText: 'Nye magiske gåter kommer snart. Kom tilbake i morgen!',

  thisWeek: 'Denne uka',
  weekdays: ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'],
  today: 'I dag',

  emoji: {
    wand: '🪄',
    sparkles: '✨',
    party: '🎉',
    crystal: '🔮',
    sleep: '🌙',
    thinking: '🤔',
    check: '✅',
    book: '📖',
  },
} as const
