import { create } from "zustand"
import { getCookie } from "@/utils/cookie"
import { bibleInfos } from "@/api/bible"

type BibleSearchParam = {
  bookCode: string
  chapter: number
  lang: "ko" | "en" | "de" | string
  secondLang: "ko" | "en" | "de" | string
  fontSize: number
  viewMode: "single" | "double"
}
type Store = {
  searchParam: BibleSearchParam
  set: any
  next: any
  previous: any
  changeLang: any
  changeFontSize: any
  changeViewMode: any
  changeSecondLang: any
}

const initialValue = {
  bookCode: "genesis",
  chapter: 1,
  lang: "ko",
  secondLang: "en",
  fontSize: 20,
  viewMode: "single",
}

const getPreviousBookCode = (bookCode: string) =>
  bibleInfos[bibleInfos.findIndex((bible) => bible.bookCode === bookCode) - 1]
const getNextBookCode = (bookCode: string) =>
  bibleInfos[bibleInfos.findIndex((bible) => bible.bookCode === bookCode) + 1]
const getPresentBible = (bookCode: string) =>
  bibleInfos.find((info) => info.bookCode === bookCode)

const bibleSearchParamFromCookie = getCookie("bibleSearchParam")

const useBibleSearchParams = create<Store>((set: any) => ({
  searchParam: bibleSearchParamFromCookie || initialValue,
  next: () =>
    set(({ searchParam: state }: { searchParam: BibleSearchParam }) => {
      const bible = getPresentBible(state.bookCode)
      const newChapter = state.chapter + 1
      if (bible?.bookSeq === 66 && newChapter === 23)
        return {
          searchParam: state,
        }
      return (bible?.maxChapter || 0) < newChapter
        ? {
            searchParam: {
              ...state,
              bookCode: getNextBookCode(state.bookCode).bookCode,
              chapter: 1,
            },
          }
        : {
            searchParam: {
              ...state,
              chapter: newChapter,
            },
          }
    }),
  previous: () =>
    set(({ searchParam: state }: { searchParam: BibleSearchParam }) => {
      const previousBible = getPreviousBookCode(state.bookCode)
      const newChapter = state.chapter - 1
      return previousBible?.bookSeq === 0 && newChapter === 0
        ? {
            searchParam: state,
          }
        : {
            searchParam: {
              ...state,
              bookCode: !newChapter ? previousBible.bookCode : state.bookCode,
              chapter: newChapter || previousBible.maxChapter,
            },
          }
    }),
  set: (bookCode: string, chapter: number) =>
    set(({ searchParam: state }: { searchParam: BibleSearchParam }) => ({
      searchParam: {
        ...state,
        bookCode,
        chapter,
      },
    })),
  changeLang: (lang: string) =>
    set(({ searchParam: state }: { searchParam: BibleSearchParam }) => ({
      searchParam: {
        ...state,
        lang,
      },
    })),
  changeSecondLang: (secondLang: string) =>
    set(({ searchParam: state }: { searchParam: BibleSearchParam }) => ({
      searchParam: {
        ...state,
        secondLang,
      },
    })),
  changeViewMode: (viewMode: string) =>
    set(({ searchParam: state }: { searchParam: BibleSearchParam }) => ({
      searchParam: {
        ...state,
        viewMode,
      },
    })),
  changeFontSize: (size: number) =>
    set(({ searchParam: state }: { searchParam: BibleSearchParam }) => ({
      searchParam: {
        ...state,
        fontSize: size,
      },
    })),
}))

export default useBibleSearchParams
