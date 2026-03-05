"use client"

import { bibleInfos } from "@/api/bible"
import { BibleInfo } from "@/domain/bible/bible"
import { getBibleSearchInfo, setBibleSearchInfo } from "@/utils/local-db"
import { useI18n } from "@/utils/i18n"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"

interface Props {
  bibleInfo: BibleInfo
  otherLang?: string
}

function BibleSearchForm({ bibleInfo, otherLang }: Props) {
  const router = useRouter()
  const { t } = useI18n()
  const [bookCode, setBookCode] = useState<string>(bibleInfo.bookCode)
  const [chapter, setChapter] = useState<number>(bibleInfo.chapter)
  const [lang, setLang] = useState<string>(bibleInfo.lang || "ko")
  const [otherLangState, setOtherLangState] = useState<string>(otherLang || "none")
  const [fontScale, setFontScale] = useState<number>(16)
  const [bookDrawerOpen, setBookDrawerOpen] = useState(false)
  const [languageDrawerOpen, setLanguageDrawerOpen] = useState(false)
  const [fontDrawerOpen, setFontDrawerOpen] = useState(false)
  const [testament, setTestament] = useState<"ot" | "nt">("ot")

  const currentBook = useMemo(
    () => bibleInfos.find((book) => book.bookCode === bookCode),
    [bookCode]
  )
  const maxChapter = currentBook?.maxChapter || 1
  const filteredBooks = useMemo(
    () =>
      bibleInfos.filter((book) => {
        if (book.bookSeq < 1 || book.bookSeq > 66) return false
        return testament === "ot" ? book.bookSeq <= 39 : book.bookSeq >= 40
      }),
    [testament]
  )
  const dualLang = otherLangState !== "none"
  const currentLanguageLabel =
    lang === "ko" ? "한국어" : lang === "en" ? "English" : "German"
  const currentBookLabel = `${currentBook?.bookName.ko ?? ""} ${chapter}`

  useEffect(() => {
    const saved = getBibleSearchInfo()
    const size = saved.fontScale || 16
    setFontScale(size)
    document.documentElement.style.setProperty("--font-size", `${size}px`)
    document.documentElement.style.setProperty("--verse-size", `${size + 5}px`)
  }, [])

  useEffect(() => {
    if (chapter > maxChapter) setChapter(maxChapter)
  }, [chapter, maxChapter])

  useEffect(() => {
    document.documentElement.style.setProperty("--font-size", `${fontScale}px`)
    document.documentElement.style.setProperty("--verse-size", `${fontScale + 5}px`)
    setBibleSearchInfo({
      bookCode,
      chapter,
      primaryLang: lang,
      secondaryLang: otherLangState,
      dualLang,
      fontScale,
    })
    router.replace(`/bibles/${bookCode}.${chapter}.${lang}.${otherLangState}`)
  }, [bookCode, chapter, lang, otherLangState, dualLang, fontScale, router])

  const applyFontScale = (size: number) => {
    const clamped = Math.max(12, Math.min(32, size))
    setFontScale(clamped)
  }

  return (
    <>
      <div className="flex items-center gap-2 rounded-xl border border-base-300 bg-base-100 p-2">
        <button
          type="button"
          className="btn btn-sm flex-1 justify-between rounded-xl text-left text-sm font-semibold"
          onClick={() => setBookDrawerOpen(true)}
        >
          <span>{currentBookLabel}</span>
          <span>▾</span>
        </button>
        <button
          type="button"
          className="btn btn-sm flex-1 justify-between rounded-xl text-left text-sm font-semibold"
          onClick={() => setLanguageDrawerOpen(true)}
        >
          <span>{currentLanguageLabel}</span>
          <span>▾</span>
        </button>
        <button
          type="button"
          className="btn btn-sm rounded-xl px-4 text-sm font-semibold"
          onClick={() => setFontDrawerOpen(true)}
        >
          Tt
        </button>
      </div>

      {bookDrawerOpen ? (
        <dialog className="modal modal-open modal-bottom sm:modal-middle">
          <div className="modal-box max-w-xl rounded-t-2xl sm:rounded-2xl">
            <h3 className="text-base font-bold">{t("bible.book")}</h3>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                className={`btn btn-sm ${testament === "ot" ? "btn-primary" : "btn-outline"}`}
                onClick={() => setTestament("ot")}
              >
                구약
              </button>
              <button
                type="button"
                className={`btn btn-sm ${testament === "nt" ? "btn-primary" : "btn-outline"}`}
                onClick={() => setTestament("nt")}
              >
                신약
              </button>
            </div>
            <div className="mt-3 max-h-56 overflow-y-auto rounded-lg border border-base-300 p-2">
              <div className="grid grid-cols-2 gap-2">
                {filteredBooks.map((book) => (
                  <button
                    key={book.bookCode}
                    type="button"
                    className={`btn btn-sm justify-start ${bookCode === book.bookCode ? "btn-primary" : "btn-outline"
                      }`}
                    onClick={() => {
                      setBookCode(book.bookCode)
                      setChapter(1)
                    }}
                  >
                    {book.bookName.ko}
                  </button>
                ))}
              </div>
            </div>
            <h4 className="mt-4 text-sm font-semibold">{t("bible.chapter")}</h4>
            <div className="mt-2 grid grid-cols-5 gap-2">
              {Array.from({ length: maxChapter }).map((_, idx) => (
                <button
                  key={idx + 1}
                  type="button"
                  className={`btn btn-sm ${chapter === idx + 1 ? "btn-primary" : "btn-outline"}`}
                  onClick={() => setChapter(idx + 1)}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
            <div className="modal-action">
              <button type="button" className="btn" onClick={() => setBookDrawerOpen(false)}>
                {t("common.cancel")}
              </button>
              <button type="button" className="btn btn-primary" onClick={() => setBookDrawerOpen(false)}>
                {t("common.save")}
              </button>
            </div>
          </div>
        </dialog>
      ) : null}

      {languageDrawerOpen ? (
        <dialog className="modal modal-open modal-bottom sm:modal-middle">
          <div className="modal-box max-w-xl rounded-t-2xl sm:rounded-2xl">
            <h3 className="text-base font-bold">{t("bible.primaryLang")}</h3>
            <div className="mt-3 grid grid-cols-1 gap-2">
              {[
                { value: "ko", label: "한국어" },
                { value: "en", label: "English" },
                { value: "de", label: "German" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`btn justify-start ${lang === option.value ? "btn-primary" : "btn-outline"
                    }`}
                  onClick={() => setLang(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between rounded-lg border border-base-300 p-3">
              <span className="text-sm font-semibold">{t("bible.secondaryLang")}</span>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={dualLang}
                onChange={(e) => {
                  if (!e.target.checked) {
                    setOtherLangState("none")
                  } else if (otherLangState === "none") {
                    setOtherLangState(lang === "ko" ? "en" : "ko")
                  }
                }}
              />
            </div>

            {dualLang ? (
              <div className="mt-3 grid grid-cols-1 gap-2">
                {[
                  { value: "ko", label: "한국어" },
                  { value: "en", label: "English" },
                  { value: "de", label: "German" },
                ]
                  .filter((option) => option.value !== lang)
                  .map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`btn justify-start ${otherLangState === option.value
                          ? "btn-primary"
                          : "btn-outline"
                        }`}
                      onClick={() => setOtherLangState(option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
              </div>
            ) : null}

            <div className="modal-action">
              <button type="button" className="btn" onClick={() => setLanguageDrawerOpen(false)}>
                {t("common.cancel")}
              </button>
              <button type="button" className="btn btn-primary" onClick={() => setLanguageDrawerOpen(false)}>
                {t("common.save")}
              </button>
            </div>
          </div>
        </dialog>
      ) : null}

      {fontDrawerOpen ? (
        <dialog className="modal modal-open modal-bottom sm:modal-middle">
          <div className="modal-box max-w-xl rounded-t-2xl sm:rounded-2xl">
            <h3 className="text-base font-bold">Font Size</h3>
            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                className="btn btn-sm btn-outline"
                onClick={() => applyFontScale(fontScale - 1)}
              >
                A-
              </button>
              <input
                type="range"
                min={12}
                max={32}
                value={fontScale}
                onChange={(e) => applyFontScale(Number(e.target.value))}
                className="range range-primary flex-1"
              />
              <button
                type="button"
                className="btn btn-sm btn-outline"
                onClick={() => applyFontScale(fontScale + 1)}
              >
                A+
              </button>
            </div>
            <div className="mt-2 text-center text-sm text-base-content/70">{fontScale}px</div>
            <div className="modal-action">
              <button type="button" className="btn" onClick={() => setFontDrawerOpen(false)}>
                {t("common.cancel")}
              </button>
              <button type="button" className="btn btn-primary" onClick={() => setFontDrawerOpen(false)}>
                {t("common.save")}
              </button>
            </div>
          </div>
        </dialog>
      ) : null}
    </>
  )
}

export default BibleSearchForm
