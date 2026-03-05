import bibleService, { getBookName } from "@/api/bible"
import BibleSearchForm from "@/components/bibles/BibleSearchForm"
import BibleView from "@/components/bibles/BibleView"
import MoveButton from "@/components/bibles/MoveButton"
import { BibleInfo } from "@/domain/bible/bible"

async function Page({ params }: { params: Promise<{ bibleParams: string }> }) {
  const { bibleParams } = await params

  const arr = bibleParams.split(".")

  const bibleSearchParams = (): BibleInfo => {
    return {
      bookCode: arr[0],
      chapter: Number(arr[1]),
      lang: arr[2] || "ko",
    }
  }

  const otherLang = arr[3]

  const currentBibleInfo: BibleInfo = {
    bookName: getBookName(
      bibleSearchParams().bookCode,
      bibleSearchParams().lang!
    ),
    bookCode: bibleSearchParams().bookCode,
    chapter: Number(bibleSearchParams().chapter),
    lang: bibleSearchParams().lang,
    otherLang: otherLang,
  }

  const bibleData = await bibleService.getBible(bibleSearchParams())

  const bibleData2 = otherLang
    ? await bibleService.getBible({
      ...bibleSearchParams(),
      lang: otherLang,
    })
    : undefined

  return (
    <section>
      <h1 className="mb-3 text-lg font-bold">
        {currentBibleInfo?.bookName} {currentBibleInfo?.chapter}장
      </h1>
      <div className="flex items-start justify-between gap-2">
        <div className="hidden md:block content-center pt-32">
          <MoveButton bibleInfo={currentBibleInfo} direction="prev" />
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <div className="sticky top-16 z-30 bg-base-100 py-2 md:top-20">
            <BibleSearchForm
              bibleInfo={currentBibleInfo}
              otherLang={otherLang}
            />
          </div>
          <div className="rounded-2xl border border-base-300 bg-base-100">
            <BibleView
              bible={bibleData}
              bible2={bibleData2}
              bookCode={currentBibleInfo.bookCode}
              chapter={currentBibleInfo.chapter}
            />
          </div>
        </div>
        <div className="hidden md:block content-center pt-32">
          <MoveButton bibleInfo={currentBibleInfo} direction="next" />
        </div>
      </div>
    </section>
  )
}

export default Page
