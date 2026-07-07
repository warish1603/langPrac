import { getLessonsFromExcel } from '../../lib/readExcel'

export default function handler(req, res) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET'])
        return res.status(405).json({ error: `Method ${req.method} not allowed` })
    }

    try {
        const lessons = getLessonsFromExcel()
        return res.status(200).json({ lessons })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: error.message })
    }
}
