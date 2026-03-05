"use client"

import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    let active = true
    const complete = async () => {
      if (!supabase) {
        router.replace("/settings")
        return
      }
      await supabase.auth.getSession()
      if (!active) return
      router.replace("/settings")
    }
    void complete()
    return () => {
      active = false
    }
  }, [router])

  return (
    <section className="flex min-h-[40vh] items-center justify-center">
      <span className="loading loading-spinner loading-md" />
    </section>
  )
}
