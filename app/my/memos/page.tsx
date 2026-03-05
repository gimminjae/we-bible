"use client"

import Link from "next/link"
import { addMemoWithoutVerse, getAllMemos } from "@/utils/local-db"
import { formatDateTime } from "@/utils/format"
import { useI18n } from "@/utils/i18n"
import { useMemo, useState } from "react"

export default function MemosPage() {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [version, setVersion] = useState(0)
  const rows = useMemo(() => getAllMemos(), [version])

  const handleCreate = () => {
    addMemoWithoutVerse({ title, content })
    setTitle("")
    setContent("")
    setOpen(false)
    setVersion((v) => v + 1)
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{t("my.memos")}</h1>
        <button type="button" className="btn btn-sm btn-primary" onClick={() => setOpen(true)}>
          {t("my.writeMemo")}
        </button>
      </div>
      {!rows.length ? (
        <div className="rounded-xl border border-base-300 bg-base-100 p-4 text-sm text-base-content/60">
          {t("my.emptyMemos")}
        </div>
      ) : (
        <ul className="space-y-2">
          {rows.map((row) => (
            <li key={row.id} className="rounded-xl border border-base-300 bg-base-100 p-3">
              <Link href={`/my/memo/${row.id}`} className="block">
                <div className="text-xs text-base-content/60">{formatDateTime(row.createdAt)}</div>
                <div className="mt-1 font-semibold">{row.title || "(Untitled)"}</div>
                <p className="mt-1 line-clamp-2 whitespace-pre-wrap text-sm text-base-content/80">
                  {row.content || row.verseText}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {open ? (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="text-lg font-bold">{t("my.writeMemo")}</h3>
            <div className="mt-3 space-y-2">
              <input
                className="input input-bordered w-full"
                placeholder={t("my.planName")}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <textarea
                className="textarea textarea-bordered h-36 w-full"
                placeholder={t("bible.memoContentPlaceholder")}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
            <div className="modal-action">
              <button type="button" className="btn" onClick={() => setOpen(false)}>
                {t("common.cancel")}
              </button>
              <button type="button" className="btn btn-primary" onClick={handleCreate}>
                {t("common.save")}
              </button>
            </div>
          </div>
        </dialog>
      ) : null}
    </section>
  )
}
