import { useEffect, useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import Editor from "../../components/Editor";
import { getDeck } from "../../services/db";
import { isValidLanguage } from "../../lib/languages";

export default function DeckEditor({ id, lang }) {

    const [deckData, setDeckData] = useState()

    useEffect(() => {
        (async () => {
            let { data, title } = await getDeck(id)
            setDeckData({
                data, id, title
            })
        })()
    }, [id])

    return deckData && (
        <div className="relative">
            <Link href={`/${lang}/collection`}>
                <a className="fixed top-3 left-3 z-10 inline-flex items-center gap-2 text-sm bg-white/90 backdrop-blur rounded-full px-3 py-1.5 shadow text-gray-700 hover:text-gray-900 transition-colors duration-200">
                    <FontAwesomeIcon icon={faArrowLeft} /> Back to collection
                </a>
            </Link>
            <Editor title={deckData.title} listOfCards={JSON.stringify(deckData.data)} id={deckData.id} isNew={false} lang={lang} />
        </div>
    )
}

export async function getServerSideProps(ctx) {
    const { lang, id } = ctx.query
    const { lang: langParam } = ctx.params

    if (!isValidLanguage(langParam)) {
        return { notFound: true }
    }

    return {
        props: { id: id || null, lang: langParam }
    }
}