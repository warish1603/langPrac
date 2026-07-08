import Head from 'next/head'
import Link from 'next/link'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { LANGUAGE_LIST } from '../lib/languages'

export default function Home() {
  return (
    <div className="container m-auto px-4 phone:px-4 tablet:px-6">
      <Head>
        <title>Language flashcard generator</title>
        <meta name="description" content="Language flashcard generator" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <main className="flex flex-col items-center justify-center text-center" style={{ minHeight: '60vh' }}>
        <div>
          <h1 className="text-slate-900 font-extrabold phone:text-3xl tablet:text-5xl laptop:text-6xl tracking-tight text-center dark:text-white">
            The flashcard generator for language learners.
          </h1>
          <p className="mt-6 text-lg text-slate-600 text-center max-w-2xl mx-auto dark:text-slate-400">
            Pick a language to generate flashcards from your Excel word lists, run quizzes, and keep study notes.
          </p>
        </div>

        <div className="mt-10 grid phone:grid-cols-1 tablet:grid-cols-2 gap-6 w-full max-w-2xl">
          {LANGUAGE_LIST.map((lang) => (
            <Link key={lang.slug} href={`/${lang.slug}`}>
              <a className={`rounded-2xl shadow-lg hover:shadow-2xl p-8 phone:p-6 text-white ${lang.accent} ${lang.accentHover} transition-all duration-300 hover:-translate-y-1 flex flex-col items-center`}>
                <span className="text-3xl phone:text-2xl font-bold text-white">{lang.label}</span>
                <span className="text-sm text-white/80 mt-1">{lang.nativeName}</span>
                <span className="mt-4 text-sm text-white underline underline-offset-2">Open {lang.label} →</span>
              </a>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  )
}
