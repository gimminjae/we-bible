"use client"

export function formatDate(raw: string): string {
  if (!raw) return "-"
  const [date] = raw.split(" ")
  const [y = "", m = "", d = ""] = date.split("-")
  if (!y || !m || !d) return raw
  return `${y}.${m}.${d}`
}

export function formatDateTime(raw: string): string {
  if (!raw) return "-"
  const [date, time = ""] = raw.split(" ")
  const [y = "", m = "", d = ""] = date.split("-")
  if (!y || !m || !d) return raw
  const hm = time.slice(0, 5)
  return `${y}.${m}.${d}${hm ? ` ${hm}` : ""}`
}
