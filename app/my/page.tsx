"use client"

import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import BibleGrass from "@/components/my/BibleGrass"
import { useI18n } from "@/utils/i18n"

function MyPage() {
  const { t } = useI18n()
  const { session } = useAuth()
  const name =
    (session?.user?.user_metadata?.name as string | undefined) ||
    session?.user?.email?.split("@")[0] ||
    "Guest"

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">{t("my.title")}</h1>
      <p className="text-base-content/70">{t("my.welcome", { name })}</p>
      <BibleGrass />

      <Link href="/my/favorites" className="card border border-base-300 bg-base-100 transition hover:shadow">
        <div className="card-body p-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold">{t("my.favorites")}</span>
            <span>→</span>
          </div>
        </div>
      </Link>

      <Link href="/my/memos" className="card border border-base-300 bg-base-100 transition hover:shadow">
        <div className="card-body p-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold">{t("my.memos")}</span>
            <span>→</span>
          </div>
        </div>
      </Link>
      <Link href="/my/prayers" className="card border border-base-300 bg-base-100 transition hover:shadow">
        <div className="card-body p-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold">{t("my.prayers")}</span>
            <span>→</span>
          </div>
        </div>
      </Link>
      <Link href="/my/plans" className="card border border-base-300 bg-base-100 transition hover:shadow">
        <div className="card-body p-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold">{t("my.plans")}</span>
            <span>→</span>
          </div>
        </div>
      </Link>
    </section>
  )
}

export default MyPage
