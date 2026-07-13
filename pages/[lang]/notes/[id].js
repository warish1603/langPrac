import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Header from '../../../components/Header'
import Footer from '../../../components/Footer'
import { getLanguage, isValidLanguage } from '../../../lib/languages'
import { readNote } from '../../../lib/notes'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faFloppyDisk, faTrash } from '@fortawesome/free-solid-svg-icons'

export default function NoteDetail({ lang, id, initialNote, notFoundNote }) {
    const router = useRouter()
    const language = getLanguage(lang)

    const [title, setTitle] = useState(initialNote?.title || '')
    const [content, setContent] = useState(initialNote?.content || '')
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState(notFoundNote ? 'This note no longer exists.' : null)

    const saveNote = async () => {
        setSaving(true)
        setError(null)
        try {
            const res = await fetch(`/api/notes?lang=${lang}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, title: title.trim() || 'Untitled note', content })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to save note')
        } catch (err) {
            setError(err.message)
        } finally {
            setSaving(false)
        }
    }

    const deleteNote = async () => {
        try {
            const res = await fetch(`/api/notes?lang=${lang}&id=${encodeURIComponent(id)}`, { method: 'DELETE' })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to delete note')
            router.push(`/${lang}/notes`)
        } catch (err) {
            setError(err.message)
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
                    disabled={notFoundNote}
                />
                <textarea
                    className="border rounded-lg p-3 min-h-[50vh] font-mono text-sm outline-none focus:ring-2 focus:ring-gray-300"
                    placeholder="Write your notes in markdown…"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    disabled={notFoundNote}
                />

                {error && <p className="text-red-600 text-sm">{error}</p>}

                <div className="flex justify-between gap-2">
                    <button
                        onClick={deleteNote}
                        disabled={notFoundNote}
                        className="px-4 py-2 text-sm font-semibold text-red-600 hover:text-red-700 disabled:text-gray-300"
                    >
                        <FontAwesomeIcon icon={faTrash} className="mr-1" /> Delete
                    </button>
                    <button
                        onClick={saveNote}
                        disabled={saving || notFoundNote}
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
    const { lang, id } = ctx.params
    if (!isValidLanguage(lang)) {
        return { notFound: true }
    }

    let note = null
    try {
        note = readNote(lang, id)
    } catch (err) {
        note = null
    }

    return {
        props: {
            lang,
            id,
            initialNote: note,
            notFoundNote: !note
        }
    }
}