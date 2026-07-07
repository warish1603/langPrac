// Normalizes text for comparison: lowercase, trim, strip accents/diacritics,
// collapse whitespace, drop punctuation. This alone handles the vast
// majority of "technically correct but not byte-identical" answers
// (missing accents, extra spaces, a trailing period) without needing any
// external call at all.
export const normalize = (text) =>
    String(text)
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // strip diacritics
        .toLowerCase()
        .replace(/[.,!?;:'"()]/g, '')
        .replace(/\s+/g, ' ')
        .trim()

export const matches = (a, b) => normalize(a) === normalize(b)
