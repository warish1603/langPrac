import { useEffect, useState } from 'react'
import Link from 'next/link'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { getLanguage, isValidLanguage } from '../../lib/languages'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash, faPlus, faArrowLeft } from '@fortawesome/free-solid-svg-icons'

export default function Notes({ lang }) {
    const language = getLanguage(lang)

    const [notes, setNotes] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const loadNotes = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/notes?lang=${lang}`)
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to load notes')
            setNotes(data.notes || [])
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadNotes()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lang])

    const removeNote = async (id) => {
        try {
            const res = await fetch(`/api/notes?lang=${lang}&id=${encodeURIComponent(id)}`, { method: 'DELETE' })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to delete note')
            await loadNotes()
        } catch (err) {
            setError(err.message)
        }
    }

    return (
        <div className="container m-auto px-4">
            <Header lang={lang} />

            <Link href={`/${lang}`}>
                <a className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200 mt-2">
                    <FontAwesomeIcon icon={faArrowLeft} /> Back to {language.label}
                </a>
            </Link>

            <h1 className="text-4xl phone:text-3xl font-bold text-center py-8">{language.label} notes</h1>
            <p className="text-center text-gray-500 mb-8 max-w-xl mx-auto text-sm">
                Saved as plain markdown files under <code>data/notes/{lang}/</code> — no database needed.
            </p>

            {error && (
                <div className="max-w-3xl mx-auto bg-red-100 border border-red-300 text-red-800 rounded-xl p-4 mb-6">
                    {error}
                </div>
            )}

            <div className="max-w-5xl mx-auto grid phone:grid-cols-1 tablet:grid-cols-2 laptop:grid-cols-3 desktop:grid-cols-4 gap-5">
                <Link href={`/${lang}/notes/new`}>
                    <a className="h-40 rounded-xl border-2 border-dashed border-gray-300 hover:border-gray-400 text-gray-400 hover:text-gray-600 transition-colors duration-200 flex flex-col items-center justify-center">
                        <FontAwesomeIcon icon={faPlus} className="text-2xl mb-2" />
                        <span className="font-semibold">New note</span>
                    </a>
                </Link>

                {notes.map((note) => (
                    <Link key={note.id} href={`/${lang}/notes/${encodeURIComponent(note.id)}`}>
                        <a className="group relative h-40 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 p-4 flex flex-col text-left">
                            <FontAwesomeIcon
                                icon={faTrash}
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeNote(note.id) }}
                                className="absolute top-3 right-3 text-gray-300 group-hover:text-red-500 transition-colors duration-200"
                            />
                            <h3 className="font-semibold pr-5 truncate">{note.title}</h3>
                            {note.preview && (
                                <p className="text-sm text-gray-500 mt-2 flex-grow overflow-hidden">{note.preview}</p>
                            )}
                            <p className="text-xs text-gray-400 mt-2">{new Date(note.updatedAt).toLocaleDateString()}</p>
                        </a>
                    </Link>
                ))}

                {!loading && notes.length === 0 && (
                    <p className="col-span-full text-center text-sm text-gray-500 mt-4">No notes yet — write your first one.</p>
                )}
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