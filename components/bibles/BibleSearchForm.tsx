"use client"

import { BreadCrumb, SelectBox } from "@/components/common"
import { useEffect, useState } from "react"
import DrawerComponent from "@/components/common/Drawer"
import Link from "next/link"
import { BibleInfo } from "@/domain/bible/bible"
import { useRouter } from "next/navigation"

interface Props {
  bibleInfo: BibleInfo
  otherLang?: string
}

function BibleSearchForm({ bibleInfo, otherLang }: Props) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const handleOpen = () => {
    setIsOpen(true)
  }

  const [lang, setLang] = useState<string>(otherLang || "")

  const handleLangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLang(e.target.value)
  }

  useEffect(() => {
    router.replace(
      `/bibles/${bibleInfo.bookCode}.${bibleInfo.chapter}.${bibleInfo.lang}.${lang}`
    )
  }, [lang])

  return (
    <div className="flex justify-center items-center gap-4">
      <BreadCrumb
        breadCrumbs={[
          {
            text: bibleInfo.bookName || "",
            action: handleOpen,
          },
          {
            text: `${bibleInfo.chapter} 장`,
            action: handleOpen,
          },
        ]}
      />
      <SelectBox
        sizing="md"
        options={[
          { val: "ko", txt: "한글" },
          { val: "en", txt: "영어" },
          { val: "de", txt: "독일어" },
        ]}
        id="lang"
        onChange={handleLangChange}
        value={lang}
      />
      <DrawerComponent isOpen={isOpen} setIsOpen={setIsOpen} />
    </div>
  )
}

export default BibleSearchForm
