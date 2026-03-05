"use client"

import { getBookName } from "@/api/bible"
import { useAppSettings } from "@/contexts/app-settings"
import { getChapterCountForDate, getGrassData, type GrassDataMap, type GrassDayEntry } from "@/utils/local-db"
import { useI18n } from "@/utils/i18n"
import { HiOutlineExclamationCircle } from "react-icons/hi2"
import { useMemo, useState } from "react"

function toDateString(d: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function getSundayBefore(d: Date): Date {
  const copy = new Date(d)
  copy.setDate(copy.getDate() - copy.getDay())
  return copy
}

function getMonthLabels(year: number): { col: number; label: string }[] {
  const labels = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"]
  const start = getSundayBefore(new Date(year, 0, 1))
  return labels
    .map((label, idx) => {
      const first = new Date(year, idx, 1)
      const diffDays = Math.round((first.getTime() - start.getTime()) / (24 * 60 * 60 * 1000))
      return { col: Math.floor(diffDays / 7), label }
    })
    .filter((entry) => entry.col >= 0 && entry.col < 53)
}

function buildGrid(year: number): string[][] {
  const yearStart = new Date(year, 0, 1)
  const yearEnd = new Date(year, 11, 31)
  const sundayStart = getSundayBefore(yearStart)
  const grid = Array.from({ length: 7 }, () => Array.from({ length: 53 }, () => ""))

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const end = year === today.getFullYear() ? today : yearEnd

  for (let col = 0; col < 53; col++) {
    for (let row = 0; row < 7; row++) {
      const d = new Date(sundayStart)
      d.setDate(sundayStart.getDate() + col * 7 + row)
      if (d >= yearStart && d <= end) grid[row][col] = toDateString(d)
    }
  }
  return grid
}

function level(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count <= 0) return 0
  if (count >= 10) return 4
  if (count >= 5) return 3
  if (count >= 3) return 2
  return 1
}

function formatChapterRanges(chapters: number[]): string {
  if (!chapters.length) return ""
  const sorted = [...chapters].sort((a, b) => a - b)
  const result: string[] = []
  let start = sorted[0]
  let end = sorted[0]
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === end + 1) end = sorted[i]
    else {
      result.push(start === end ? `${start}` : `${start}~${end}`)
      start = sorted[i]
      end = sorted[i]
    }
  }
  result.push(start === end ? `${start}` : `${start}~${end}`)
  return result.join(", ")
}

function formatReadingSummary(entries: GrassDayEntry[], appLanguage: string): string {
  return entries
    .map((entry) => `${getBookName(entry.bookCode, appLanguage)} ${formatChapterRanges(entry.readChapter)}장`)
    .join(", ")
}

const COLOR = ["bg-base-300", "bg-emerald-700", "bg-emerald-600", "bg-emerald-500", "bg-emerald-400"] as const
const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"]

export default function BibleGrass() {
  const { t } = useI18n()
  const { language } = useAppSettings()
  const data: GrassDataMap = getGrassData()
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [yearOpen, setYearOpen] = useState(false)

  const grid = useMemo(() => buildGrid(selectedYear), [selectedYear])
  const monthLabels = useMemo(() => getMonthLabels(selectedYear), [selectedYear])
  const total = useMemo(
    () =>
      grid.reduce(
        (sum, row) =>
          sum + row.reduce((acc, date) => acc + (date ? getChapterCountForDate(data, date) : 0), 0),
        0
      ),
    [data, grid]
  )
  const recentDates = [...Object.keys(data)]
    .filter((date) => (data[date] ?? []).length > 0)
    .sort((a, b) => b.localeCompare(a))
    .slice(0, 3)
  const yearOptions = useMemo(() => {
    const current = new Date().getFullYear()
    return [current, current - 1, current - 2, current - 3]
  }, [])

  return (
    <div className="rounded-2xl border border-base-300 bg-base-100 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold">{t("my.grassTitle")}</h2>
          <HiOutlineExclamationCircle className="text-base-content/60" />
        </div>
        <button
          type="button"
          className="btn btn-sm btn-outline"
          onClick={() => setYearOpen(true)}
        >
          {selectedYear} ▾
        </button>
      </div>
      <p className="mt-2 text-xs text-base-content/70">{t("my.grassGuide")}</p>
      <div className="mt-1 text-xs text-base-content/70">
        {total} {t("my.chapters")}
      </div>

      <div className="mt-3 overflow-x-auto">
        <div className="min-w-[380px]">
          <div className="relative ml-8 h-5">
            {monthLabels.map((item) => (
              <span
                key={`${item.col}-${item.label}`}
                className="absolute text-[10px] text-base-content/60"
                style={{ left: item.col * 12 }}
              >
                {item.label}
              </span>
            ))}
          </div>
          <div className="flex gap-1">
            <div className="grid grid-rows-7 gap-1 text-[10px] text-base-content/60">
              {DAY_LABELS.map((label) => (
                <span key={label} className="h-[11px] leading-[11px]">
                  {label}
                </span>
              ))}
            </div>
            <div className="grid gap-1" style={{ gridTemplateColumns: "repeat(53, minmax(0, 1fr))" }}>
              {Array.from({ length: 53 }).map((_, col) => (
                <div key={col} className="grid grid-rows-7 gap-1">
                  {Array.from({ length: 7 }).map((__, row) => {
                    const date = grid[row][col]
                    if (!date) return <div key={row} className="h-[11px] w-[11px] rounded-sm bg-transparent" />
                    const count = getChapterCountForDate(data, date)
                    const dayNum = date.slice(-2).replace(/^0/, "")
                    return (
                      <button
                        key={row}
                        type="button"
                        className={`h-[11px] w-[11px] rounded-sm ${COLOR[level(count)]} text-[7px] leading-[11px] text-center text-white`}
                        title={`${date}: ${count}`}
                        onClick={() => setSelectedDate(date)}
                      >
                        {dayNum}
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1 text-[11px] text-base-content/70">
        <span>적음</span>
        {COLOR.map((color, idx) => (
          <span key={idx} className={`h-3 w-3 rounded-sm ${color}`} />
        ))}
        <span>많음</span>
      </div>

      <div className="mt-3 border-t border-base-300 pt-3 text-xs">
        {selectedDate && data[selectedDate]?.length
          ? `${selectedDate}: ${formatReadingSummary(data[selectedDate], language)}`
          : `${t("my.recentRead")}: ${recentDates.length
            ? recentDates
              .map((date) => `${date} ${formatReadingSummary(data[date], language)}`)
              .join(" / ")
            : "-"
          }`}
      </div>

      {yearOpen ? (
        <dialog className="modal modal-open modal-bottom sm:modal-middle">
          <div className="modal-box rounded-t-2xl sm:rounded-2xl">
            <h3 className="text-base font-bold">연도 선택</h3>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {yearOptions.map((year) => (
                <button
                  key={year}
                  type="button"
                  className={`btn ${selectedYear === year ? "btn-primary" : "btn-outline"}`}
                  onClick={() => {
                    setSelectedYear(year)
                    setSelectedDate(null)
                    setYearOpen(false)
                  }}
                >
                  {year}
                </button>
              ))}
            </div>
            <div className="modal-action">
              <button type="button" className="btn" onClick={() => setYearOpen(false)}>
                {t("common.cancel")}
              </button>
            </div>
          </div>
        </dialog>
      ) : null}
    </div>
  )
}
