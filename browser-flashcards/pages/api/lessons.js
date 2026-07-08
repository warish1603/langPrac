import { getLessonsFromExcel } from '../../lib/readExcel'
import { isValidLanguage } from '../../lib/languages'

export default function handler(req, res) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET'])
        return res.status(405).json({ error: `Method ${req.method} not allowed` })
    }

    const { lang } = req.query

    if (!lang || !isValidLanguage(lang)) {
        return res.status(400).json({ error: `Missing or unknown language: ${lang}` })
    }

    try {
        const lessons = getLessonsFromExcel(lang)
        return res.status(200).json({ lessons })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: error.message })
    }
}
