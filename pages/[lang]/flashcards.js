import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { addDeck } from '../../services/db'
import { getLanguage, isValidLanguage } from '../../lib/languages'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faChevronRight, faRotate, faFloppyDisk } from '@fortawesome/free-solid-svg-icons'

// Flashcards are always generated automatically from the same Excel
// source as the Lessons page — there's no manual word entry here.
export default function Flashcards({ lang }) {
    const router = useRouter()
    const { lesson: lessonTitle } = router.query
    const language = getLanguage(lang)

    const [cards, setCards] = useState(null)
    const [title, setTitle] = useState('')
    const [index, setIndex] = useState(0)
    const [flipped, setFlipped] = useState(false)
    const [error, setError] = useState(null)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    useEffect(() => {
        if (!router.isReady || !lessonTitle) return

        (async () => {
            try {
                const res = await fetch(`/api/lessons?lang=${lang}`)
                const data = await res.json()
                if (!res.ok) throw new Error(data.error || 'Failed to load lesson')

                const found = (data.lessons || []).find((l) => l.title === lessonTitle)
                if (!found) throw new Error(`Lesson "${lessonTitle}" not found`)

                setTitle(found.title)
                setCards(found.cards)
            } catch (err) {
                setError(err.message)
            }
        })()
    }, [router.isReady, lessonTitle, lang])

    const saveToCollection = async () => {
        if (!cards) return
        setSaving(true)
        try {
            await addDeck(
                cards.map((c) => ({ id: c.id, word: c.word, translation: c.translation, starred: false })),
                title,
                lang
            )
            setSaved(true)
        } finally {
            setSaving(false)
        }
    }

    if (error) {
        return (
            <div className="container m-auto px-4">
                <Header lang={lang} />
                <div className="max-w-xl mx-auto bg-red-100 border border-red-300 text-red-800 rounded-xl p-4 mt-8">{error}</div>
                <div className="text-center mt-6"><Link href={`/${lang}/lessons`}><a className="underline">Back to lessons</a></Link></div>
                <Footer />
            </div>
        )
    }

    if (!cards) {
        return (
            <div className="container m-auto px-4">
                <Header lang={lang} />
                <p className="text-center mt-12 text-gray-500">Loading flashcards…</p>
                <Footer />
            </div>
        )
    }

    const card = cards[index]

    return (
        <div className="container m-auto px-4">
            <Header lang={lang} />
            <div className="max-w-xl mx-auto mt-6">
                <div className="flex phone:flex-col justify-between items-center mb-6 gap-2">
                    <h1 className="text-2xl font-bold">{title}</h1>
                    <span className="text-gray-500 text-sm">{index + 1} / {cards.length}</span>
                </div>

                <div
                    onClick={() => setFlipped((f) => !f)}
                    className={`cursor-pointer select-none rounded-2xl shadow-lg hover:shadow-xl p-10 phone:p-6 text-center min-h-[16rem] flex flex-col items-center justify-center transition-shadow duration-300 ${language.accentSoft}`}
                >
                    <p className="text-xs uppercase tracking-wide text-gray-500 mb-3">{flipped ? language.label : 'English'}</p>
                    <p className="text-4xl phone:text-2xl font-extrabold break-words">{flipped ? card.translation : card.word}</p>
                    <p className="text-xs text-gray-400 mt-4">Tap card to flip</p>
                </div>

                <div className="flex items-center justify-between mt-6">
                    <button
                        onClick={() => { setIndex((i) => Math.max(0, i - 1)); setFlipped(false) }}
                        disabled={index === 0}
                        className="disabled:opacity-30 rounded-full w-12 h-12 flex items-center justify-center bg-gray-200 hover:bg-gray-300 transition-colors duration-200"
                    >
                        <FontAwesomeIcon icon={faChevronLeft} />
                    </button>
                    <button
                        onClick={() => setFlipped((f) => !f)}
                        className="rounded-full w-12 h-12 flex items-center justify-center bg-gray-200 hover:bg-gray-300 transition-colors duration-200"
                    >
                        <FontAwesomeIcon icon={faRotate} />
                    </button>
                    <button
                        onClick={() => { setIndex((i) => Math.min(cards.length - 1, i + 1)); setFlipped(false) }}
                        disabled={index === cards.length - 1}
                        className="disabled:opacity-30 rounded-full w-12 h-12 flex items-center justify-center bg-gray-200 hover:bg-gray-300 transition-colors duration-200"
                    >
                        <FontAwesomeIcon icon={faChevronRight} />
                    </button>
                </div>

                <button
                    onClick={saveToCollection}
                    disabled={saving || saved}
                    className={`mt-8 w-full flex items-center justify-center gap-2 text-white font-semibold rounded-lg px-6 py-3 disabled:bg-slate-400 transition-colors duration-200 ${language.accent} ${language.accentHover}`}
                >
                    <FontAwesomeIcon icon={faFloppyDisk} />
                    {saved ? 'Saved to collection' : saving ? 'Saving…' : 'Save to my collection'}
                </button>
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
