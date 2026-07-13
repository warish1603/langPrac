import Link from "next/link"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons"
import Editor from "../../../components/Editor";
import { getLanguage, isValidLanguage } from "../../../lib/languages";
import { getTranslationLookup } from "../../../lib/readExcel";

export default function NewEditor({ cardDecks, lang }) {
    return (
        <div className="relative">
            <Link href={`/${lang}`}>
                <a className="fixed top-3 left-3 z-10 inline-flex items-center gap-2 text-sm bg-white/90 backdrop-blur rounded-full px-3 py-1.5 shadow text-gray-700 hover:text-gray-900 transition-colors duration-200">
                    <FontAwesomeIcon icon={faArrowLeft} /> Back
                </a>
            </Link>
            <Editor listOfCards={cardDecks} title="New deck." isNew={true} lang={lang} />
        </div>
    )
}

export async function getServerSideProps(ctx) {
    const { lang } = ctx.params
    if (!isValidLanguage(lang)) {
        return { notFound: true }
    }

    const { words } = ctx.query

    let wordList = []
    try {
        wordList = JSON.parse(words || '[]').map((w) => String(w).trim()).filter(Boolean)
    } catch (e) {
        wordList = []
    }

    // Translations are looked up from the language's own Excel word list
    // (same source as Lessons) — no external translation service involved.
    let lookup = {}
    try {
        lookup = getTranslationLookup(lang)
    } catch (err) {
        lookup = {}
    }

    const cardDecks = wordList.map((word, i) => ({
        id: i + 1,
        word,
        translation: lookup[word.toLowerCase()] || '',
        starred: false
    }))

    return {
        props: {
            cardDecks: JSON.stringify(cardDecks.length ? cardDecks : [{ id: 1, word: '', translation: '', starred: false }]),
            lang
        }
    }
}