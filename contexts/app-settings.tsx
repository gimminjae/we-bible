"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"
import {
  type AppLanguage,
  type AppTheme,
  getAppSettings,
  setAppSettings,
} from "@/utils/local-db"

type AppSettingsContextValue = {
  theme: AppTheme
  language: AppLanguage
  setTheme: (theme: AppTheme) => void
  toggleTheme: () => void
  setLanguage: (language: AppLanguage) => void
}

const AppSettingsContext = createContext<AppSettingsContextValue | null>(null)

export function AppSettingsProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<AppTheme>("light")
  const [language, setLanguageState] = useState<AppLanguage>("ko")

  useEffect(() => {
    const stored = getAppSettings()
    setThemeState(stored.theme)
    setLanguageState(stored.language)
  }, [])

  useEffect(() => {
    setAppSettings({ theme, language })
    document.documentElement.classList.toggle("dark", theme === "dark")
    document.documentElement.setAttribute(
      "data-theme",
      theme === "dark" ? "we-bible-dark" : "we-bible-light"
    )
  }, [theme, language])

  const value = useMemo<AppSettingsContextValue>(
    () => ({
      theme,
      language,
      setTheme: setThemeState,
      toggleTheme: () => setThemeState((prev) => (prev === "light" ? "dark" : "light")),
      setLanguage: setLanguageState,
    }),
    [theme, language]
  )

  return <AppSettingsContext.Provider value={value}>{children}</AppSettingsContext.Provider>
}

export function useAppSettings(): AppSettingsContextValue {
  const ctx = useContext(AppSettingsContext)
  if (!ctx) {
    throw new Error("useAppSettings must be used inside AppSettingsProvider")
  }
  return ctx
}
