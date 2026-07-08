import { useEffect, useState } from 'react'
import Link from 'next/link'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { getAllGeneratorLessons, deleteGeneratorLesson } from '../../services/db'
import { GENERATOR_LABELS } from '../../lib/generators'
import { getLanguage, isValidLanguage } from '../../lib/languages'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash, faArrowLeft } from '@fortawesome/free-solid-svg-icons'

const LessonCard = ({ title, subtitle, href, onDelete }) => (
    <div className="bg-gray-200 hover:bg-gray-300 transition-colors duration-300 rounded-xl shadow-md hover:shadow-lg p-6 flex flex-col justify-between relative">
        {onDelete && (
            <FontAwesomeIcon
                icon={faTrash}
                onClick={onDelete}
                className="absolute top-4 right-4 cursor-pointer text-gray-600 hover:text-red-600"
            />
        )}
        <div>
            <h3 className="text-xl font-bold text-black pr-6">{title}</h3>
            <p className="text-sm text-gray-700 mt-1">{subtitle}</p>
        </div>
        <Link href={href}>
            <a className="mt-4 inline-block bg-slate-900 hover:bg-slate-700 text-white font-semibold rounded-lg px-4 py-2 text-center">
                Start quiz
            </a>
        </Link>
    </div>
)

export default function Lessons({ lang }) {
    const language = getLanguage(lang)
    const [excelLessons, setExcelLessons] = useState([])
    const [excelError, setExcelError] = useState(null)
    const [generatorLessons, setGeneratorLessons] = useState([])
    const [loading, setLoading] = useState(true)

    const loadGeneratorLessons = async () => {
        const lessons = await getAllGeneratorLessons(lang)
        setGeneratorLessons(lessons || [])
    }

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch(`/api/lessons?lang=${lang}`)
                const data = await res.json()
                if (!res.ok) throw new Error(data.error || 'Failed to load lessons')
                setExcelLessons(data.lessons || [])
            } catch (error) {
                setExcelError(error.message)
            }

            await loadGeneratorLessons()
            setLoading(false)
        })()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lang])

    return (
        <div className="container m-auto px-4">
            <Header lang={lang} />

            <Link href={`/${lang}`}>
                <a className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200 mt-2">
                    <FontAwesomeIcon icon={faArrowLeft} /> Back to {language.label}
                </a>
            </Link>

            <div className="flex items-center justify-between py-8">
                <h1 className="text-4xl phone:text-3xl font-bold text-center flex-grow">{language.label} lessons</h1>
            </div>

            <div className="flex justify-center mb-10">
                <Link href={`/${lang}/lessons/new`}>
                    <a className="bg-slate-900 hover:bg-slate-700 text-white font-semibold rounded-lg px-6 py-3 text-center transition-colors duration-200">
                        + New custom quiz (e.g. number range)
                    </a>
                </Link>
            </div>

            {loading && <p className="text-center text-gray-500">Loading lessons…</p>}

            {excelError && (
                <div className="max-w-2xl mx-auto bg-red-100 border border-red-300 text-red-800 rounded-xl p-4 mb-8">
                    <p className="font-semibold">Couldn&apos;t load your {language.label} word lists.</p>
                    <p className="text-sm mt-1">{excelError}</p>
                    <p className="text-sm mt-1">
                        Add an Excel file at <code>data/excel/{language.excelFile}</code>, or set
                        {' '}<code>EXCEL_FILE_PATH_{lang.toUpperCase()}</code> in <code>.env.local</code>.
                    </p>
                </div>
            )}

            {!loading && !excelError && excelLessons.length === 0 && (
                <p className="text-center text-gray-600 mb-8">No lessons found in your {language.label} Excel file yet.</p>
            )}

            {excelLessons.length > 0 && (
                <>
                    <h2 className="text-2xl font-semibold mb-4">From your Excel file</h2>
                    <div className="grid desktop:grid-cols-3 laptop:grid-cols-3 tablet:grid-cols-2 phone:grid-cols-1 gap-6 mb-12">
                        {excelLessons.map((lesson) => (
                            <LessonCard
                                key={lesson.title}
                                title={lesson.title}
                                subtitle={`${lesson.cardCount} words`}
                                href={`/${lang}/quiz?mode=wordbank&lesson=${encodeURIComponent(lesson.title)}`}
                            />
                        ))}
                    </div>
                </>
            )}

            {generatorLessons.length > 0 && (
                <>
                    <h2 className="text-2xl font-semibold mb-4">Custom quizzes</h2>
                    <div className="grid desktop:grid-cols-3 laptop:grid-cols-3 tablet:grid-cols-2 phone:grid-cols-1 gap-6 mb-12">
                        {generatorLessons.map((lesson) => (
                            <LessonCard
                                key={lesson.id}
                                title={lesson.title}
                                subtitle={`${GENERATOR_LABELS[lesson.type] || lesson.type} · ${lesson.config.targetLanguage}`}
                                href={`/${lang}/quiz?mode=generator&id=${lesson.id}`}
                                onDelete={async () => {
                                    await deleteGeneratorLesson(lesson.id)
                                    await loadGeneratorLessons()
                                }}
                            />
                        ))}
                    </div>
                </>
            )}
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