import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { useMemo, useState, useContext, createContext, useRef } from 'react'
import { faCheckCircle, faXmarkCircle, faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import natural from 'natural'
import tag_names from '../../lib/tag_names'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Tooltip from '../../components/Tooltip'
import { isValidLanguage, getLanguage } from '../../lib/languages'

const SelectListContext = createContext()

const Card = ({ listOfWords, title, key }) => {
    const [hover, setHover] = useState(false);
    const [clicked, setClicked] = useState(false)
    const { wordList } = useContext(SelectListContext)

    return (
        <button
            key={key}
            onMouseOver={() => setHover(true)}
            onMouseOut={() => setHover(false)}
            onClick={() => {
                if (clicked == false) {
                    wordList.current = wordList.current.concat(listOfWords)
                    setClicked(true)
                }
                else {
                    wordList.current = wordList.current.filter(word => !listOfWords.includes(word))
                    setClicked(false)
                }
            }}
            className={`bg-gray-200 transition-colors duration-300 px-6 py-4 relative hover:bg-gray-300 flex w-auto items-center justify-center text-2xl phone:text-lg shadow-xl text-black rounded-lg ${clicked && 'border-4 border-indigo-600'}`}
        >
            <p className={`${hover && 'blur-sm'}`}>{title}</p>
            {hover && <span className="absolute flex justify-evenly">
                <FontAwesomeIcon
                    icon={clicked ? faXmarkCircle : faCheckCircle}
                    className="desktop:text-3xl laptop:text-2xl tablet:text-xl phone:text-xl"
                />
            </span>}
        </button>
    );
};

export default function ChooseDeck({ wordBuckets, lang }) {
    const language = getLanguage(lang)
    let wordList = useRef([])

    const memoizedValues = useMemo(() => {
        return { wordList }
    }, [wordList])

    const router = useRouter()

    const translateWords = () => {
        router.push({
            pathname: `/${lang}/editor`,
            query: { words: JSON.stringify(wordList.current) },
        })
    }

    return (
        <div className="container m-auto px-4">
            <Header lang={lang} />

            <Link href={`/${lang}`}>
                <a className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200 mt-2">
                    <FontAwesomeIcon icon={faArrowLeft} /> Back to {language.label}
                </a>
            </Link>

            <h1 className='text-4xl phone:text-3xl font-bold text-center py-12'>Pick word groups for your {language.label} deck</h1>
            <div>
                <SelectListContext.Provider value={memoizedValues}>
                    <div
                        className='min-h-[20vh] flex flex-wrap gap-2 justify-center'
                    >
                        {
                            (() => {
                                let tempArrCollections = []
                                let tempWordArr = Object.entries(JSON.parse(wordBuckets))

                                for (
                                    let i = 1;
                                    tempWordArr.length >= i;
                                    i++
                                ) {
                                    tempArrCollections.push(tempWordArr.slice(0, i))
                                    tempWordArr = tempWordArr.slice(i)
                                }

                                tempArrCollections = tempArrCollections.concat(tempWordArr)

                                return tempArrCollections.map((card, cardIndex) => (
                                    <div className="w-full flex flex-wrap items-center justify-evenly gap-2" key={cardIndex + new Date().getTime()}>
                                        {card.map(([cat, arr], indx) => {
                                            return arr && !cat.includes("undefined") && (
                                                <Tooltip title={arr.toString()} key={cat + indx}>
                                                    <Card title={cat} listOfWords={arr} key={cat + indx} />
                                                </Tooltip>
                                            )
                                        })}</div>
                                ))
                            })()
                        }
                    </div>
                </SelectListContext.Provider>
            </div>

            <button
                className='bg-slate-900 flex items-center justify-center my-6 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 text-white font-semibold h-12 laptop:px-6 phone:px-4 rounded-lg m-auto'
                onClick={() => translateWords()}
            >
                <span>Create deck</span>
            </button>
            <Footer />
        </div>
    )
}

export async function getServerSideProps(ctx) {
    const { lang, paragraph } = ctx.params ? { lang: ctx.params.lang, paragraph: ctx.query.paragraph } : { lang: null, paragraph: null }

    if (!isValidLanguage(lang)) {
        return { notFound: true }
    }

    const language = "EN";
    const defaultCategory = 'N';
    const defaultCategoryCapitalized = 'NNP';

    var lexicon = new natural.Lexicon(language, defaultCategory, defaultCategoryCapitalized);
    var ruleSet = new natural.RuleSet(language);
    var tagger = new natural.BrillPOSTagger(lexicon, ruleSet);

    const filterDuplicates = (arr) => {
        return arr.filter(function (item, pos, self) {
            return self.indexOf(item) == pos;
        })
    }

    const sortByTags = (arr) => {
        let obj = {}
        filterDuplicates(arr.map(word => word.tag)).forEach(tag => {
            obj[tag_names[tag]] = arr.filter(item => item.tag == tag).map(word => word.token)
        })

        return obj
    }

    var tokenizer = new natural.WordTokenizer();

    let corpus = filterDuplicates(tokenizer.tokenize(paragraph || ''))
    let wordBuckets = sortByTags(tagger.tag(corpus).taggedWords)

    return {
        props: { wordBuckets: JSON.stringify(wordBuckets), lang }
    }
}