"use client"

import { useRouter } from "next/navigation"
import {
  addPrayerContent,
  deletePrayer,
  deletePrayerContent,
  getPrayerById,
  updatePrayer,
  updatePrayerContent,
} from "@/utils/local-db"
import { formatDateTime } from "@/utils/format"
import { useI18n } from "@/utils/i18n"
import { useMemo, useState } from "react"

export default function PrayerDetailPage({ params }: { params: { id: string } }) {
  const { t } = useI18n()
  const router = useRouter()
  const id = Number(params.id)
  const [draft, setDraft] = useState("")
  const [version, setVersion] = useState(0)
  const [editingPrayer, setEditingPrayer] = useState(false)
  const [requester, setRequester] = useState("")
  const [target, setTarget] = useState("")
  const [editingContentId, setEditingContentId] = useState<number | null>(null)
  const [editingContent, setEditingContent] = useState("")
  const prayer = useMemo(() => getPrayerById(id), [id, version])

  if (!prayer) {
    return <div className="text-sm text-base-content/60">Not found</div>
  }

  const handleAddContent = () => {
    if (!draft.trim()) return
    addPrayerContent(prayer.id, draft)
    setDraft("")
    setVersion((v) => v + 1)
  }

  const handleDeletePrayer = () => {
    deletePrayer(prayer.id)
    router.replace("/my/prayers")
  }

  const openPrayerEdit = () => {
    setRequester(prayer.requester)
    setTarget(prayer.target)
    setEditingPrayer(true)
  }

  const savePrayerEdit = () => {
    updatePrayer(prayer.id, requester, target)
    setEditingPrayer(false)
    setVersion((v) => v + 1)
  }

  const openContentEdit = (contentId: number, content: string) => {
    setEditingContentId(contentId)
    setEditingContent(content)
  }

  const saveContentEdit = () => {
    if (editingContentId == null) return
    updatePrayerContent(prayer.id, editingContentId, editingContent)
    setEditingContentId(null)
    setEditingContent("")
    setVersion((v) => v + 1)
  }

  return (
    <section className="space-y-4">
      <button type="button" className="btn btn-ghost btn-sm" onClick={() => router.back()}>
        {t("common.back")}
      </button>
      <div className="rounded-xl border border-base-300 bg-base-100 p-4">
        <div className="text-sm font-semibold">{t("my.target")}: {prayer.target || "-"}</div>
        <div className="text-sm text-base-content/70">{t("my.requester")}: {prayer.requester || "-"}</div>
        <div className="mt-2 flex justify-end">
          <button type="button" className="btn btn-outline btn-xs" onClick={openPrayerEdit}>
            {t("common.edit")}
          </button>
        </div>
      </div>
      <div className="rounded-xl border border-base-300 bg-base-100 p-4">
        <h2 className="mb-2 font-semibold">{t("my.prayerContent")}</h2>
        <div className="space-y-2">
          {prayer.contents.map((content) => (
            <div key={content.id} className="rounded-lg border border-base-300 p-2">
              <div className="text-sm whitespace-pre-wrap">{content.content}</div>
              <div className="mt-1 flex items-center justify-between text-xs text-base-content/60">
                <span>{formatDateTime(content.registeredAt)}</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs"
                    onClick={() => openContentEdit(content.id, content.content)}
                  >
                    {t("common.edit")}
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs text-error"
                    onClick={() => {
                      if (!window.confirm(t("common.confirmDelete"))) return
                      deletePrayerContent(prayer.id, content.id)
                      setVersion((v) => v + 1)
                    }}
                  >
                    {t("common.delete")}
                  </button>
                </div>
              </div>
            </div>
          ))}
          {!prayer.contents.length ? (
            <div className="text-sm text-base-content/60">-</div>
          ) : null}
        </div>
      </div>
      <div className="rounded-xl border border-base-300 bg-base-100 p-4">
        <textarea
          className="textarea textarea-bordered h-24 w-full"
          placeholder={t("my.prayerContent")}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <div className="mt-2 flex justify-end gap-2">
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => {
              if (!window.confirm(t("common.confirmDelete"))) return
              handleDeletePrayer()
            }}
          >
            {t("common.delete")}
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={handleAddContent}>
            {t("common.add")}
          </button>
        </div>
      </div>
      {editingPrayer ? (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="text-lg font-bold">{t("common.edit")}</h3>
            <div className="mt-3 space-y-2">
              <input
                className="input input-bordered w-full"
                value={requester}
                onChange={(e) => setRequester(e.target.value)}
                placeholder={t("my.requester")}
              />
              <input
                className="input input-bordered w-full"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder={t("my.target")}
              />
            </div>
            <div className="modal-action">
              <button type="button" className="btn" onClick={() => setEditingPrayer(false)}>
                {t("common.cancel")}
              </button>
              <button type="button" className="btn btn-primary" onClick={savePrayerEdit}>
                {t("common.save")}
              </button>
            </div>
          </div>
        </dialog>
      ) : null}
      {editingContentId != null ? (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="text-lg font-bold">{t("common.edit")}</h3>
            <textarea
              className="textarea textarea-bordered mt-3 h-36 w-full"
              value={editingContent}
              onChange={(e) => setEditingContent(e.target.value)}
            />
            <div className="modal-action">
              <button type="button" className="btn" onClick={() => setEditingContentId(null)}>
                {t("common.cancel")}
              </button>
              <button type="button" className="btn btn-primary" onClick={saveContentEdit}>
                {t("common.save")}
              </button>
            </div>
          </div>
        </dialog>
      ) : null}
    </section>
  )
}
