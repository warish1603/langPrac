import { getNumberWordsGenerator } from './numberWords'

export const GENERATOR_TYPES = {
    NUMBER_RANGE: 'number_range'
}

export const GENERATOR_LABELS = {
    [GENERATOR_TYPES.NUMBER_RANGE]: 'Random number in a range'
}

// Given a saved generator lesson ({ type, config }), produce one quiz question.
// Returns { prompt, promptDescription, targetLanguage, expectedTranslation? }.
// expectedTranslation is only set when we have a local, rule-based number
// generator for that language (no external call needed / most reliable).
// Otherwise it's left undefined and the API route falls back to a
// best-effort machine translation, with a caveat in the feedback.
export const generateQuestion = (lesson) => {
    const { type, config } = lesson

    if (type === GENERATOR_TYPES.NUMBER_RANGE) {
        const { min, max, targetLanguage } = config
        const lo = Math.min(Number(min), Number(max))
        const hi = Math.max(Number(min), Number(max))
        const value = Math.floor(Math.random() * (hi - lo + 1)) + lo

        const wordsGenerator = getNumberWordsGenerator(targetLanguage)
        const expectedTranslation = wordsGenerator ? wordsGenerator(value) : undefined

        return {
            prompt: String(value),
            promptDescription: `Say the number ${value} in ${targetLanguage}`,
            targetLanguage,
            expectedTranslation
        }
    }

    throw new Error(`Unknown generator type: ${type}`)
}
