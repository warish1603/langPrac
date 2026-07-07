// Uses the free, unofficial Google Translate web endpoint — no API key,
// no cost. This is the same underlying engine that free translator sites
// (including the one you mentioned) run on top of.
//
// IMPORTANT: this is an undocumented endpoint, not an official API. It can
// rate-limit or change behavior without notice. If it ever stops working
// reliably, the drop-in replacement is Google Cloud's official Translation
// API (has a free monthly quota) — swap the implementation of
// translateFree() below and everything else keeps working unchanged.

export const translateFree = async (text, sourceLangCode, targetLangCode) => {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(sourceLangCode)}&tl=${encodeURIComponent(targetLangCode)}&dt=t&q=${encodeURIComponent(text)}`

    const res = await fetch(url)
    if (!res.ok) {
        throw new Error(`Free translation endpoint returned ${res.status}`)
    }

    const data = await res.json()
    // data[0] is an array of [translatedChunk, originalChunk, ...] segments
    const translated = (data[0] || []).map((segment) => segment[0]).join('')
    return translated
}
