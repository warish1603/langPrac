# New features: Excel word source + custom quizzes (no paid API)

## What changed

- **Word/translation source**: instead of the old random Japanese-word stub,
  the app reads real lessons from an Excel file on your machine via a
  server-side API route (`pages/api/lessons.js` + `lib/readExcel.js`).
- **Quiz mode**: `/lessons` lists every lesson (one per Excel sheet) plus
  any custom quizzes you create, and links to `/quiz` to run them.
- **Custom generator quizzes**: `/lessons/new` lets you define quizzes that
  aren't static word lists — currently: "random number in a range" (e.g.
  numbers 0–10,000 in Swahili). Saved locally in your browser (IndexedDB).
- **Answer checking — no paid API**: `pages/api/check-answer.js` checks
  answers in two free steps:
  1. **Local match** against a known-correct answer (accent/case/
     punctuation-insensitive) — instant, no network call.
  2. **Free translation fallback** (`lib/freeTranslate.js`) using the same
     free, unofficial Google Translate endpoint that free translator sites
     run on top of — no API key, no cost. Only used if step 1 doesn't
     match.
  3. **Swahili numbers are handled without translation at all** —
     `lib/numberWords/swahili.js` is a rule-based number-to-words function,
     so the number-range quiz never needs an external call.

I looked into using translatewatu.com directly: it doesn't have a public
API, it's a UI wrapper around Google's translation engine ("Powered by
Google Neural Machine Translation" per their own page). Scraping their
frontend would be fragile and likely against their terms, so instead this
hits the same underlying free engine directly.

## 1. Install the new dependency

```
npm install
```

(`xlsx` was added to `package.json` to read your Excel file. No other new
dependencies — no Anthropic SDK, no API key needed anymore.)

## 2. Set up your `.env.local`

```
cp .env.local.example .env.local
```

Then edit `.env.local`:

```
EXCEL_FILE_PATH=/absolute/path/to/your/words.xlsx
DEFAULT_TARGET_LANGUAGE=Swahili
```

That's the whole config — no API keys.

## 3. Format your Excel file

- **One sheet per lesson/group.** The sheet name becomes the lesson title
  (e.g. "Numbers 0-100", "Greetings", "Family").
- Each sheet needs a header row with at least `Word` and `Translation`
  columns. An optional `Language` column overrides `DEFAULT_TARGET_LANGUAGE`
  for that row.

Example sheet named "Greetings":

| Word      | Translation | Language |
|-----------|-------------|----------|
| Hello     | Jambo       | Swahili  |
| Thank you | Asante      | Swahili  |

## 4. Run it

```
npm run dev
```

Go to `/lessons` — you'll see a card for every sheet in your Excel file,
plus a "+ New custom quiz" button.

## 5. Numbers-style custom quiz

Click "+ New custom quiz", pick a title (e.g. "Swahili numbers 0-10,000"),
set min/max and target language "Swahili", and save. Every attempt
generates fresh random numbers in that range, converted to words locally
by `lib/numberWords/swahili.js` — no external call, no rate limits.

**A caveat on the Swahili number rules**: Swahili numeral conventions have
some documented variation between sources on exactly where "na" ("and")
repeats in large compound numbers. I implemented the rule stated most
explicitly in my research and verified it against several worked examples,
but it's worth sanity-checking a few outputs against your own knowledge.
The whole thing is one small, well-commented file if you want to adjust
the convention.

## Adding another language to the number-range quiz

Only Swahili has a local number generator right now. To add another
language:

1. Write a `numberToXWords(n)` function (see `lib/numberWords/swahili.js`
   as a template).
2. Register it in `lib/numberWords/index.js`.

Without a local generator, the number quiz falls back to the free
translation endpoint, which — as noted above — is not reliable for
spelling out arbitrary numbers, so the app will show a caveat in the
feedback when this happens.

## Adding another language to the free-translation fallback (word-bank lessons)

`lib/languageCodes.js` maps language names to ISO codes for the fallback
translation check. Add an entry there, or just type the ISO code directly
(e.g. "sw") in your Excel `Language` column / the quiz form.

## Notes

- Word-bank quizzes cap at 20 random questions per attempt
  (`MAX_WORDBANK_QUESTIONS` in `pages/quiz.js`).
- `/api/lessons` re-reads the Excel file on every request — edit your
  spreadsheet and refresh `/lessons`, no restart needed.
- If the free translation endpoint ever becomes unreliable (it's
  undocumented and can rate-limit), the drop-in replacement is Google
  Cloud's official Translation API, which has a free monthly quota — swap
  the implementation inside `lib/freeTranslate.js` and nothing else needs
  to change.
