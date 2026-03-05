"use client"

import Link from "next/link"
import { deleteFavorite, getAllFavorites } from "@/utils/local-db"
import { formatDateTime } from "@/utils/format"
import { useI18n } from "@/utils/i18n"
import { useMemo, useState } from "react"

export default function FavoritesPage() {
  const { t } = useI18n()
  const [version, setVersion] = useState(0)
  const rows = useMemo(() => getAllFavorites(), [version])

  return (
    <section className="space-y-4">
      <h1 className="text-xl font-bold">{t("my.favorites")}</h1>
      {!rows.length ? (
        <div className="rounded-xl border border-base-300 bg-base-100 p-4 text-sm text-base-content/60">
          {t("my.emptyFavorites")}
        </div>
      ) : (
        <ul className="space-y-2">
          {rows.map((row) => (
            <li key={`${row.bookCode}-${row.chapter}-${row.verse}`} className="rounded-xl border border-base-300 bg-base-100 p-3">
              <div className="text-xs text-base-content/60">{formatDateTime(row.createdAt)}</div>
              <div className="mt-1 text-sm">{row.verseText}</div>
              <div className="mt-2 flex items-center justify-between">
                <Link
                  href={`/bibles/${row.bookCode}.${row.chapter}.ko.none`}
                  className="inline-flex text-sm text-primary"
                >
                  {t("my.goToVerse")}
                </Link>
                <button
                  type="button"
                  className="btn btn-ghost btn-xs text-error"
                  onClick={() => {
                    if (!window.confirm(t("common.confirmDelete"))) return
                    deleteFavorite(row.bookCode, row.chapter, row.verse)
                    setVersion((v) => v + 1)
                  }}
                >
                  {t("common.delete")}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
