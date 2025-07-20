import { useCustomQuery } from "./useCustomQuery"
import bibleService, { getBookName, versions } from "../api/bible"

interface UseBibleProps {
  bookCode: string
  chapter: number
  lang?: string
}

export interface BibleData {
  verses: any[]
  error: Error | null
  isLoading: boolean
}

interface UseBibleReturn {
  versions: typeof versions
  bibleData: BibleData
  refetch: () => void
  getBookName: typeof getBookName
}

const useBible = ({
  bookCode,
  chapter,
  lang,
}: UseBibleProps): UseBibleReturn => {
  const { data, error, isLoading, refetch } = useCustomQuery<any, Error>({
    key: `bible-${bookCode}-${chapter}-${lang}`,
    queryFn: () =>
      bibleService.getBible({ bookCode, chapter, lang, bookCodeByLang: {} }),
  })

  const bibleData = {
    verses: data || [],
    error,
    isLoading,
  }

  return {
    versions: versions,
    bibleData,
    refetch,
    getBookName,
  }
}

export default useBible
