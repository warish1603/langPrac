// Simple file-backed notes store. No database yet, so each note is just a
// markdown (.md) file on disk under data/notes/<language-slug>/<id>.md.
// The file's first line is used as the title (`# My title`), everything
// after the first blank line is the body.

import fs from 'fs'
import path from 'path'
import { getLanguage, isValidLanguage } from './languages'

const NOTES_ROOT = path.join(process.cwd(), 'data', 'notes')

// Only allow safe filename characters — prevents path traversal via a
// crafted id and keeps filenames readable.
const ID_PATTERN = /^[a-z0-9-]{1,80}$/

const slugify = (title) =>
    String(title || 'untitled')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 60) || 'untitled'

const notesDir = (langSlug) => {
    if (!isValidLanguage(langSlug)) throw new Error(`Unknown language: ${langSlug}`)
    const dir = path.join(NOTES_ROOT, langSlug)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    return dir
}

const filePathFor = (langSlug, id) => {
    if (!ID_PATTERN.test(id)) throw new Error('Invalid note id')
    return path.join(notesDir(langSlug), `${id}.md`)
}

const parseNoteFile = (raw) => {
    const lines = raw.replace(/\r\n/g, '\n').split('\n')
    let title = 'Untitled note'
    let bodyStartIndex = 0

    if (lines[0] && lines[0].trim().startsWith('#')) {
        title = lines[0].replace(/^#+\s*/, '').trim() || title
        bodyStartIndex = 1
        // skip a single blank line right after the title, if present
        if (lines[bodyStartIndex] !== undefined && lines[bodyStartIndex].trim() === '') {
            bodyStartIndex += 1
        }
    }

    const content = lines.slice(bodyStartIndex).join('\n')
    return { title, content }
}

const serializeNoteFile = (title, content) => {
    const safeTitle = (title || 'Untitled note').trim() || 'Untitled note'
    return `# ${safeTitle}\n\n${content || ''}`
}

export const listNotes = (langSlug) => {
    const dir = notesDir(langSlug)
    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md'))

    return files
        .map((file) => {
            const id = file.replace(/\.md$/, '')
            const fullPath = path.join(dir, file)
            const stat = fs.statSync(fullPath)
            const raw = fs.readFileSync(fullPath, 'utf-8')
            const { title, content } = parseNoteFile(raw)
            const preview = content.trim().split('\n')[0]?.slice(0, 140) || ''

            return {
                id,
                title,
                preview,
                updatedAt: stat.mtime.toISOString()
            }
        })
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
}

export const readNote = (langSlug, id) => {
    const fullPath = filePathFor(langSlug, id)
    if (!fs.existsSync(fullPath)) return null

    const raw = fs.readFileSync(fullPath, 'utf-8')
    const stat = fs.statSync(fullPath)
    const { title, content } = parseNoteFile(raw)

    return { id, title, content, updatedAt: stat.mtime.toISOString() }
}

// Creates a new note (when id is omitted) or overwrites an existing one.
export const saveNote = (langSlug, { id, title, content }) => {
    let finalId = id

    if (!finalId) {
        const base = slugify(title)
        let candidate = base
        let suffix = 1
        while (fs.existsSync(filePathFor(langSlug, candidate))) {
            candidate = `${base}-${suffix}`
            suffix += 1
        }
        finalId = candidate
    }

    const fullPath = filePathFor(langSlug, finalId)
    fs.writeFileSync(fullPath, serializeNoteFile(title, content), 'utf-8')

    return readNote(langSlug, finalId)
}

export const deleteNote = (langSlug, id) => {
    const fullPath = filePathFor(langSlug, id)
    if (!fs.existsSync(fullPath)) return false
    fs.unlinkSync(fullPath)
    return true
}
