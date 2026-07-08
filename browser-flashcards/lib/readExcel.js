import XLSX from 'xlsx'
import fs from 'fs'
import path from 'path'
import { getLanguage, isValidLanguage } from './languages'

/**
 * Expected Excel format (per language):
 *   - One sheet per lesson/group. The sheet name becomes the lesson title
 *     (e.g. "Numbers 0-100", "Greetings", "Family").
 *   - Each sheet needs a header row with at least: Word | Translation
 *     An optional "Language" column can override the default target
 *     language per row (otherwise the language's own name is used, e.g.
 *     "Kikuyu" or "Xhosa").
 *
 * Where the file lives:
 *   - By default: data/excel/<lang-slug>.xlsx (e.g. data/excel/kikuyu.xlsx),
 *     bundled alongside the app code — just replace it with your own file.
 *   - Optional override via env var EXCEL_FILE_PATH_<SLUG> (e.g.
 *     EXCEL_FILE_PATH_KIKUYU=/absolute/path/to/your/words.xlsx) if you'd
 *     rather keep the workbook somewhere else on disk.
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

export const getExcelFilePath = (langSlug) => {
    const language = getLanguage(langSlug)
    if (!language) throw new Error(`Unknown language: ${langSlug}`)

    const envKey = `EXCEL_FILE_PATH_${langSlug.toUpperCase()}`
    const envPath = process.env[envKey]
    if (envPath) return envPath

    return path.join(process.cwd(), 'data', 'excel', language.excelFile)
}

export const getLessonsFromExcel = (langSlug) => {
    if (!isValidLanguage(langSlug)) {
        throw new Error(`Unknown language: ${langSlug}`)
    }

    const language = getLanguage(langSlug)
    const filePath = getExcelFilePath(langSlug)
    const defaultLanguage = language.label

    if (!fs.existsSync(filePath)) {
        throw new Error(
            `No word-list file found for ${language.label} at ${filePath}. ` +
            `Add an .xlsx file there (or set EXCEL_FILE_PATH_${langSlug.toUpperCase()} in .env.local).`
        )
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
            lang: langSlug,
            cardCount: cards.length,
            cards
        }
    }).filter((lesson) => lesson.cardCount > 0)

    return lessons
}

// Builds a simple { "english word": "translation" } lookup by flattening
// every card across every lesson sheet for a language. Used by the
// paste-a-word-list flow to auto-fill translations from the same Excel
// source used for lessons, instead of any external translation service.
export const getTranslationLookup = (langSlug) => {
    const lessons = getLessonsFromExcel(langSlug)
    const lookup = {}

    lessons.forEach((lesson) => {
        lesson.cards.forEach((card) => {
            const key = card.word.trim().toLowerCase()
            if (key && !(key in lookup)) {
                lookup[key] = card.translation
            }
        })
    })

    return lookup
}