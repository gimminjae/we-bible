"use client"

import { useRouter } from "next/navigation"
import {
  BIBLE_BOOKS,
  deletePlan,
  getPlanById,
  getBookCodesByTestament,
  type PlanRecord,
  updatePlanInfo,
  updatePlanGoalStatus,
} from "@/utils/local-db"
import { formatDate } from "@/utils/format"
import { useI18n } from "@/utils/i18n"
import { useMemo, useState } from "react"

function getBookName(code: string): string {
  return BIBLE_BOOKS.find((book) => book.bookCode === code)?.bookName.ko ?? code
}

export default function PlanDetailPage({ params }: { params: { id: string } }) {
  const { t } = useI18n()
  const router = useRouter()
  const id = Number(params.id)
  const [version, setVersion] = useState(0)
  const plan: PlanRecord | null = useMemo(() => getPlanById(id), [id, version])
  const [activeBook, setActiveBook] = useState<string>("")
  const [editingPlan, setEditingPlan] = useState(false)
  const [planName, setPlanName] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [selectedBookCodes, setSelectedBookCodes] = useState<string[]>([])

  const bookCode = activeBook || plan?.selectedBookCodes[0] || ""
  const chapterStatus = plan?.goalStatus[bookCode] ?? []

  if (!plan) return <div className="text-sm text-base-content/60">Not found</div>

  const toggleChapter = (index: number) => {
    const next = [...chapterStatus]
    next[index] = next[index] === 1 ? 0 : 1
    updatePlanGoalStatus(plan.id, bookCode, next)
    setVersion((v) => v + 1)
  }

  const handleDelete = () => {
    deletePlan(plan.id)
    router.replace("/my/plans")
  }

  const openPlanEdit = () => {
    setPlanName(plan.planName)
    setStartDate(plan.startDate)
    setEndDate(plan.endDate)
    setSelectedBookCodes(plan.selectedBookCodes)
    setEditingPlan(true)
  }

  const toggleBook = (code: string) => {
    setSelectedBookCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    )
  }

  const savePlanEdit = () => {
    if (!selectedBookCodes.length) {
      window.alert(t("my.noBookSelected"))
      return
    }
    updatePlanInfo(plan.id, planName, startDate, endDate, selectedBookCodes)
    setEditingPlan(false)
    setVersion((v) => v + 1)
  }

  return (
    <section className="space-y-4">
      <button type="button" className="btn btn-ghost btn-sm" onClick={() => router.back()}>
        {t("common.back")}
      </button>
      <div className="rounded-xl border border-base-300 bg-base-100 p-4">
        <h1 className="text-lg font-bold">{plan.planName || "-"}</h1>
        <div className="mt-1 text-sm text-base-content/70">
          {formatDate(plan.startDate)} ~ {formatDate(plan.endDate)}
        </div>
        <div className="mt-1 text-sm text-primary">
          {t("my.progress")}: {plan.goalPercent.toFixed(1)}% ({plan.currentReadCount}/{plan.totalReadCount})
        </div>
        <div className="mt-2 flex justify-end">
          <button type="button" className="btn btn-outline btn-xs" onClick={openPlanEdit}>
            {t("my.updatePlan")}
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-base-300 bg-base-100 p-4">
        <div className="mb-2 text-sm font-semibold">{t("my.selectBooks")}</div>
        <div className="flex flex-wrap gap-2">
          {plan.selectedBookCodes.map((code) => (
            <button
              key={code}
              type="button"
              className={`btn btn-xs ${code === bookCode ? "btn-primary" : "btn-outline"}`}
              onClick={() => setActiveBook(code)}
            >
              {getBookName(code)}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-base-300 bg-base-100 p-4">
        <div className="mb-2 text-sm font-semibold">{getBookName(bookCode)}</div>
        <div className="grid grid-cols-5 gap-2">
          {chapterStatus.map((value, idx) => (
            <button
              key={idx}
              type="button"
              className={`btn btn-sm ${value === 1 ? "btn-primary" : "btn-outline"}`}
              onClick={() => toggleChapter(idx)}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          className="btn btn-outline btn-sm text-error"
          onClick={() => {
            if (!window.confirm(t("common.confirmDelete"))) return
            handleDelete()
          }}
        >
          {t("common.delete")}
        </button>
      </div>
      {editingPlan ? (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-xl">
            <h3 className="text-lg font-bold">{t("my.updatePlan")}</h3>
            <div className="mt-3 space-y-2">
              <input
                className="input input-bordered w-full"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                placeholder={t("my.planName")}
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
              <button type="button" className="btn" onClick={() => setEditingPlan(false)}>
                {t("common.cancel")}
              </button>
              <button type="button" className="btn btn-primary" onClick={savePlanEdit}>
                {t("common.save")}
              </button>
            </div>
          </div>
        </dialog>
      ) : null}
    </section>
  )
}
