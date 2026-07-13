import { isValidLanguage } from '../../lib/languages'
import { listNotes, readNote, saveNote, deleteNote } from '../../lib/notes'

export default function handler(req, res) {
    const { lang, id } = req.query

    if (!lang || !isValidLanguage(lang)) {
        return res.status(400).json({ error: `Missing or unknown language: ${lang}` })
    }

    try {
        if (req.method === 'GET') {
            if (id) {
                const note = readNote(lang, id)
                if (!note) return res.status(404).json({ error: 'Note not found' })
                return res.status(200).json({ note })
            }
            return res.status(200).json({ notes: listNotes(lang) })
        }

        if (req.method === 'POST') {
            const { title, content, id: bodyId } = req.body || {}
            if (!title || !title.trim()) {
                return res.status(400).json({ error: 'Title is required' })
            }
            const note = saveNote(lang, { id: bodyId, title, content })
            return res.status(200).json({ note })
        }

        if (req.method === 'DELETE') {
            if (!id) return res.status(400).json({ error: 'Missing note id' })
            const deleted = deleteNote(lang, id)
            if (!deleted) return res.status(404).json({ error: 'Note not found' })
            return res.status(200).json({ deleted: true })
        }

        res.setHeader('Allow', ['GET', 'POST', 'DELETE'])
        return res.status(405).json({ error: `Method ${req.method} not allowed` })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: error.message })
    }
}
