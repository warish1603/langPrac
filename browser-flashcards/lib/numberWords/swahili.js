// Swahili number-to-words, 0-10,000.
//
// Rules (verified against multiple Swahili grammar references):
//  - Digits 1-9: moja, mbili, tatu, nne, tano, sita, saba, nane, tisa
//  - Tens 10-90: kumi, ishirini, thelathini, arobaini, hamsini, sitini, sabini, themanini, tisini
//  - Hundreds: "mia" + digit word (mia moja = 100, mia mbili = 200, ...)
//  - Thousands: "elfu" + digit word (elfu moja = 1000, ...); elfu kumi = 10,000
//  - Components (thousands / hundreds / tens+units) are concatenated with a
//    plain space, EXCEPT exactly one "na" ("and") is inserted immediately
//    before the final non-zero component — but only if that final
//    component is a single term (a lone tens word or a lone units word).
//    If the final component is itself a tens+units pair (e.g. "sitini na
//    mbili"), the internal "na" already does that job and no extra "na"
//    is added before it.
//
// Examples this matches exactly:
//   108   -> mia moja na nane
//   1007  -> elfu moja na saba
//   3840  -> elfu tatu mia nane na arobaini
//   6587  -> elfu sita mia tano themanini na saba
//   9362  -> elfu tisa mia tatu sitini na mbili
//   1234  -> elfu moja mia mbili thelathini na nne

// A note on accuracy: Swahili numeral conventions have some documented
// variation between sources on exactly where "na" is repeated for large
// compound numbers (e.g. some sources write 656 as "mia sita na hamsini na
// sita", others imply just "mia sita hamsini na sita"). This function
// follows the rule stated explicitly in the source that spelled it out
// most clearly ("na" attaches only once, right before the final term) and
// matches that source's worked examples exactly. If your materials use a
// different convention, this is a single self-contained file — the
// assembly logic is at the bottom of numberToSwahiliWords.

const DIGIT_WORDS = ['', 'moja', 'mbili', 'tatu', 'nne', 'tano', 'sita', 'saba', 'nane', 'tisa']
const TENS_WORDS = ['', 'kumi', 'ishirini', 'thelathini', 'arobaini', 'hamsini', 'sitini', 'sabini', 'themanini', 'tisini']

export const numberToSwahiliWords = (n) => {
    n = Math.round(Number(n))

    if (n === 0) return 'sifuri'
    if (n === 10000) return 'elfu kumi'
    if (n < 0 || n > 9999) {
        throw new Error('Swahili number generator currently only supports 0-10,000')
    }

    const thousandsDigit = Math.floor(n / 1000)
    const hundredsDigit = Math.floor((n % 1000) / 100)
    const tensDigit = Math.floor((n % 100) / 10)
    const unitsDigit = n % 10

    const bigParts = []
    if (thousandsDigit > 0) bigParts.push(`elfu ${DIGIT_WORDS[thousandsDigit]}`)
    if (hundredsDigit > 0) bigParts.push(`mia ${DIGIT_WORDS[hundredsDigit]}`)

    let tail = null
    let tailIsCompound = false
    if (tensDigit > 0 && unitsDigit > 0) {
        tail = `${TENS_WORDS[tensDigit]} na ${DIGIT_WORDS[unitsDigit]}`
        tailIsCompound = true
    } else if (tensDigit > 0) {
        tail = TENS_WORDS[tensDigit]
    } else if (unitsDigit > 0) {
        tail = DIGIT_WORDS[unitsDigit]
    }

    if (tail === null) return bigParts.join(' ')

    if (bigParts.length === 0) return tail

    if (tailIsCompound) return [...bigParts, tail].join(' ')

    return [...bigParts, `na ${tail}`].join(' ')
}
