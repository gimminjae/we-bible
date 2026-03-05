"use client"

import { BibleVerse } from "@/domain/bible/bible"
import {
  addMemo,
  getFavoritesForChapter,
  getMemoVerseNumbersForChapter,
  toggleFavorites,
} from "@/utils/local-db"
import { useI18n } from "@/utils/i18n"
import { useEffect, useMemo, useState } from "react"

interface Props {
  bible: BibleVerse[]
  bible2?: BibleVerse[]
  bookCode: string
  chapter: number
}

function BibleView({ bible, bible2, bookCode, chapter }: Props) {
  const { t } = useI18n()
  const [selectedVerses, setSelectedVerses] = useState<number[]>([])
  const [favoriteSet, setFavoriteSet] = useState<Set<number>>(new Set())
  const [memoSet, setMemoSet] = useState<Set<number>>(new Set())
  const [memoOpen, setMemoOpen] = useState(false)
  const [memoTitle, setMemoTitle] = useState("")
  const [memoContent, setMemoContent] = useState("")

  const selectedRows = useMemo(
    () => bible.filter((row) => selectedVerses.includes(row.verse)),
    [bible, selectedVerses]
  )

  useEffect(() => {
    setFavoriteSet(new Set(getFavoritesForChapter(bookCode, chapter)))
    setMemoSet(new Set(getMemoVerseNumbersForChapter(bookCode, chapter)))
    setSelectedVerses([])
  }, [bookCode, chapter])

  const toggleSelect = (verse: number) => {
    setSelectedVerses((prev) =>
      prev.includes(verse) ? prev.filter((v) => v !== verse) : [...prev, verse].sort((a, b) => a - b)
    )
  }

  const copySelected = async () => {
    const text = selectedRows.map((row) => `${row.verse}. ${row.content}`).join("\n")
    if (!text) return
    await navigator.clipboard.writeText(text)
    setSelectedVerses([])
  }

  const toggleFavoriteSelected = () => {
    if (!selectedRows.length) return
    const result = toggleFavorites(
      bookCode,
      chapter,
      selectedRows.map((row) => ({ verse: row.verse, text: row.content }))
    )
    setFavoriteSet(new Set(getFavoritesForChapter(bookCode, chapter)))
    setSelectedVerses([])
    if (!result.added) return
  }

  const openMemoWithPrefill = () => {
    if (!selectedRows.length) return
    const quote = selectedRows.map((row) => `${row.verse}. ${row.content}`).join("\n")
    setMemoContent((prev) => (prev ? prev : quote))
    setMemoOpen(true)
  }

  const saveMemo = () => {
    const quote = selectedRows.map((row) => `${row.verse}. ${row.content}`).join("\n")
    addMemo({
      title: memoTitle,
      content: memoContent,
      verseText: quote,
      bookCode,
      chapter,
      verses: selectedRows.map((row) => row.verse),
    })
    setMemoSet(new Set(getMemoVerseNumbersForChapter(bookCode, chapter)))
    setMemoTitle("")
    setMemoContent("")
    setMemoOpen(false)
    setSelectedVerses([])
    window.alert(t("bible.memoSaved"))
  }

  return (
    <div className="pb-2">
      <ul className="space-y-1">
        {bible?.map((verse: BibleVerse, index: number) => {
          const selected = selectedVerses.includes(verse.verse)
          const isFavorite = favoriteSet.has(verse.verse)
          const hasMemo = memoSet.has(verse.verse)
          return (
            <li key={`${verse.verse}-${index}`}>
              <button
                type="button"
                onClick={() => toggleSelect(verse.verse)}
                className={`w-full rounded-lg px-2 py-2 text-left transition ${
                  selected ? "bg-primary/15" : "hover:bg-base-200"
                }`}
              >
                <div className="flex gap-2">
                  <div className="w-10 shrink-0 text-center text-sm font-semibold text-base-content/60">
                    <div>{verse.verse}</div>
                    <div className="h-4">{isFavorite ? <span>♥</span> : null}</div>
                    </div>
                  <div className="min-w-0 flex-1">
                    <p className="leading-relaxed" style={{ fontSize: "var(--font-size)" }}>
                      {verse.content}
                    </p>
                    {bible2 ? (
                      <p
                        className="leading-relaxed text-base-content/70"
                        style={{ fontSize: "var(--font-size)" }}
                      >
                        {bible2[index]?.content}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex w-10 shrink-0 flex-col items-center justify-center text-xs text-base-content/60">
                    {hasMemo ? <span>✎</span> : null}
                  </div>
                </div>
              </button>
            </li>
          )
        })}
      </ul>

      {selectedVerses.length ? (
        <div className="sticky bottom-20 z-20 mt-3 rounded-2xl border border-base-300 bg-base-100 p-3 shadow md:bottom-4">
          <div className="mb-2 text-center text-sm text-base-content/70">
            {t("bible.selectedCount", { count: selectedVerses.length })}
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button type="button" className="btn btn-outline btn-sm" onClick={copySelected}>
              {t("bible.copy")}
            </button>
            <button type="button" className="btn btn-outline btn-sm" onClick={toggleFavoriteSelected}>
              {selectedRows.every((row) => favoriteSet.has(row.verse))
                ? t("bible.unfavorite")
                : t("bible.favorite")}
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={openMemoWithPrefill}>
              {t("bible.memo")}
            </button>
          </div>
        </div>
      ) : null}

      {memoOpen ? (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="mb-3 text-lg font-bold">{t("bible.memoTitle")}</h3>
            <input
              className="input input-bordered mb-2 w-full"
              placeholder={t("bible.memoTitlePlaceholder")}
              value={memoTitle}
              onChange={(e) => setMemoTitle(e.target.value)}
            />
            <textarea
              className="textarea textarea-bordered h-40 w-full"
              placeholder={t("bible.memoContentPlaceholder")}
              value={memoContent}
              onChange={(e) => setMemoContent(e.target.value)}
              autoFocus
            />
            <div className="modal-action">
              <button type="button" className="btn" onClick={() => setMemoOpen(false)}>
                {t("common.cancel")}
              </button>
              <button type="button" className="btn btn-primary" onClick={saveMemo}>
                {t("common.save")}
              </button>
            </div>
          </div>
        </dialog>
      ) : null}
    </div>
  )
}

export default BibleView
