import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Header from '../components/Header'
import { getGeneratorLesson } from '../services/db'
import { generateQuestion } from '../lib/generators'

const shuffle = (arr) => arr
    .map((v) => [Math.random(), v])
    .sort((a, b) => a[0] - b[0])
    .map(([, v]) => v)

const MAX_WORDBANK_QUESTIONS = 30

export default function Quiz() {
    const router = useRouter()
    const { mode, lesson: lessonTitle, id } = router.query

    const [title, setTitle] = useState('')
    const [questions, setQuestions] = useState(null) // for wordbank: precomputed array. for generator: null, built on the fly
    const [generatorLesson, setGeneratorLesson] = useState(null)
    const [totalQuestions, setTotalQuestions] = useState(0)

    const [current, setCurrent] = useState(null) // { prompt, promptDescription, targetLanguage, expectedTranslation }
    const [index, setIndex] = useState(0)
    const [answer, setAnswer] = useState('')
    const [checking, setChecking] = useState(false)
    const [feedback, setFeedback] = useState(null) // { correct, correctAnswer, feedback }
    const [score, setScore] = useState(0)
    const [error, setError] = useState(null)
    const [done, setDone] = useState(false)

    // --- setup ---
    useEffect(() => {
        if (!router.isReady) return

        (async () => {
            if (mode === 'wordbank' && lessonTitle) {
                try {
                    const res = await fetch('/api/lessons')
                    const data = await res.json()
                    if (!res.ok) throw new Error(data.error || 'Failed to load lesson')

                    const found = (data.lessons || []).find((l) => l.title === lessonTitle)
                    if (!found) throw new Error(`Lesson "${lessonTitle}" not found`)

                    const shuffled = shuffle(found.cards).slice(0, MAX_WORDBANK_QUESTIONS)
                    setTitle(found.title)
                    setQuestions(shuffled)
                    setTotalQuestions(shuffled.length)
                    setCurrent(toWordbankQuestion(shuffled[0]))
                } catch (err) {
                    setError(err.message)
                }
            } else if (mode === 'generator' && id) {
                try {
                    const lesson = await getGeneratorLesson(id)
                    if (!lesson) throw new Error('Custom quiz not found')

                    setGeneratorLesson(lesson)
                    setTitle(lesson.title)
                    setTotalQuestions(lesson.config.questionCount || 10)
                    setCurrent(generateQuestion(lesson))
                } catch (err) {
                    setError(err.message)
                }
            }
        })()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router.isReady, mode, lessonTitle, id])

    const toWordbankQuestion = (card) => ({
        prompt: card.word,
        promptDescription: null,
        targetLanguage: card.language,
        expectedTranslation: card.translation
    })

    const submitAnswer = async () => {
        if (!answer.trim() || !current) return
        setChecking(true)
        setError(null)

        try {
            const res = await fetch('/api/check-answer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mode,
                    prompt: current.prompt,
                    promptDescription: current.promptDescription,
                    targetLanguage: current.targetLanguage,
                    expectedTranslation: current.expectedTranslation,
                    userAnswer: answer.trim()
                })
            })
            const result = await res.json()
            if (!res.ok) throw new Error(result.error || 'Failed to check answer')

            setFeedback(result)
            if (result.correct === true) setScore((s) => s + 1)
        } catch (err) {
            setError(err.message)
        } finally {
            setChecking(false)
        }
    }

    const nextQuestion = () => {
        const nextIndex = index + 1
        setFeedback(null)
        setAnswer('')

        if (nextIndex >= totalQuestions) {
            setDone(true)
            return
        }

        setIndex(nextIndex)

        if (mode === 'wordbank' && questions) {
            setCurrent(toWordbankQuestion(questions[nextIndex]))
        } else if (mode === 'generator' && generatorLesson) {
            setCurrent(generateQuestion(generatorLesson))
        }
    }

    if (error) {
        return (
            <div className="container m-auto">
                <Header />
                <div className="max-w-xl mx-auto bg-red-100 border border-red-300 text-red-800 rounded-lg p-4 mt-8">
                    <p className="font-semibold">Something went wrong.</p>
                    <p className="text-sm mt-1">{error}</p>
                </div>
                <div className="text-center mt-6">
                    <Link href="/lessons"><a className="underline">Back to lessons</a></Link>
                </div>
            </div>
        )
    }

    if (done) {
        return (
            <div className="container m-auto">
                <Header />
                <div className="max-w-xl mx-auto text-center mt-12">
                    <h1 className="text-3xl font-bold mb-4">{title}: done!</h1>
                    <p className="text-xl mb-8">You scored {score} / {totalQuestions}</p>
                    <div className="flex justify-center space-x-4">
                        <button
                            className="bg-slate-900 hover:bg-slate-700 text-white font-semibold rounded-lg px-6 py-3"
                            onClick={() => router.reload()}
                        >
                            Try again
                        </button>
                        <Link href="/lessons">
                            <a className="border border-slate-900 text-slate-900 font-semibold rounded-lg px-6 py-3">
                                Back to lessons
                            </a>
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    if (!current) {
        return (
            <div className="container m-auto">
                <Header />
                <p className="text-center mt-12">Loading quiz…</p>
            </div>
        )
    }

    return (
        <div className="container m-auto">
            <Header />
            <div className="max-w-xl mx-auto mt-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">{title}</h1>
                    <span className="text-gray-600">{index + 1} / {totalQuestions} · Score {score}</span>
                </div>

                <div className="bg-gray-200 rounded-lg shadow-xl p-8 text-center mb-6">
                    {current.promptDescription && (
                        <p className="text-sm text-gray-600 mb-2">{current.promptDescription}</p>
                    )}
                    <p className="text-4xl font-extrabold mb-2">{current.prompt}</p>
                    <p className="text-gray-700">Translate to {current.targetLanguage}</p>
                </div>

                {!feedback ? (
                    <div className="flex space-x-4">
                        <input
                            className="border rounded-lg p-3 flex-grow"
                            placeholder="Type your answer…"
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && submitAnswer()}
                            disabled={checking}
                            autoFocus
                        />
                        <button
                            className="bg-slate-900 hover:bg-slate-700 disabled:bg-slate-400 text-white font-semibold rounded-lg px-6"
                            onClick={submitAnswer}
                            disabled={checking || !answer.trim()}
                        >
                            {checking ? 'Checking…' : 'Submit'}
                        </button>
                    </div>
                ) : (
                    <div>
                        <div className={`rounded-lg p-4 mb-4 ${
                            feedback.correct === true ? 'bg-green-100 text-green-800' :
                            feedback.correct === false ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                        }`}>
                            <p className="font-semibold">
                                {feedback.correct === true ? 'Correct!' : feedback.correct === false ? 'Not quite.' : "Couldn't verify"}
                            </p>
                            {feedback.correct === false && feedback.correctAnswer && <p className="text-sm mt-1">Correct answer: {feedback.correctAnswer}</p>}
                            <p className="text-sm mt-1">{feedback.feedback}</p>
                        </div>
                        <button
                            className="bg-slate-900 hover:bg-slate-700 text-white font-semibold rounded-lg px-6 py-3 w-full"
                            onClick={nextQuestion}
                        >
                            {index + 1 >= totalQuestions ? 'See results' : 'Next question'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
