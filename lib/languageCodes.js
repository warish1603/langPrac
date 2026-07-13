// Maps common language names (as you'd type them in Excel or the "Target
// language" field) to ISO 639-1 codes, for the free translation fallback.
// Add more as you need them; if a language isn't here, just put its ISO
// code directly in the Language column/field instead (e.g. "sw").
const LANGUAGE_CODES = {
    swahili: 'sw',
    english: 'en',
    xhosa: 'xh',
    kikuyu: 'kik',
}

export const getLanguageCode = (languageName) => {
    if (!languageName) return null
    const trimmed = languageName.trim()
    const byName = LANGUAGE_CODES[trimmed.toLowerCase()]
    if (byName) return byName

    // Already looks like an ISO code (e.g. "sw", "zh-CN") — use as-is.
    if (/^[a-z]{2,3}(-[a-z]{2,4})?$/i.test(trimmed)) return trimmed

    return null
}
