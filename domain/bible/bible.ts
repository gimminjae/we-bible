

export interface BibleInfo {
  bookCode: string
  chapter: number
  lang?: string
  bookCodeByLang: Record<string, string>
}
