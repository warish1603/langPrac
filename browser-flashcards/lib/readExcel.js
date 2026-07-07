import XLSX from 'xlsx'
import fs from 'fs'

/**
 * Expected Excel format:
 *   - One sheet per lesson/group. The sheet name becomes the lesson title
 *     (e.g. "Numbers 0-100", "Greetings", "Family").
 *   - Each sheet needs a header row with at least: Word | Translation
 *     An optional "Language" column can override the default target
 *     language per row (otherwise DEFAULT_TARGET_LANGUAGE from .env.local
 *     is used for the whole sheet).
 *
 * Example sheet "Greetings":
 *   Word     | Translation | Language
 *   Hello    | Jambo       | Swahili
 *   Thank you| Asante      | Swahili
 */

const REQUIRED_COLUMNS = ['word', 'translation']

const normalizeHeader = (key) => key.trim().toLowerCase()

const rowToCard = (row, defaultLanguage) => {
    const normalized = {}
    Object.keys(row).forEach((key) => {
        normalized[normalizeHeader(key)] = row[key]
    })

    if (!normalized.word || !normalized.translation) return null

    return {
        word: String(normalized.word).trim(),
        translation: String(normalized.translation).trim(),
        language: normalized.language ? String(normalized.language).trim() : defaultLanguage
    }
}

export const getLessonsFromExcel = () => {
    const filePath = process.env.EXCEL_FILE_PATH
    const defaultLanguage = process.env.DEFAULT_TARGET_LANGUAGE || 'Target language'

    if (!filePath) {
        throw new Error('EXCEL_FILE_PATH is not set. Add it to .env.local (see .env.local.example).')
    }

    if (!fs.existsSync(filePath)) {
        throw new Error(`No file found at EXCEL_FILE_PATH: ${filePath}`)
    }

    const workbook = XLSX.readFile(filePath)

    const lessons = workbook.SheetNames.map((sheetName) => {
        const sheet = workbook.Sheets[sheetName]
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' })

        const cards = rows
            .map((row) => rowToCard(row, defaultLanguage))
            .filter(Boolean)
            .map((card, i) => ({ id: i + 1, ...card }))

        return {
            title: sheetName,
            source: 'excel',
            cardCount: cards.length,
            cards
        }
    }).filter((lesson) => lesson.cardCount > 0)

    return lessons
}
