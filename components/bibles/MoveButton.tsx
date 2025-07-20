import { BibleInfo } from "@/domain/bible/bible"
import Link from "next/link"

interface Props {
  bibleInfo: BibleInfo
  direction: "prev" | "next"
}

function MoveButton({ bibleInfo, direction }: Props) {
  return (
    <Link
      href={`/bibles/${bibleInfo.bookCode}.${
        direction === "prev" ? bibleInfo.chapter - 1 : bibleInfo.chapter + 1
      }.${bibleInfo.lang}.${bibleInfo.otherLang || ""}`}
      replace
      className="p-2 rounded-full bg-white shadow"
      style={{ pointerEvents: "auto" }}
      aria-label={direction}
    >
      <span style={{ fontSize: 64 }} className="dark:text-white">
        {direction === "prev" ? <>&larr;</> : <>&rarr;</>}
      </span>
    </Link>
  )
}

export default MoveButton
