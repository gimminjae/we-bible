"use client"

import { BreadCrumb } from "@/components/common"
import { useEffect, useState } from "react"
import DrawerComponent from "@/components/common/Drawer"
import { BibleInfo } from "@/domain/bible/bible"
import { useRouter } from "next/navigation"

interface Props {
  bibleInfo: BibleInfo
  otherLang?: string
}

function BibleSearchForm({ bibleInfo, otherLang }: Props) {
  const router = useRouter()

  const [isOpenBook, setIsOpenBook] = useState(false)
  const [isOpenChapter, setIsOpenChapter] = useState(false)
  const [isOpenLang, setIsOpenLang] = useState(false)
  const [isOpenOtherLang, setIsOpenOtherLang] = useState(false)

  const handleOpenBook = () => {
    setIsOpenBook(true)
  }

  const handleOpenChapter = () => {
    setIsOpenChapter(true)
  }

  const handleOpenLang = () => {
    setIsOpenLang(true)
  }

  const handleOpenOtherLang = () => {
    setIsOpenOtherLang(true)
  }

  const [lang, setLang] = useState<string>(bibleInfo.lang || "none")

  const [otherLangState, setOtherLangState] = useState<string>(otherLang || "none")

  const changeLangs = () => {
    router.replace(
      `/bibles/${bibleInfo.bookCode}.${bibleInfo.chapter}.${lang}.${otherLangState}`
    )
  }

  const txtOfLang = {
    ko: "한국어 (개역한글)",
    en: "English (King James Version of the Holy Bible)",
    de: "German (1912 Luther Bible with Strong's numbers)",
    none: "선택안함"
  }

  useEffect(changeLangs, [lang, otherLangState])

  return (
    <>
      <div className="xl:flex justify-center whitespace-nowrap items-center gap-y-4 bg-gray-100 rounded-lg px-5 py-3 dark:bg-gray-400">
        <div className="flex justify-center">
          <BreadCrumb
            breadCrumbs={[
              {
                text: bibleInfo.bookName || "",
                action: handleOpenBook,
              },
              {
                text: `${bibleInfo.chapter} 장`,
                action: handleOpenChapter,
              },
            ]}
          />
        </div>
        <div className="flex justify-center">
          <BreadCrumb
            breadCrumbs={[
              {
                text: txtOfLang[lang as keyof typeof txtOfLang] || "",
                action: handleOpenLang,
              },
            ]}
          />
        </div>
        <div className="flex justify-center">
          <BreadCrumb
            breadCrumbs={[
              {
                text: txtOfLang[otherLangState as keyof typeof txtOfLang] || "",
                action: handleOpenOtherLang,
              },
            ]}
          />
        </div>
      </div>
      <DrawerComponent
        isOpen={isOpenBook}
        setIsOpen={setIsOpenBook}
        items={[
          <span>{txtOfLang.ko}1</span>,
          <span>{txtOfLang.en}</span>,
          <span>{txtOfLang.de}</span>,
        ]}
      />
      <DrawerComponent
        isOpen={isOpenChapter}
        setIsOpen={setIsOpenChapter}
        items={[
          <span>{txtOfLang.ko}2</span>,
          <span>{txtOfLang.en}</span>,
          <span>{txtOfLang.de}</span>,
        ]}
      />
      <DrawerComponent
        isOpen={isOpenLang}
        setIsOpen={setIsOpenLang}
        items={[
          <div onClick={() => setLang("ko")}>{txtOfLang.ko}</div>,
          <div onClick={() => setLang("en")}>{txtOfLang.en}</div>,
          <div onClick={() => setLang("de")}>{txtOfLang.de}</div>,
        ]}
      />
      <DrawerComponent
        isOpen={isOpenOtherLang}
        setIsOpen={setIsOpenOtherLang}
        items={[
          <div onClick={() => setOtherLangState("ko")}>{txtOfLang.ko}</div>,
          <div onClick={() => setOtherLangState("en")}>{txtOfLang.en}</div>,
          <div onClick={() => setOtherLangState("de")}>{txtOfLang.de}</div>,
        ]}
      />
    </>
  )
}

export default BibleSearchForm
