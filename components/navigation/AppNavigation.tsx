"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { HiOutlineBookOpen, HiOutlineCog6Tooth, HiOutlineUser } from "react-icons/hi2"
import { useI18n } from "@/utils/i18n"

const DEFAULT_BIBLE_ROUTE = "/bibles/genesis.1.ko.none"

export default function AppNavigation() {
  const pathname = usePathname()
  const { t } = useI18n()

  const items = [
    { href: DEFAULT_BIBLE_ROUTE, icon: HiOutlineBookOpen, label: t("tabs.bible"), match: "/bibles" },
    { href: "/my", icon: HiOutlineUser, label: t("tabs.my"), match: "/my" },
    { href: "/settings", icon: HiOutlineCog6Tooth, label: t("tabs.settings"), match: "/settings" },
  ]

  return (
    <nav className="fixed bottom-0 left-1/2 z-50 w-full max-w-[460px] -translate-x-1/2 border-t border-base-300 bg-base-100 md:bottom-auto md:top-0 md:border-b md:border-t-0">
      <ul className="grid grid-cols-3">
        {items.map((item) => {
          const active = pathname.startsWith(item.match)
          const Icon = item.icon
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex h-16 flex-col items-center justify-center gap-1 text-xs transition-colors ${
                  active ? "text-primary" : "text-base-content/70"
                }`}
              >
                <Icon className="text-xl" />
                <span>{item.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
