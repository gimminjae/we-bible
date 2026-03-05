"use client"

import Link from "next/link"
import {
  addPlan,
  BIBLE_BOOKS,
  getAllPlans,
  getBookCodesByTestament,
} from "@/utils/local-db"
import { formatDate } from "@/utils/format"
import { useI18n } from "@/utils/i18n"
import { useMemo, useState } from "react"

function today() {
  return new Date().toISOString().slice(0, 10)
}

function afterDays(days: number) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export default function PlansPage() {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const [version, setVersion] = useState(0)
  const [planName, setPlanName] = useState("")
  const [startDate, setStartDate] = useState(today())
  const [endDate, setEndDate] = useState(afterDays(30))
  const [selectedBookCodes, setSelectedBookCodes] = useState<string[]>([])

  const items = useMemo(() => getAllPlans(), [version])

  const toggleBook = (code: string) => {
    setSelectedBookCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    )
  }

  const handleAdd = () => {
    if (!selectedBookCodes.length) {
      window.alert(t("my.noBookSelected"))
      return
    }
    addPlan({ planName, startDate, endDate, selectedBookCodes })
    setPlanName("")
    setSelectedBookCodes([])
    setStartDate(today())
    setEndDate(afterDays(30))
    setOpen(false)
    setVersion((v) => v + 1)
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{t("my.plans")}</h1>
        <button type="button" className="btn btn-sm btn-primary" onClick={() => setOpen(true)}>
          {t("my.addPlan")}
        </button>
      </div>

      {!items.length ? (
        <div className="rounded-xl border border-base-300 bg-base-100 p-4 text-sm text-base-content/60">
          {t("my.emptyPlans")}
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id} className="rounded-xl border border-base-300 bg-base-100 p-3">
              <Link href={`/my/plan/${item.id}`} className="block">
                <div className="text-sm font-semibold">{item.planName || "-"}</div>
                <div className="mt-1 text-xs text-base-content/70">
                  {formatDate(item.startDate)} ~ {formatDate(item.endDate)}
                </div>
                <div className="mt-1 text-xs text-primary">
                  {t("my.progress")}: {item.goalPercent.toFixed(1)}% ·{" "}
                  {t("my.remainingDays", { days: item.restDay })}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {open ? (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-xl">
            <h3 className="text-lg font-bold">{t("my.addPlan")}</h3>
            <div className="mt-3 space-y-2">
              <input
                className="input input-bordered w-full"
                placeholder={t("my.planName")}
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  className="input input-bordered w-full"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <input
                  type="date"
                  className="input input-bordered w-full"
                  value={endDate}
                  min={startDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="btn btn-xs btn-outline"
                  onClick={() => setSelectedBookCodes(getBookCodesByTestament("ot"))}
                >
                  OT
                </button>
                <button
                  type="button"
                  className="btn btn-xs btn-outline"
                  onClick={() => setSelectedBookCodes(getBookCodesByTestament("nt"))}
                >
                  NT
                </button>
                <button
                  type="button"
                  className="btn btn-xs btn-outline"
                  onClick={() => setSelectedBookCodes(BIBLE_BOOKS.map((b) => b.bookCode))}
                >
                  ALL
                </button>
              </div>
              <div className="max-h-52 overflow-y-auto rounded-lg border border-base-300 p-2">
                <div className="grid grid-cols-2 gap-2">
                  {BIBLE_BOOKS.map((book) => (
                    <label key={book.bookCode} className="label cursor-pointer justify-start gap-2 py-1">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-sm"
                        checked={selectedBookCodes.includes(book.bookCode)}
                        onChange={() => toggleBook(book.bookCode)}
                      />
                      <span className="label-text text-sm">{book.bookName.ko}</span>
                    </label>
                  ))}
                </div>
              </div>
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
