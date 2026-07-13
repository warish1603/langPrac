import Dexie from 'dexie';

const db = new Dexie('lingo-helper-db');

db.version(1).stores({
   decks: '++id, title'
});

// v2 adds generatorLessons: custom quiz rules layered on top of a lesson,
// e.g. { title, type: 'number_range', config: { min, max, targetLanguage, questionCount } }
db.version(2).stores({
   decks: '++id, title',
   generatorLessons: '++id, title, type'
});

// v3 adds a `lang` field (language section slug, e.g. "kikuyu"/"xhosa") to
// both stores so decks and custom quizzes can be scoped per language.
// Existing rows without a lang are treated as "kikuyu" for backwards
// compatibility with decks/quizzes created before languages were split out.
db.version(3).stores({
   decks: '++id, title, lang',
   generatorLessons: '++id, title, type, lang'
}).upgrade(tx => {
   return Promise.all([
      tx.table('decks').toCollection().modify(deck => {
         if (!deck.lang) deck.lang = 'kikuyu'
      }),
      tx.table('generatorLessons').toCollection().modify(lesson => {
         if (!lesson.lang) lesson.lang = 'kikuyu'
      })
   ])
});

export const addGeneratorLesson = async (lang, title, type, config) => {
   try {
       await db.open()
       return await db.generatorLessons.add({ lang, title, type, config })
   } catch (error) {
       console.log(error);
   }
}

export const getAllGeneratorLessons = async (lang) => {
   try {
       await db.open()
       return await db.generatorLessons.where('lang').equals(lang).toArray()
   } catch (error) {
       console.log(error);
   }
}

export const getGeneratorLesson = async (id) => {
   try {
       await db.open()
       return await db.generatorLessons.get(Number.parseInt(id))
   } catch (error) {
       console.log(error);
   }
}

export const deleteGeneratorLesson = async (id) => {
   try {
       await db.open()
       return await db.generatorLessons.delete(id)
   } catch (error) {
       console.log(error);
   }
}

export const addDeck = async (data, title, lang) => {
   // useCallback to add the loading page instead of using useState
   try {
       // Add the new friend!
       await db.open()
       return await db.decks.add({
           title,
           data,
           lang
       })
   } catch (error) {
       console.log(error);
   }
}

export const deleteDeck = async (id) => {
    try {
        await db.open() 
        return await db.decks.delete(id)
    } catch (error) {
        console.log(error);
    }
 }

export const getAllDecks = async (lang) => {
   try {
       await db.open()
       return await db.decks.where('lang').equals(lang).toArray(arr => arr.map(el => ({
           id: el.id,
           title: el.title
       })))
   } catch (error) {
       console.log(error);
   }
}

export const getDeck = async (id) => {
    try {
        await db.open() 
        return await db.decks.get(Number.parseInt(id))
    } catch (error) {
        console.log(error);
    }
 }

 export const updateDeck = async (id, newTitle, changes) => {
    try {
        await db.open() 
        return await db.decks.where("id").equals(Number.parseInt(id)).modify({
            title: newTitle, 
            data: changes 
        })
    } catch (error) {
        console.log(error);
    }
 }

export default db 
