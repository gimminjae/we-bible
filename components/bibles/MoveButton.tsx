import { BibleInfo } from "@/domain/bible/bible"
import Link from "next/link"

interface Props {
  bibleInfo: BibleInfo
  direction: "prev" | "next"
}

function MoveButton({ bibleInfo, direction }: Props) {
  const nextChapter =
    direction === "prev" ? Math.max(1, bibleInfo.chapter - 1) : bibleInfo.chapter + 1

  return (
    <Link
      href={`/bibles/${bibleInfo.bookCode}.${nextChapter}.${bibleInfo.lang}.${bibleInfo.otherLang || "none"}`}
      replace
      className="btn btn-circle btn-outline"
      style={{ pointerEvents: "auto" }}
      aria-label={direction}
    >
      <span className="text-xl">
        {direction === "prev" ? <>&larr;</> : <>&rarr;</>}
      </span>
    </Link>
  )
}

export default MoveButton
