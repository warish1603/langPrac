// Central registry of every language section the app supports.
// To add a new language: add an entry here, drop an Excel workbook at
// data/excel/<slug>.xlsx (one sheet per lesson, columns Word | Translation
// | Language), and everything else (routes, lessons, quizzes, collection,
// notes) is generated automatically — no other code changes needed.

export const LANGUAGES = {
    kikuyu: {
        slug: 'kikuyu',
        label: 'Kikuyu',
        nativeName: 'Gĩkũyũ',
        isoCode: 'kik',
        excelFile: 'kikuyu.xlsx',
        accent: 'bg-emerald-700',
        accentHover: 'hover:bg-emerald-800',
        accentText: 'text-emerald-700',
        accentSoft: 'bg-emerald-50'
    },
    xhosa: {
        slug: 'xhosa',
        label: 'Xhosa',
        nativeName: 'isiXhosa',
        isoCode: 'xh',
        excelFile: 'xhosa.xlsx',
        accent: 'bg-orange-700',
        accentHover: 'hover:bg-orange-800',
        accentText: 'text-orange-700',
        accentSoft: 'bg-orange-50'
    }
}

export const LANGUAGE_LIST = Object.values(LANGUAGES)

export const isValidLanguage = (slug) => Object.prototype.hasOwnProperty.call(LANGUAGES, slug)

export const getLanguage = (slug) => LANGUAGES[slug]
