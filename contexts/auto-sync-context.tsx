"use client"

import { useAuth } from "@/contexts/auth-context"
import {
  exportLocalDataJson,
  importLocalDataJson,
  setLastAutoSyncAt,
} from "@/utils/local-db"
import { useEffect, useRef } from "react"

const UPLOAD_API_BASE = "https://qclmg1xbkl.execute-api.us-east-1.amazonaws.com/stage-1/"
const S3_SYNC_BASE = "https://webible.s3.ap-northeast-2.amazonaws.com/users-sqlite-file"

function nowString(): string {
  const d = new Date()
  const pad = (n: number) => n.toString().padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

export function AutoSyncProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth()
  const prevUserIdRef = useRef<string | null>(null)
  const initializedRef = useRef(false)
  const syncingRef = useRef(false)

  useEffect(() => {
    const upload = async (userId: string) => {
      if (syncingRef.current) return
      syncingRef.current = true
      try {
        const url = `${UPLOAD_API_BASE}?userId=${encodeURIComponent(userId)}`
        const body = exportLocalDataJson()
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
          keepalive: true,
        })
        if (res.ok) {
          setLastAutoSyncAt(nowString())
        }
      } catch {
        // ignore
      } finally {
        syncingRef.current = false
      }
    }

    const onHidden = () => {
      const userId = session?.user?.id
      if (!userId) return
      if (document.visibilityState === "hidden") {
        void upload(userId)
      }
    }

    document.addEventListener("visibilitychange", onHidden)
    window.addEventListener("beforeunload", onHidden)
    return () => {
      document.removeEventListener("visibilitychange", onHidden)
      window.removeEventListener("beforeunload", onHidden)
    }
  }, [session?.user?.id])

  useEffect(() => {
    const pullOnLogin = async (userId: string) => {
      try {
        const url = `${S3_SYNC_BASE}/${encodeURIComponent(userId)}.json`
        const res = await fetch(url, { method: "GET" })
        if (res.status === 404 || !res.ok) return
        const raw = await res.text()
        if (!raw.trim()) return
        importLocalDataJson(raw)
      } catch {
        // ignore
      }
    }

    const currentUserId = session?.user?.id ?? null
    const prevUserId = prevUserIdRef.current

    if (!initializedRef.current) {
      initializedRef.current = true
      prevUserIdRef.current = currentUserId
      return
    }

    if (!prevUserId && currentUserId) {
      void pullOnLogin(currentUserId)
    }
    prevUserIdRef.current = currentUserId
  }, [session?.user?.id])

  return <>{children}</>
}
