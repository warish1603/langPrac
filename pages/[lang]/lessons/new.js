import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Header from '../../../components/Header'
import Footer from '../../../components/Footer'
import { addGeneratorLesson } from '../../../services/db'
import { GENERATOR_TYPES } from '../../../lib/generators'
import { getLanguage, isValidLanguage } from '../../../lib/languages'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'

export default function NewGeneratorLesson({ lang }) {
    const router = useRouter()
    const language = getLanguage(lang)

    const [title, setTitle] = useState('')
    const [min, setMin] = useState(0)
    const [max, setMax] = useState(100)
    const [targetLanguage, setTargetLanguage] = useState(language.label)
    const [questionCount, setQuestionCount] = useState(10)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState(null)

    const onSubmit = async (e) => {
        e.preventDefault()
        setError(null)

        if (!title.trim()) return setError('Give your quiz a title.')
        if (!targetLanguage.trim()) return setError('Enter a target language.')
        if (Number(max) <= Number(min)) return setError('Max must be greater than min.')

        setSaving(true)
        try {
            await addGeneratorLesson(lang, title.trim(), GENERATOR_TYPES.NUMBER_RANGE, {
                min: Number(min),
                max: Number(max),
                targetLanguage: targetLanguage.trim(),
                questionCount: Number(questionCount)
            })
            router.push(`/${lang}/lessons`)
        } catch (err) {
            setError(err.message)
            setSaving(false)
        }
    }

    return (
        <div className="container m-auto px-4">
            <Header lang={lang} />
             <Link href={`/${lang}/lessons`}>
                <a className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200 mt-2">
                    <FontAwesomeIcon icon={faArrowLeft} /> Back to lessons
                </a>
            </Link>
            <h1 className="text-4xl phone:text-3xl font-bold text-center py-8">New {language.label} custom quiz</h1>

            <form onSubmit={onSubmit} className="max-w-lg mx-auto flex flex-col space-y-4">
                <label className="flex flex-col">
                    <span className="font-semibold mb-1">Title</span>
                    <input
                        className="border rounded-lg p-2"
                        placeholder={`e.g. ${language.label} numbers 0-10,000`}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </label>

                <label className="flex flex-col">
                    <span className="font-semibold mb-1">Quiz type</span>
                    <input className="border rounded-lg p-2 bg-gray-100" value="Random number in a range" disabled />
                </label>

                <div className="flex phone:flex-col tablet:flex-row space-x-4 phone:space-x-0 phone:space-y-4">
                    <label className="flex flex-col flex-1">
                        <span className="font-semibold mb-1">Min</span>
                        <input
                            type="number"
                            className="border rounded-lg p-2"
                            value={min}
                            onChange={(e) => setMin(e.target.value)}
                        />
                    </label>
                    <label className="flex flex-col flex-1">
                        <span className="font-semibold mb-1">Max</span>
                        <input
                            type="number"
                            className="border rounded-lg p-2"
                            value={max}
                            onChange={(e) => setMax(e.target.value)}
                        />
                    </label>
                </div>

                <label className="flex flex-col">
                    <span className="font-semibold mb-1">Target language</span>
                    <input
                        className="border rounded-lg p-2"
                        placeholder={language.label}
                        value={targetLanguage}
                        onChange={(e) => setTargetLanguage(e.target.value)}
                    />
                </label>

                <label className="flex flex-col">
                    <span className="font-semibold mb-1">Questions per quiz attempt</span>
                    <input
                        type="number"
                        className="border rounded-lg p-2"
                        value={questionCount}
                        onChange={(e) => setQuestionCount(e.target.value)}
                    />
                </label>

                {error && <p className="text-red-600 text-sm">{error}</p>}

                <button
                    type="submit"
                    disabled={saving}
                    className="bg-slate-900 hover:bg-slate-700 disabled:bg-slate-400 text-white font-semibold rounded-lg px-6 py-3"
                >
                    {saving ? 'Saving…' : 'Save quiz'}
                </button>
            </form>
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
