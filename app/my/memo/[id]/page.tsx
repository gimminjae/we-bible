"use client"

import { useRouter } from "next/navigation"
import { deleteMemo, getMemoById, updateMemo } from "@/utils/local-db"
import { formatDateTime } from "@/utils/format"
import { useI18n } from "@/utils/i18n"
import { useMemo, useState } from "react"

export default function MemoDetailPage({ params }: { params: { id: string } }) {
  const { t } = useI18n()
  const router = useRouter()
  const id = Number(params.id)
  const [editing, setEditing] = useState(false)
  const [version, setVersion] = useState(0)
  const memo = useMemo(() => getMemoById(id), [id, version])
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")

  if (!memo) return <div className="text-sm text-base-content/60">Not found</div>

  const openEdit = () => {
    setTitle(memo.title)
    setContent(memo.content)
    setEditing(true)
  }

  const handleSave = () => {
    updateMemo(memo.id, title, content)
    setEditing(false)
    setVersion((v) => v + 1)
  }

  const handleDelete = () => {
    deleteMemo(memo.id)
    router.replace("/my/memos")
  }

  return (
    <section className="space-y-4">
      <button type="button" className="btn btn-ghost btn-sm" onClick={() => router.back()}>
        {t("common.back")}
      </button>
      <div className="rounded-xl border border-base-300 bg-base-100 p-4">
        <h1 className="text-lg font-bold">{memo.title || "(Untitled)"}</h1>
        <div className="mt-1 text-xs text-base-content/60">{formatDateTime(memo.createdAt)}</div>
        {memo.verseText ? (
          <pre className="mt-3 whitespace-pre-wrap rounded-lg bg-base-200 p-2 text-xs">
            {memo.verseText}
          </pre>
        ) : null}
        <p className="mt-3 whitespace-pre-wrap text-sm">{memo.content || "-"}</p>
        <div className="mt-3 flex justify-end gap-2">
          <button type="button" className="btn btn-sm btn-outline" onClick={openEdit}>
            {t("common.edit")}
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline text-error"
            onClick={() => {
              if (!window.confirm(t("common.confirmDelete"))) return
              handleDelete()
            }}
          >
            {t("common.delete")}
          </button>
        </div>
      </div>

      {editing ? (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="text-lg font-bold">{t("my.memoDetail")}</h3>
            <div className="mt-3 space-y-2">
              <input
                className="input input-bordered w-full"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <textarea
                className="textarea textarea-bordered h-40 w-full"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
            <div className="modal-action">
              <button type="button" className="btn" onClick={() => setEditing(false)}>
                {t("common.cancel")}
              </button>
              <button type="button" className="btn btn-primary" onClick={handleSave}>
                {t("common.save")}
              </button>
            </div>
          </div>
        </dialog>
      ) : null}
    </section>
  )
}
