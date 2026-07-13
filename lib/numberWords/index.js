import { numberToSwahiliWords } from './swahili'

// Add more languages here as you write generators for them.
// Key by lowercased language name (matches what's typed in the "Target
// language" field / Excel "Language" column).
const REGISTRY = {
    swahili: numberToSwahiliWords
}

export const getNumberWordsGenerator = (languageName) => {
    if (!languageName) return null
    return REGISTRY[languageName.trim().toLowerCase()] || null
}
