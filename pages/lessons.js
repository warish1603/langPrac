import { useEffect, useState } from 'react'
import Link from 'next/link'
import Header from '../components/Header'
import { getAllGeneratorLessons, deleteGeneratorLesson } from '../services/db'
import { GENERATOR_LABELS } from '../lib/generators'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'

const LessonCard = ({ title, subtitle, href, onDelete }) => (
    <div className="bg-gray-200 hover:bg-gray-300 transition-colors duration-300 rounded-lg shadow-xl p-6 flex flex-col justify-between relative">
        {onDelete && (
            <FontAwesomeIcon
                icon={faTrash}
                onClick={onDelete}
                className="absolute top-4 right-4 cursor-pointer text-gray-600 hover:text-red-600"
            />
        )}
        <div>
            <h3 className="text-xl font-bold text-black">{title}</h3>
            <p className="text-sm text-gray-700 mt-1">{subtitle}</p>
        </div>
        <Link href={href}>
            <a className="mt-4 inline-block bg-slate-900 hover:bg-slate-700 text-white font-semibold rounded-lg px-4 py-2 text-center">
                Start quiz
            </a>
        </Link>
    </div>
)

export default function Lessons() {
    const [excelLessons, setExcelLessons] = useState([])
    const [excelError, setExcelError] = useState(null)
    const [generatorLessons, setGeneratorLessons] = useState([])
    const [loading, setLoading] = useState(true)

    const loadGeneratorLessons = async () => {
        const lessons = await getAllGeneratorLessons()
        setGeneratorLessons(lessons || [])
    }

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch('/api/lessons')
                const data = await res.json()
                if (!res.ok) throw new Error(data.error || 'Failed to load lessons')
                setExcelLessons(data.lessons || [])
            } catch (error) {
                setExcelError(error.message)
            }

            await loadGeneratorLessons()
            setLoading(false)
        })()
    }, [])

    return (
        <div className="container m-auto">
            <Header />
            <div className="flex items-center justify-between py-8">
                <h1 className="text-4xl font-bold text-center flex-grow">Lessons</h1>
            </div>

            <div className="flex justify-center mb-10">
                <Link href="/lessons/new">
                    <a className="bg-slate-900 hover:bg-slate-700 text-white font-semibold rounded-lg px-6 py-3">
                        + New custom quiz (e.g. number range)
                    </a>
                </Link>
            </div>

            {loading && <p className="text-center">Loading lessons…</p>}

            {excelError && (
                <div className="max-w-2xl mx-auto bg-red-100 border border-red-300 text-red-800 rounded-lg p-4 mb-8">
                    <p className="font-semibold">Couldn&apos;t load your Excel word lists.</p>
                    <p className="text-sm mt-1">{excelError}</p>
                    <p className="text-sm mt-1">Check EXCEL_FILE_PATH in .env.local — see .env.local.example.</p>
                </div>
            )}

            {!loading && !excelError && excelLessons.length === 0 && (
                <p className="text-center text-gray-600 mb-8">No lessons found in your Excel file yet.</p>
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
                                href={`/quiz?mode=wordbank&lesson=${encodeURIComponent(lesson.title)}`}
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
                                href={`/quiz?mode=generator&id=${lesson.id}`}
                                onDelete={async () => {
                                    await deleteGeneratorLesson(lesson.id)
                                    await loadGeneratorLessons()
                                }}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}
