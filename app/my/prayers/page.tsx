"use client"

import Link from "next/link"
import { addPrayer, getAllPrayers } from "@/utils/local-db"
import { formatDateTime } from "@/utils/format"
import { useI18n } from "@/utils/i18n"
import { useMemo, useState } from "react"

export default function PrayersPage() {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const [requester, setRequester] = useState("")
  const [target, setTarget] = useState("")
  const [content, setContent] = useState("")
  const [version, setVersion] = useState(0)

  const items = useMemo(() => getAllPrayers(), [version])

  const handleAdd = () => {
    addPrayer(requester, target, content)
    setRequester("")
    setTarget("")
    setContent("")
    setOpen(false)
    setVersion((v) => v + 1)
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{t("my.prayers")}</h1>
        <button type="button" className="btn btn-sm btn-primary" onClick={() => setOpen(true)}>
          {t("my.addPrayer")}
        </button>
      </div>

      {!items.length ? (
        <div className="rounded-xl border border-base-300 bg-base-100 p-4 text-sm text-base-content/60">
          {t("my.emptyPrayers")}
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id} className="rounded-xl border border-base-300 bg-base-100 p-3">
              <Link href={`/my/prayer/${item.id}`} className="block">
                <div className="text-sm font-semibold">{item.target || "-"}</div>
                <div className="text-xs text-base-content/60">{item.requester || "-"}</div>
                <p className="mt-1 line-clamp-2 text-sm">{item.latestContent || "-"}</p>
                <div className="mt-1 text-xs text-base-content/60">
                  {item.latestContentAt ? formatDateTime(item.latestContentAt) : "-"}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {open ? (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="text-lg font-bold">{t("my.addPrayer")}</h3>
            <div className="mt-3 space-y-2">
              <input
                className="input input-bordered w-full"
                placeholder={t("my.requester")}
                value={requester}
                onChange={(e) => setRequester(e.target.value)}
              />
              <input
                className="input input-bordered w-full"
                placeholder={t("my.target")}
                value={target}
                onChange={(e) => setTarget(e.target.value)}
              />
              <textarea
                className="textarea textarea-bordered h-28 w-full"
                placeholder={t("my.prayerContent")}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
            <div className="modal-action">
              <button type="button" className="btn" onClick={() => setOpen(false)}>
                {t("common.cancel")}
              </button>
              <button type="button" className="btn btn-primary" onClick={handleAdd}>
                {t("common.save")}
              </button>
            </div>
          </div>
        </dialog>
      ) : null}
    </section>
  )
}
