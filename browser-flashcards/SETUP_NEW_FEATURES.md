# Multi-language sections (Kikuyu + Xhosa), notes, and mobile layout

## What changed in this version

1. **Two full language sections, same app** — Kikuyu and Xhosa each get an
   identical set of pages, generated from one shared codebase:
   - `/kikuyu` and `/xhosa` — language home (paste a word list/paragraph to
     auto-generate a flashcard deck, plus quick links to the 3 sections below)
   - `/kikuyu/lessons` and `/xhosa/lessons` — one lesson card per sheet in
     that language's Excel file, plus any custom quizzes you add
   - `/kikuyu/collection` and `/xhosa/collection` — saved flashcard decks,
     kept separate per language
   - `/kikuyu/notes` and `/xhosa/notes` — new: a notes page per language

   Adding a third language later means adding one entry to
   `lib/languages.js` and dropping in an Excel file — no other code changes.

2. **Notes, saved as markdown files** — since there's no database yet,
   notes are stored as plain `.md` files on disk:
   `data/notes/<language>/<note-id>.md`. Each file is just
   `# Title` followed by your markdown content, so you can also open/edit
   them directly in any text editor if you want. The API is in
   `pages/api/notes.js` / `lib/notes.js`.

3. **Per-language Excel files** — instead of one global `EXCEL_FILE_PATH`,
   each language now has its own file:
   - `data/excel/kikuyu.xlsx`
   - `data/excel/xhosa.xlsx`
   Just replace these files with your own workbook (same sheet-per-lesson
   format as before — see below) — no restart needed, `/api/lessons` reads
   the file fresh on every request. If you'd rather keep the file
   somewhere else on disk, set `EXCEL_FILE_PATH_KIKUYU` /
   `EXCEL_FILE_PATH_XHOSA` in `.env.local`.

4. **Mobile layout fixes** — the `container` class was previously clamping
   to a fixed 300px width on every phone screen (an artifact of reusing
   the `phone: 300px` breakpoint for the container's max-width too), which
   squeezed all page content into a narrow column. This is fixed in
   `tailwind.config.js` (container now stays fluid until tablet width), a
   proper `<meta name="viewport">` tag was added in `pages/_document.js`,
   and the paste-word-list input, quiz screen, notes editor, and header
   nav all got mobile-specific layout tweaks (stacking instead of
   squeezing, full-width buttons, wrapping nav).

## Excel file format (per language)

Unchanged from before — one sheet per lesson, header row with at least
`Word` and `Translation`, optional `Language` column:

| Word      | Translation | Language |
|-----------|-------------|----------|
| Hello     | Molo        | Xhosa    |
| Thank you | Enkosi      | Xhosa    |

## Adding a third language

1. Add an entry to `lib/languages.js` (slug, label, iso code, excel
   filename, accent colors).
2. Drop an Excel file at `data/excel/<slug>.xlsx`.
3. That's it — `/<slug>`, `/<slug>/lessons`, `/<slug>/collection`, and
   `/<slug>/notes` all work immediately, and it shows up in the language
   picker on the home page and in the header switcher.

## Notes

- Word-bank quizzes cap at 30 random questions per attempt
  (`MAX_WORDBANK_QUESTIONS` in `pages/[lang]/quiz.js`).
- Decks and custom quizzes are stored in the browser (IndexedDB via
  Dexie) and are scoped per language via a `lang` field.
- Notes are stored on the server's filesystem, so they're shared across
  browsers/devices as long as you're running the same server — but they
  are NOT synced anywhere else. Back up the `data/notes/` folder if you
  care about keeping them.
