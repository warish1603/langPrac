import { useRef, useState } from 'react'
import Image from 'next/image';
import GoogleDocLogo from '../public/Google_Docs_Logo.svg';
import GoogleSheetsLogo from '../public/Google_Sheets_Logo.svg';
import { useRouter } from 'next/router';
import Tooltip from './Tooltip'

const INPUT_TYPE = {
    LIST_INPUT: 'LIST_INPUT',
    DOC_INPUT: 'DOC_INPUT'
}

export default function InputFunction({ lang }) {

    let textField = useRef(null);

    let router = useRouter()

    let [disable, setDisable] = useState(false)
    let [listOfWords, setListOfWords] = useState()
    let [inputType, setInputType] = useState(INPUT_TYPE.DOC_INPUT)

    const processWords = (listOfWords, inputType) => {
        if (!listOfWords || !listOfWords.trim()) return

        if (inputType == INPUT_TYPE.DOC_INPUT) {
            router.push({
                pathname: `/${lang}/choose_deck`,
                query: { paragraph: listOfWords },
            })
        }
        else {
            listOfWords = listOfWords.split(/[,\n]+[\W]*/g).map(w => w.trim()).filter(Boolean)
            router.push({
                pathname: `/${lang}/editor`,
                query: { words: JSON.stringify(listOfWords) },
            })
        }
    }

    let toggleOnClick = () => {
        if (inputType == INPUT_TYPE.DOC_INPUT) {
            setInputType(INPUT_TYPE.LIST_INPUT)
        }
        else setInputType(INPUT_TYPE.DOC_INPUT)
    }

    return (
        <div className='flex self-center justify-center laptop:space-x-6 items-center tablet:space-x-0 phone:space-x-0 mt-6 phone:mt-8 laptop:w-2/3 tablet:w-full phone:w-full laptop:flex-row tablet:flex-col phone:flex-col relative'>
            <div className='flex relative laptop:w-2/3 tablet:w-full phone:w-full'>
                <div
                className="flex absolute inset-y-0 left-0 items-center ml-3 z-1"
                >
                    {inputType == INPUT_TYPE.DOC_INPUT
                    ? <Tooltip title={"Paragraph as input"} onClick={toggleOnClick}>
                        <Image src={GoogleDocLogo} width={35} height={35} alt="Paragraph as input" />
                    </Tooltip>
                    : <Tooltip title={"Word list as input"} onClick={toggleOnClick}>
                        <Image src={GoogleSheetsLogo} width={35} height={35} alt="Word list as input" />
                    </Tooltip>
                }
                </div>
                <textarea className="pl-12 p-4 border shadow-sm flex-grow w-full text-base"
                    rows={3}
                    placeholder="Paste a comma-separated word list, or a paragraph…"
                    ref={el => {
                        if (el) textField = el;
                    }}
                    onChange={e => {
                        setListOfWords(e.target.value)
                    }}
                />
            </div>
            <button
                className='bg-slate-900 self-center hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 text-white font-semibold h-12 laptop:px-6 phone:px-4 rounded-lg laptop:mt-0 tablet:mt-4 phone:mt-3 disabled:bg-slate-400 w-full laptop:w-auto'
                disabled={disable}
                onClick={() => processWords(listOfWords, inputType)}
            >
                Create deck
            </button>
        </div>
    )
}