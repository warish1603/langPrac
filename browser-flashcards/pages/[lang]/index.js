import Head from 'next/head'
import Link from 'next/link'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import InputFunction from '../../components/Input'
import { getLanguage, isValidLanguage } from '../../lib/languages'

const SectionCard = ({ href, title, subtitle }) => (
    <Link href={href}>
        <a className="bg-gray-200 hover:bg-gray-300 transition-all duration-300 hover:-translate-y-0.5 rounded-xl shadow-md hover:shadow-lg p-6 text-center flex flex-col items-center">
            <span className="block text-xl font-bold text-black">{title}</span>
            <span className="block text-sm text-gray-700 mt-1">{subtitle}</span>
        </a>
    </Link>
)

export default function LanguageHome({ lang }) {
    const language = getLanguage(lang)

    return (
        <div className="container m-auto px-4">
            <Head>
                <title>{language.label} flashcards</title>
            </Head>
            <Header lang={lang} />

            <main className="flex flex-col items-center" style={{ minHeight: '55vh' }}>
                <h1 className="text-slate-900 font-extrabold phone:text-3xl tablet:text-5xl laptop:text-6xl tracking-tight text-center dark:text-white">
                    {language.label}
                </h1>
                <p className="text-slate-500 phone:text-base tablet:text-lg mt-1">{language.nativeName}</p>
                <p className="mt-6 text-lg text-slate-600 text-center max-w-2xl dark:text-slate-400">
                    Paste a word list or a paragraph to generate flashcards — translations are looked up
                    from your {language.label} Excel word list automatically.
                </p>

                <InputFunction lang={lang} />

                <div className="mt-14 grid phone:grid-cols-1 tablet:grid-cols-3 gap-6 w-full max-w-4xl">
                    <SectionCard href={`/${lang}/lessons`} title="Lessons" subtitle="Quiz yourself from your Excel word lists" />
                    <SectionCard href={`/${lang}/collection`} title="Collection" subtitle="Your saved flashcard decks" />
                    <SectionCard href={`/${lang}/notes`} title="Notes" subtitle="Write and save study notes" />
                </div>
            </main>
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