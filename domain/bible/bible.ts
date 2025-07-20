export interface BibleInfo {
  bookName?: string
  bookCode: string
  chapter: number
  lang?: string
  bookCodeByLang?: any
  otherLang?: string
}

export interface BibleVerse {
  verse: number
  content: string
}
