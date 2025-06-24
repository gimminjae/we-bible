"use client"

import { BreadCrumb } from "@/components/common"
import useBible from "@/hooks/useBible"
import useBibleSearchParams from "@/store/zustand/BibleSearchParams"
import browserUtil from "@/utils/browser.util"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

function Page() {
  const searchParams = useSearchParams()

  const bibleSearchParams = useBibleSearchParams((state) => state.searchParam)

  const { bibleData, refetch, getBookName } = useBible({
    bookCode: bibleSearchParams.bookCode,
    chapter: bibleSearchParams.chapter,
    lang: bibleSearchParams.lang,
  })

  useEffect(() => {
    console.log("bibleData: ", bibleData)
  }, [bibleData])

  useEffect(() => {
    browserUtil.updateUrl({
      bookCode: bibleSearchParams.bookCode,
      chapter: bibleSearchParams.chapter,
      lang: bibleSearchParams.lang,
    })
  }, [bibleSearchParams])

  const currentBibleInfo = {
    bookName: getBookName(
      bibleSearchParams.bookCode,
      bibleSearchParams.lang || "ko"
    ),
    chapter: bibleSearchParams.chapter,
  }

  return (
    <>
      <h1 className="hidden">{currentBibleInfo?.bookName} {currentBibleInfo?.chapter}장</h1>
      <div className="flex flex-col gap-4">
        <div className="flex justify-center items-center">
          <BreadCrumb
            breadCrumbs={[
              {
                text: currentBibleInfo.bookName,
                action: () => {},
              },
              {
                text: `${currentBibleInfo.chapter} 장`,
                action: () => {},
              },
            ]}
          />
        </div>
        <div className="mx-auto w-[60%]">
          <ul>
            {bibleData.verses.map((verse) => (
              <li key={verse.verse}>
                {verse.verse} {verse.content}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  )
}

export default Page
