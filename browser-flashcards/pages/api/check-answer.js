import { matches } from '../../lib/textMatch'
import { getLanguageCode } from '../../lib/languageCodes'
import { translateFree } from '../../lib/freeTranslate'

// Grades a quiz answer with zero paid API calls:
//   1. Exact-ish local match (accent/case/punctuation-insensitive) against
//      a known-correct answer, if we have one. Free, instant.
//   2. If that fails and we have a target-language code, ask the free
//      Google Translate endpoint for its translation and check that too
//      (catches valid rewordings the local match would miss).
//   3. If we still don't have anything to check against, say so honestly
//      rather than guessing.

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST'])
        return res.status(405).json({ error: `Method ${req.method} not allowed` })
    }

    const { prompt, targetLanguage, userAnswer, expectedTranslation } = req.body || {}

    if (!prompt || !targetLanguage || typeof userAnswer !== 'string') {
        return res.status(400).json({ error: 'Missing required fields: prompt, targetLanguage, userAnswer' })
    }

    try {
        // 1. Local match against a known-correct answer (from Excel, or from
        // a local number-words generator).
        if (expectedTranslation && matches(userAnswer, expectedTranslation)) {
            return res.status(200).json({
                correct: true,
                correctAnswer: expectedTranslation,
                feedback: 'Correct!'
            })
        }

        // 2. Free machine-translation fallback.
        const langCode = getLanguageCode(targetLanguage)
        if (langCode) {
            try {
                const machineTranslation = await translateFree(prompt, 'en', langCode)
                if (matches(userAnswer, machineTranslation)) {
                    return res.status(200).json({
                        correct: true,
                        correctAnswer: expectedTranslation || machineTranslation,
                        feedback: 'Correct! (matched via machine translation)'
                    })
                }

                return res.status(200).json({
                    correct: false,
                    correctAnswer: expectedTranslation || machineTranslation,
                    feedback: expectedTranslation
                        ? `Not quite — the reference answer was "${expectedTranslation}".`
                        : `Machine translation suggests "${machineTranslation}" — automatic translation of generated content (like numbers) can be unreliable, so double-check this one.`
                })
            } catch (translateError) {
                console.error('Free translation lookup failed:', translateError)
                // fall through to answering with whatever we already know
            }
        }

        if (expectedTranslation) {
            return res.status(200).json({
                correct: false,
                correctAnswer: expectedTranslation,
                feedback: `Not quite — the reference answer was "${expectedTranslation}".`
            })
        }

        return res.status(200).json({
            correct: null,
            correctAnswer: null,
            feedback: "Couldn't verify this one automatically (no reference answer and the translation lookup failed) — use your own judgment."
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: error.message })
    }
}
