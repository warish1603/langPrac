import Link from "next/link"
import Image from "next/image"
import { LANGUAGE_LIST, getLanguage } from "../lib/languages"

function Header({ lang }) {
    const language = lang ? getLanguage(lang) : null

    return (
        <header className="flex flex-col desktop:flex-row items-center justify-between py-4 phone:py-6 gap-3 desktop:gap-4">
            <Link href="/">
                <a className="flex-shrink-0">
                    <Image src="/study-studio-logo.png" alt="Study Studio logo" width={160} height={40} />
                </a>
            </Link>

            <nav className="flex flex-wrap justify-center items-center gap-x-1 gap-y-1">
                <Link href="/">
                    <a className="p-2 rounded text-black hover:bg-gray-200 hover:text-green-700 transition-colors duration-300 text-sm phone:text-base">Home</a>
                </Link>
                {language && (
                    <>
                        <Link href={`/${lang}`}>
                            <a className="p-2 rounded text-black hover:bg-gray-200 hover:text-green-700 transition-colors duration-300 text-sm phone:text-base">{language.label}</a>
                        </Link>
                        <Link href={`/${lang}/lessons`}>
                            <a className="p-2 rounded text-black hover:bg-gray-200 hover:text-green-700 transition-colors duration-300 text-sm phone:text-base">Lessons</a>
                        </Link>
                        <Link href={`/${lang}/collection`}>
                            <a className="p-2 rounded text-black hover:bg-gray-200 hover:text-green-700 transition-colors duration-300 text-sm phone:text-base">Collection</a>
                        </Link>
                        <Link href={`/${lang}/notes`}>
                            <a className="p-2 rounded text-black hover:bg-gray-200 hover:text-green-700 transition-colors duration-300 text-sm phone:text-base">Notes</a>
                        </Link>
                    </>
                )}
            </nav>

            {LANGUAGE_LIST.length > 0 && (
                <div className="flex gap-2 flex-shrink-0 flex-wrap justify-center">
                    {LANGUAGE_LIST.map((l) => (
                        <Link key={l.slug} href={`/${l.slug}`}>
                            <a className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors duration-300 ${
                                l.slug === lang
                                    ? `${l.accent} text-white border-transparent`
                                    : 'text-gray-600 border-gray-300 hover:bg-gray-100'
                            }`}>
                                {l.label}
                            </a>
                        </Link>
                    ))}
                </div>
            )}
        </header>
    )
}

export default Header
