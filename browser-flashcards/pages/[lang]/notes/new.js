import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Header from '../../../components/Header'
import Footer from '../../../components/Footer'
import { getLanguage, isValidLanguage } from '../../../lib/languages'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faFloppyDisk } from '@fortawesome/free-solid-svg-icons'

export default function NewNote({ lang }) {
    const router = useRouter()
    const language = getLanguage(lang)

    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState(null)

    const saveNote = async () => {
        setSaving(true)
        setError(null)
        try {
            const res = await fetch(`/api/notes?lang=${lang}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: title.trim() || 'Untitled note', content })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to save note')
            router.push(`/${lang}/notes/${encodeURIComponent(data.note.id)}`)
        } catch (err) {
            setError(err.message)
            setSaving(false)
        }
    }

    return (
        <div className="container m-auto px-4">
            <Header lang={lang} />

            <Link href={`/${lang}/notes`}>
                <a className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200 mt-2">
                    <FontAwesomeIcon icon={faArrowLeft} /> Back to notes
                </a>
            </Link>

            <div className="max-w-2xl mx-auto mt-6 flex flex-col gap-3">
                <input
                    className="text-3xl phone:text-2xl font-bold outline-none border-b border-transparent focus:border-gray-200 pb-2"
                    placeholder="Untitled note"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    autoFocus
                />
                <textarea
                    className="border rounded-lg p-3 min-h-[50vh] font-mono text-sm outline-none focus:ring-2 focus:ring-gray-300"
                    placeholder="Write your notes in markdown…"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                />

                {error && <p className="text-red-600 text-sm">{error}</p>}

                <div className="flex justify-end gap-2">
                    <Link href={`/${lang}/notes`}>
                        <a className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-800">Cancel</a>
                    </Link>
                    <button
                        onClick={saveNote}
                        disabled={saving}
                        className={`flex items-center gap-2 disabled:bg-slate-400 text-white font-semibold rounded-lg px-5 py-2.5 text-sm transition-colors duration-200 ${language.accent} ${language.accentHover}`}
                    >
                        <FontAwesomeIcon icon={faFloppyDisk} />
                        {saving ? 'Saving…' : 'Save note'}
                    </button>
                </div>
            </div>

            <Footer />
        </div>
    )
}

export async function getServerSideProps(ctx) {
    const { lang } = ctx.params
    if (!isValidLanguage(lang)) {
        return { notFound: true }
    }
    return { props: { lang } }
}