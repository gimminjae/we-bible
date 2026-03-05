"use client"

import { bibleInfos } from "@/api/bible"

export type AppTheme = "light" | "dark"
export type AppLanguage = "ko" | "en"

export type BibleSearchInfo = {
  bookCode: string
  chapter: number
  primaryLang: string
  secondaryLang: string
  dualLang: boolean
  fontScale: number
}

export type FavoriteVerseRecord = {
  bookCode: string
  chapter: number
  verse: number
  verseText: string
  createdAt: string
}

export type MemoRecord = {
  id: number
  title: string
  content: string
  verseText: string
  bookCode: string
  chapter: number
  verses: number[]
  createdAt: string
}

export type PrayContent = {
  id: number
  content: string
  registeredAt: string
}

export type PrayRecord = {
  id: number
  requester: string
  target: string
  createdAt: string
  contents: PrayContent[]
}

export type PrayListItem = {
  id: number
  requester: string
  target: string
  latestContent: string
  latestContentAt: string
}

export type GrassDayEntry = {
  bookCode: string
  readChapter: number[]
}

export type GrassDataMap = Record<string, GrassDayEntry[]>

export type GoalStatus = Record<string, number[]>

export type PlanRecord = {
  id: number
  planName: string
  startDate: string
  endDate: string
  totalReadCount: number
  currentReadCount: number
  goalPercent: number
  readCountPerDay: number
  restDay: number
  goalStatus: GoalStatus
  selectedBookCodes: string[]
  createdAt: string
  updatedAt: string
}

export type PlanListItem = {
  id: number
  planName: string
  startDate: string
  endDate: string
  totalReadCount: number
  currentReadCount: number
  goalPercent: number
  restDay: number
  selectedBookCodes: string[]
}

const APP_SETTINGS_KEY = "weBible.appSettings"
const BIBLE_STATE_KEY = "weBible.bibleState"
const FAVORITES_KEY = "weBible.favoriteVerses"
const MEMOS_KEY = "weBible.memos"
const PRAYERS_KEY = "weBible.prayers"
const PLANS_KEY = "weBible.plans"
const GRASS_KEY = "weBible.bibleGrass"
const LAST_SYNC_KEY = "weBible.lastAutoSyncAt"
const OT_BOOK_CODES = new Set([
  "genesis", "exodus", "leviticus", "numbers", "deuteronomy",
  "joshua", "judges", "ruth", "1samuel", "2samuel", "1kings", "2kings",
  "1chronicles", "2chronicles", "ezra", "nehemiah", "esther", "job",
  "psalms", "proverbs", "ecclesiastes", "songofsolomon", "isaiah",
  "jeremiah", "lamentations", "ezekiel", "daniel", "hosea", "joel",
  "amos", "obadiah", "jonah", "micah", "nahum", "habakkuk",
  "zephaniah", "haggai", "zechariah", "malachi",
])

const DEFAULT_BIBLE_INFO: BibleSearchInfo = {
  bookCode: "genesis",
  chapter: 1,
  primaryLang: "ko",
  secondaryLang: "none",
  dualLang: false,
  fontScale: 16,
}

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined"
}

function nowString(): string {
  const d = new Date()
  const pad = (n: number) => n.toString().padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

function todayString(): string {
  return nowString().slice(0, 10)
}

function readJson<T>(key: string, fallback: T): T {
  if (!canUseStorage()) return fallback
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeJson<T>(key: string, value: T): void {
  if (!canUseStorage()) return
  localStorage.setItem(key, JSON.stringify(value))
}

export function getAppSettings(): { theme: AppTheme; language: AppLanguage } {
  return readJson(APP_SETTINGS_KEY, { theme: "light", language: "ko" as AppLanguage })
}

export function setAppSettings(settings: { theme: AppTheme; language: AppLanguage }): void {
  writeJson(APP_SETTINGS_KEY, settings)
}

export function getBibleSearchInfo(): BibleSearchInfo {
  return readJson(BIBLE_STATE_KEY, DEFAULT_BIBLE_INFO)
}

export function setBibleSearchInfo(info: BibleSearchInfo): void {
  writeJson(BIBLE_STATE_KEY, info)
}

export function getFavoriteVerseRecords(): FavoriteVerseRecord[] {
  return readJson(FAVORITES_KEY, [])
}

export function getFavoritesForChapter(bookCode: string, chapter: number): number[] {
  return getFavoriteVerseRecords()
    .filter((row) => row.bookCode === bookCode && row.chapter === chapter)
    .map((row) => row.verse)
}

export function toggleFavorites(
  bookCode: string,
  chapter: number,
  verses: { verse: number; text: string }[]
): { added: boolean } {
  const records = getFavoriteVerseRecords()
  const targetSet = new Set(verses.map((v) => v.verse))
  const selectedRows = records.filter(
    (row) => row.bookCode === bookCode && row.chapter === chapter && targetSet.has(row.verse)
  )
  const allSelectedAlreadyFavorited = selectedRows.length === targetSet.size

  if (allSelectedAlreadyFavorited) {
    const removed = records.filter(
      (row) => !(row.bookCode === bookCode && row.chapter === chapter && targetSet.has(row.verse))
    )
    writeJson(FAVORITES_KEY, removed)
    return { added: false }
  }

  const withoutDuplicated = records.filter(
    (row) => !(row.bookCode === bookCode && row.chapter === chapter && targetSet.has(row.verse))
  )
  const createdAt = nowString()
  const appended: FavoriteVerseRecord[] = verses.map((v) => ({
    bookCode,
    chapter,
    verse: v.verse,
    verseText: v.text,
    createdAt,
  }))
  writeJson(FAVORITES_KEY, [...withoutDuplicated, ...appended])
  return { added: true }
}

export function getAllFavorites(): FavoriteVerseRecord[] {
  return [...getFavoriteVerseRecords()].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function deleteFavorite(bookCode: string, chapter: number, verse: number): void {
  const next = getFavoriteVerseRecords().filter(
    (row) => !(row.bookCode === bookCode && row.chapter === chapter && row.verse === verse)
  )
  writeJson(FAVORITES_KEY, next)
}

export function getMemos(): MemoRecord[] {
  return readJson(MEMOS_KEY, [])
}

export function getMemoVerseNumbersForChapter(bookCode: string, chapter: number): number[] {
  const result = new Set<number>()
  for (const memo of getMemos()) {
    if (memo.bookCode === bookCode && memo.chapter === chapter) {
      memo.verses.forEach((verse) => result.add(verse))
    }
  }
  return [...result].sort((a, b) => a - b)
}

export function addMemo(input: {
  title: string
  content: string
  verseText: string
  bookCode: string
  chapter: number
  verses: number[]
}): MemoRecord {
  const current = getMemos()
  const nextId = current.length ? Math.max(...current.map((memo) => memo.id)) + 1 : 1
  const row: MemoRecord = {
    id: nextId,
    title: input.title.trim(),
    content: input.content.trim(),
    verseText: input.verseText.trim(),
    bookCode: input.bookCode,
    chapter: input.chapter,
    verses: input.verses,
    createdAt: nowString(),
  }
  writeJson(MEMOS_KEY, [...current, row])
  return row
}

export function addMemoWithoutVerse(input: { title: string; content: string }): MemoRecord {
  return addMemo({
    title: input.title,
    content: input.content,
    verseText: "",
    bookCode: "",
    chapter: 0,
    verses: [],
  })
}

export function getAllMemos(): MemoRecord[] {
  return [...getMemos()].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function getMemoById(id: number): MemoRecord | null {
  return getMemos().find((memo) => memo.id === id) ?? null
}

export function updateMemo(id: number, title: string, content: string): void {
  const next = getMemos().map((memo) =>
    memo.id === id
      ? {
          ...memo,
          title: title.trim(),
          content: content.trim(),
        }
      : memo
  )
  writeJson(MEMOS_KEY, next)
}

export function deleteMemo(id: number): void {
  writeJson(
    MEMOS_KEY,
    getMemos().filter((memo) => memo.id !== id)
  )
}

export function getPrayers(): PrayRecord[] {
  return readJson(PRAYERS_KEY, [])
}

export function addPrayer(requester: string, target: string, initialContent: string): number {
  const current = getPrayers()
  const nextId = current.length ? Math.max(...current.map((item) => item.id)) + 1 : 1
  const createdAt = nowString()
  const initialContents = initialContent.trim()
    ? [{ id: 1, content: initialContent.trim(), registeredAt: createdAt }]
    : []
  const row: PrayRecord = {
    id: nextId,
    requester: requester.trim(),
    target: target.trim(),
    createdAt,
    contents: initialContents,
  }
  writeJson(PRAYERS_KEY, [row, ...current])
  return nextId
}

export function addPrayerContent(prayerId: number, content: string): void {
  const current = getPrayers()
  const next = current.map((item) => {
    if (item.id !== prayerId) return item
    const nextContentId = item.contents.length
      ? Math.max(...item.contents.map((c) => c.id)) + 1
      : 1
    return {
      ...item,
      contents: [
        { id: nextContentId, content: content.trim(), registeredAt: nowString() },
        ...item.contents,
      ],
    }
  })
  writeJson(PRAYERS_KEY, next)
}

export function updatePrayer(prayerId: number, requester: string, target: string): void {
  const next = getPrayers().map((item) =>
    item.id === prayerId
      ? {
          ...item,
          requester: requester.trim(),
          target: target.trim(),
        }
      : item
  )
  writeJson(PRAYERS_KEY, next)
}

export function updatePrayerContent(prayerId: number, contentId: number, content: string): void {
  const next = getPrayers().map((item) => {
    if (item.id !== prayerId) return item
    return {
      ...item,
      contents: item.contents.map((row) =>
        row.id === contentId ? { ...row, content: content.trim() } : row
      ),
    }
  })
  writeJson(PRAYERS_KEY, next)
}

export function deletePrayer(prayerId: number): void {
  writeJson(
    PRAYERS_KEY,
    getPrayers().filter((item) => item.id !== prayerId)
  )
}

export function deletePrayerContent(prayerId: number, contentId: number): void {
  const next = getPrayers().map((item) => {
    if (item.id !== prayerId) return item
    return {
      ...item,
      contents: item.contents.filter((content) => content.id !== contentId),
    }
  })
  writeJson(PRAYERS_KEY, next)
}

export function getPrayerById(id: number): PrayRecord | null {
  return getPrayers().find((item) => item.id === id) ?? null
}

export function getAllPrayers(): PrayListItem[] {
  return getPrayers().map((item) => ({
    id: item.id,
    requester: item.requester,
    target: item.target,
    latestContent: item.contents[0]?.content ?? "",
    latestContentAt: item.contents[0]?.registeredAt ?? item.createdAt,
  }))
}

export const BIBLE_BOOKS = bibleInfos.filter((book) => book.bookSeq >= 1 && book.bookSeq <= 66)

export function getBookCodesByTestament(testament: "ot" | "nt"): string[] {
  return BIBLE_BOOKS.filter((book) =>
    testament === "ot" ? OT_BOOK_CODES.has(book.bookCode) : !OT_BOOK_CODES.has(book.bookCode)
  ).map((book) => book.bookCode)
}

function createEmptyGoalStatus(selectedBookCodes: string[]): GoalStatus {
  const status: GoalStatus = {}
  for (const code of selectedBookCodes) {
    const max = BIBLE_BOOKS.find((book) => book.bookCode === code)?.maxChapter ?? 0
    status[code] = Array.from({ length: max }, () => 0)
  }
  return status
}

function calcTotalReadCount(selectedBookCodes: string[]): number {
  return selectedBookCodes.reduce((sum, code) => {
    const max = BIBLE_BOOKS.find((book) => book.bookCode === code)?.maxChapter ?? 0
    return sum + max
  }, 0)
}

function calcCurrentReadCount(goalStatus: GoalStatus, selectedBookCodes: string[]): number {
  return selectedBookCodes.reduce((sum, code) => {
    const row = goalStatus[code] ?? []
    return sum + row.filter((v) => v === 1).length
  }, 0)
}

function calcRestDay(endDate: string): number {
  const today = new Date(todayString())
  const end = new Date(endDate)
  const diff = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  return Math.max(0, diff)
}

function calcGoalPercent(totalReadCount: number, currentReadCount: number): number {
  if (!totalReadCount) return 0
  return Math.round((currentReadCount / totalReadCount) * 10000) / 100
}

function calcReadCountPerDay(totalReadCount: number, currentReadCount: number, restDay: number): number {
  const remaining = totalReadCount - currentReadCount
  if (restDay <= 0 || remaining <= 0) return 0
  return Math.round((remaining / restDay) * 100) / 100
}

function recalcPlan(plan: PlanRecord): PlanRecord {
  const totalReadCount = calcTotalReadCount(plan.selectedBookCodes)
  const currentReadCount = calcCurrentReadCount(plan.goalStatus, plan.selectedBookCodes)
  const restDay = calcRestDay(plan.endDate)
  const goalPercent = calcGoalPercent(totalReadCount, currentReadCount)
  const readCountPerDay = calcReadCountPerDay(totalReadCount, currentReadCount, restDay)
  return { ...plan, totalReadCount, currentReadCount, restDay, goalPercent, readCountPerDay }
}

export function getPlans(): PlanRecord[] {
  return readJson(PLANS_KEY, [])
}

export function getAllPlans(): PlanListItem[] {
  return getPlans()
    .map((plan) => recalcPlan(plan))
    .sort((a, b) => b.id - a.id)
    .map((plan) => ({
      id: plan.id,
      planName: plan.planName,
      startDate: plan.startDate,
      endDate: plan.endDate,
      totalReadCount: plan.totalReadCount,
      currentReadCount: plan.currentReadCount,
      goalPercent: plan.goalPercent,
      restDay: plan.restDay,
      selectedBookCodes: plan.selectedBookCodes,
    }))
}

export function addPlan(input: {
  planName: string
  startDate: string
  endDate: string
  selectedBookCodes: string[]
}): number {
  const current = getPlans()
  const nextId = current.length ? Math.max(...current.map((item) => item.id)) + 1 : 1
  const now = nowString()
  const created: PlanRecord = recalcPlan({
    id: nextId,
    planName: input.planName.trim(),
    startDate: input.startDate,
    endDate: input.endDate,
    totalReadCount: 0,
    currentReadCount: 0,
    goalPercent: 0,
    readCountPerDay: 0,
    restDay: 0,
    goalStatus: createEmptyGoalStatus(input.selectedBookCodes),
    selectedBookCodes: input.selectedBookCodes,
    createdAt: now,
    updatedAt: now,
  })
  writeJson(PLANS_KEY, [created, ...current])
  return nextId
}

export function getPlanById(id: number): PlanRecord | null {
  const row = getPlans().find((plan) => plan.id === id)
  return row ? recalcPlan(row) : null
}

export function updatePlanInfo(
  id: number,
  planName: string,
  startDate: string,
  endDate: string,
  selectedBookCodes: string[]
): void {
  const current = getPlans()
  const next = current.map((plan) => {
    if (plan.id !== id) return plan
    const nextStatus = { ...plan.goalStatus }
    for (const code of selectedBookCodes) {
      if (!nextStatus[code]) {
        const max = BIBLE_BOOKS.find((book) => book.bookCode === code)?.maxChapter ?? 0
        nextStatus[code] = Array.from({ length: max }, () => 0)
      }
    }
    for (const existing of Object.keys(nextStatus)) {
      if (!selectedBookCodes.includes(existing)) {
        delete nextStatus[existing]
      }
    }
    return recalcPlan({
      ...plan,
      planName: planName.trim(),
      startDate,
      endDate,
      selectedBookCodes,
      goalStatus: nextStatus,
      updatedAt: nowString(),
    })
  })
  writeJson(PLANS_KEY, next)
}

export function deletePlan(id: number): void {
  writeJson(
    PLANS_KEY,
    getPlans().filter((plan) => plan.id !== id)
  )
}

export function getGrassData(): GrassDataMap {
  return readJson(GRASS_KEY, {})
}

export function getChapterCountForDate(data: GrassDataMap, date: string): number {
  const day = data[date] ?? []
  return day.reduce((sum, entry) => sum + entry.readChapter.length, 0)
}

function saveGrassData(data: GrassDataMap): void {
  writeJson(GRASS_KEY, data)
}

function syncGrassForBook(date: string, bookCode: string, readChapters: number[]): void {
  const data = getGrassData()
  const dayRows = data[date] ?? []
  const filtered = dayRows.filter((row) => row.bookCode !== bookCode)
  if (readChapters.length) {
    filtered.push({ bookCode, readChapter: [...readChapters].sort((a, b) => a - b) })
  }
  data[date] = filtered
  saveGrassData(data)
}

export function syncGrassFromPlanSave(bookCode: string, prevStatus: number[], newStatus: number[]): void {
  const prevChapters: number[] = []
  const newChapters: number[] = []
  for (let i = 0; i < Math.max(prevStatus.length, newStatus.length); i++) {
    if ((prevStatus[i] ?? 0) === 1) prevChapters.push(i + 1)
    if ((newStatus[i] ?? 0) === 1) newChapters.push(i + 1)
  }
  const today = todayString()
  const data = getGrassData()
  const dayRows = data[today] ?? []
  const current = dayRows.find((row) => row.bookCode === bookCode)?.readChapter ?? []
  const prevSet = new Set(prevChapters)
  const merged = [
    ...current.filter((ch) => !prevSet.has(ch)),
    ...newChapters,
  ]
    .filter((ch, idx, arr) => arr.indexOf(ch) === idx)
    .sort((a, b) => a - b)
  syncGrassForBook(today, bookCode, merged)
}

export function updatePlanGoalStatus(id: number, bookCode: string, nextStatus: number[]): void {
  const current = getPlans()
  const next = current.map((plan) => {
    if (plan.id !== id) return plan
    const prevStatus = plan.goalStatus[bookCode] ?? []
    syncGrassFromPlanSave(bookCode, prevStatus, nextStatus)
    return recalcPlan({
      ...plan,
      goalStatus: { ...plan.goalStatus, [bookCode]: nextStatus },
      updatedAt: nowString(),
    })
  })
  writeJson(PLANS_KEY, next)
}

export function setLastAutoSyncAt(value: string): void {
  if (!canUseStorage()) return
  localStorage.setItem(LAST_SYNC_KEY, value)
}

export function getLastAutoSyncAt(): string | null {
  if (!canUseStorage()) return null
  return localStorage.getItem(LAST_SYNC_KEY)
}

export type LocalSyncPayload = {
  exportedAt: string
  source: "localstorage"
  tables: {
    bible_state: BibleSearchInfo
    favorite_verses: FavoriteVerseRecord[]
    memos: MemoRecord[]
    prayers: PrayRecord[]
    plans: PlanRecord[]
    bible_grass: GrassDataMap
    app_settings: { theme: AppTheme; language: AppLanguage }
  }
}

export function exportLocalDataJson(): string {
  const payload: LocalSyncPayload = {
    exportedAt: new Date().toISOString(),
    source: "localstorage",
    tables: {
      bible_state: getBibleSearchInfo(),
      favorite_verses: getFavoriteVerseRecords(),
      memos: getMemos(),
      prayers: getPrayers(),
      plans: getPlans(),
      bible_grass: getGrassData(),
      app_settings: getAppSettings(),
    },
  }
  return JSON.stringify(payload)
}

export function importLocalDataJson(raw: string): void {
  const parsed = JSON.parse(raw) as Partial<LocalSyncPayload>
  const tables = parsed.tables
  if (!tables) return
  if (tables.bible_state) writeJson(BIBLE_STATE_KEY, tables.bible_state)
  if (Array.isArray(tables.favorite_verses)) writeJson(FAVORITES_KEY, tables.favorite_verses)
  if (Array.isArray(tables.memos)) writeJson(MEMOS_KEY, tables.memos)
  if (Array.isArray(tables.prayers)) writeJson(PRAYERS_KEY, tables.prayers)
  if (Array.isArray(tables.plans)) writeJson(PLANS_KEY, tables.plans)
  if (tables.bible_grass && typeof tables.bible_grass === "object") writeJson(GRASS_KEY, tables.bible_grass)
  if (tables.app_settings) writeJson(APP_SETTINGS_KEY, tables.app_settings)
}
