import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { useMemo, useState, useContext, createContext, useEffect } from 'react'
import { useRouter } from 'next/router'
import { deleteDeck, getAllDecks } from '../../services/db'
import { getLanguage, isValidLanguage } from '../../lib/languages'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDownload, faEdit, faTrash, faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { convertDataToCSVFile } from '../../services/download_csv'
import Link from 'next/link'

const CollectionContext = createContext()

const Card = ({ id, title, lang }) => {
    const [hover, setHover] = useState(false);
    const { collections, setCollections } = useContext(CollectionContext)
    const router = useRouter()

    return (
        <div className="list-none" key={title}>
            <span
                onMouseOver={() => setHover(true)}
                onMouseOut={() => setHover(false)}
                onClick={() => setHover((h) => !h)}
                className="bg-gray-200 transition-colors duration-300 relative hover:bg-gray-300 flex w-full h-full min-h-[6rem] items-center justify-center text-2xl phone:text-xl rounded-xl shadow-md hover:shadow-lg text-black p-4 text-center"
            >
                <span className={`${hover && 'blur-sm'} absolute px-2`}>{title}</span>
                {hover && <span className="absolute w-full inline-flex justify-evenly">
                    <FontAwesomeIcon
                        icon={faTrash}
                        className="desktop:text-3xl laptop:text-2xl tablet:text-xl phone:text-xl cursor-pointer"
                        onClick={(ev) => {
                            ev.stopPropagation()
                            deleteDeck(id)
                            setCollections(collections.filter((item) => item.id !== id))
                        }}
                    />
                    <FontAwesomeIcon
                        icon={faEdit}
                        onClick={(ev) => {
                            ev.stopPropagation()
                            router.push({
                                pathname: `/${lang}/deck`,
                                query: { id },
                            })
                        }}
                        className="desktop:text-3xl laptop:text-2xl tablet:text-xl phone:text-xl cursor-pointer"
                    />
                    <FontAwesomeIcon
                        icon={faDownload}
                        onClick={async (ev) => {
                            ev.stopPropagation()
                            var anchor = document.createElement('a');
                            anchor.setAttribute('download', 'mydata.csv');
                            var url = URL.createObjectURL(await convertDataToCSVFile(id));
                            anchor.setAttribute('href', url);
                            anchor.click();
                            URL.revokeObjectURL(url);
                        }}
                        className="desktop:text-3xl laptop:text-2xl tablet:text-xl phone:text-xl cursor-pointer"
                    />
                </span>}
            </span>
        </div>
    );
};


export default function Collection({ lang }) {
    const language = getLanguage(lang)
    const [collections, setCollections] = useState([])
    const [loaded, setLoaded] = useState(false)

    useEffect(() => {
        (async () => {
            const decks = await getAllDecks(lang)
            setCollections(decks || [])
            setLoaded(true)
        })()
    }, [lang])

    const memoizedValues = useMemo(() => {
        return { collections, setCollections }
    }, [collections, setCollections])

    return (
        <div className="container m-auto px-4">
            <Header lang={lang} />
            <Link href={`/${lang}`}>
                <a className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200 mt-2">
                    <FontAwesomeIcon icon={faArrowLeft} /> Back to {language.label}
                </a>
            </Link>
            <h1 className='text-4xl phone:text-3xl font-bold text-center py-12'>{language.label} deck collection</h1>
            <div>
                <CollectionContext.Provider value={memoizedValues}>
                    {loaded && collections.length === 0 && (
                        <p className="text-center text-gray-600 mb-12">
                            No saved decks yet. Head back to {language.label} home and paste a word list to create one.
                        </p>
                    )}
                    <div className='
                    min-h-[20vh]
                    desktop:grid desktop:grid-cols-3 desktop:gap-12
                    laptop:grid laptop:grid-cols-3 laptop:gap-10
                    tablet:grid tablet:grid-cols-2 tablet:gap-10
                    phone:grid phone:grid-cols-1 phone:gap-8
                    '>
                        {
                            collections.map((deck) => <Card {...deck} lang={lang} key={deck.id}/>)
                        }
                    </div>
                </CollectionContext.Provider>

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
