"use server"

import bibleService, { getBookName } from "@/api/bible"
import BibleSearchForm from "@/components/bibles/BibleSearchForm"
import BibleView from "@/components/bibles/BibleView"
import MoveButton from "@/components/bibles/MoveButton"
import { BibleInfo } from "@/domain/bible/bible"
import { setCookie } from "@/utils/cookie"
import { cookies } from "next/headers"
import Link from "next/link"

async function Page({ params }: { params: Promise<{ bibleParams: string }> }) {
  const { bibleParams } = await params

  const cookieStore = await cookies()

  setCookie("bibleParams", bibleParams, {
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30days
  })

  const fontSize = cookieStore.get("fontSize")

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
    <>
      <h1 className="hidden">
        {currentBibleInfo?.bookName} {currentBibleInfo?.chapter}장
      </h1>
      <div className="flex justify-between">
        <div className="hidden md:block content-center p-20 transition-opacity duration-200 opacity-0 hover:opacity-80">
          <MoveButton bibleInfo={currentBibleInfo} direction="prev" />
        </div>
        <div className="flex flex-col gap-4 pt-5">
          <div className="sticky top-0 bg-white z-10">
            <BibleSearchForm
              bibleInfo={currentBibleInfo}
              otherLang={otherLang}
            />
          </div>
          <div className="overflow-y-auto max-h-[calc(100vh-200px)] mx-auto lg:w-[70%] md:w-[90%] sm:w-[90%]">
            <BibleView
              bible={bibleData}
              bible2={bibleData2}
              fontSize={fontSize?.value ? Number(fontSize.value) : 20}
            />
          </div>
        </div>
        <div className="content-center hidden md:block p-20 transition-opacity duration-200 opacity-0 hover:opacity-80">
          <MoveButton bibleInfo={currentBibleInfo} direction="next" />
        </div>
      </div>
    </>
  )
}

export default Page
