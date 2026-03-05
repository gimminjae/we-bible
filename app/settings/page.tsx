"use client"

import { useAppSettings } from "@/contexts/app-settings"
import { useAuth } from "@/contexts/auth-context"
import {
  exportLocalDataJson,
  getFavoriteVerseRecords,
  getLastAutoSyncAt,
  getMemos,
  importLocalDataJson,
  setLastAutoSyncAt,
} from "@/utils/local-db"
import { useI18n } from "@/utils/i18n"
import { useMemo, useState } from "react"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/
const DISPLAY_NAME_REGEX = /^[A-Za-z0-9가-힣._-]{2,20}$/

export default function SettingsPage() {
  const { theme, toggleTheme, language, setLanguage } = useAppSettings()
  const {
    isConfigured,
    session,
    loading: authLoading,
    signIn,
    signUp,
    signInWithGoogle,
    signInWithKakao,
    sendPasswordReset,
    updateDisplayName,
    updatePassword,
    signOut,
  } = useAuth()
  const { t } = useI18n()
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<"signIn" | "signUp">("signIn")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [authSubmitting, setAuthSubmitting] = useState(false)
  const [displayNameOpen, setDisplayNameOpen] = useState(false)
  const [displayNameInput, setDisplayNameInput] = useState("")
  const [displayNameSubmitting, setDisplayNameSubmitting] = useState(false)
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordSubmitting, setPasswordSubmitting] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)
  const [resetEmail, setResetEmail] = useState("")
  const [resetSubmitting, setResetSubmitting] = useState(false)

  const stats = useMemo(() => {
    return {
      favorites: getFavoriteVerseRecords().length,
      memos: getMemos().length,
      lastSync: getLastAutoSyncAt(),
    }
  }, [theme, language, session?.user?.id])

  const currentDisplayName = (session?.user?.user_metadata?.name ?? "").toString()
  const appProviders = (session?.user?.app_metadata?.providers as string[] | undefined) ?? []
  const identityProviders = ((session?.user?.identities ?? [])
    .map((identity) => identity.provider)
    .filter(Boolean) as string[])
  const canChangePassword = appProviders.includes("email") || identityProviders.includes("email")

  const handleExport = () => {
    const blob = new Blob([exportLocalDataJson()], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `we-bible-export-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    setLastAutoSyncAt(new Date().toISOString().slice(0, 19).replace("T", " "))
  }

  const handleImport = async () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "application/json"
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return
      const raw = await file.text()
      importLocalDataJson(raw)
      setLastAutoSyncAt(new Date().toISOString().slice(0, 19).replace("T", " "))
      location.reload()
    }
    input.click()
  }

  const handleEmailAuth = async () => {
    if (authMode === "signIn" && (!email.trim() || !password)) {
      window.alert(`${t("settings.loginFailed")}: ${t("settings.requiredEmail")}`)
      return
    }
    setAuthSubmitting(true)
    const run = authMode === "signIn" ? signIn : signUp
    const { error } = await run({ email: email.trim(), password })
    setAuthSubmitting(false)
    if (error) {
      window.alert(
        `${authMode === "signIn" ? t("settings.loginFailed") : t("settings.signUpFailed")}: ${error.message}`
      )
      return
    }
    if (authMode === "signUp") {
      window.alert("Check your email for verification.")
      setAuthMode("signIn")
      return
    }
    setAuthOpen(false)
  }

  const handleGoogle = async () => {
    setAuthSubmitting(true)
    const { error } = await signInWithGoogle()
    setAuthSubmitting(false)
    if (error) window.alert(`${t("settings.authError")}: ${error.message}`)
  }

  const handleKakao = async () => {
    setAuthSubmitting(true)
    const { error } = await signInWithKakao()
    setAuthSubmitting(false)
    if (error) window.alert(`${t("settings.authError")}: ${error.message}`)
  }

  const handleLogout = async () => {
    const ok = window.confirm("앱 내의 데이터가 더 이상 동기화되지 않습니다.\n로그아웃 하시겠습니까?")
    if (!ok) return
    const { error } = await signOut()
    if (error) window.alert(`${t("settings.logoutFailed")}: ${error.message}`)
  }

  const openDisplayName = () => {
    setDisplayNameInput(currentDisplayName)
    setDisplayNameOpen(true)
  }

  const handleDisplayNameSave = async () => {
    const normalized = displayNameInput.trim()
    if (!normalized) {
      window.alert(t("settings.displayNameRequired"))
      return
    }
    if (!DISPLAY_NAME_REGEX.test(normalized)) {
      window.alert(t("settings.displayNameInvalidRule"))
      return
    }
    setDisplayNameSubmitting(true)
    const { error } = await updateDisplayName(normalized)
    setDisplayNameSubmitting(false)
    if (error) {
      window.alert(`${t("settings.displayNameUpdateFailed")}: ${error.message}`)
      return
    }
    setDisplayNameOpen(false)
    window.alert(t("settings.displayNameUpdated"))
  }

  const handlePasswordChange = async () => {
    if (!canChangePassword) {
      window.alert(t("settings.passwordChangeEmailOnly"))
      return
    }
    if (!PASSWORD_REGEX.test(newPassword)) {
      window.alert(t("settings.passwordRule"))
      return
    }
    if (newPassword !== confirmPassword) {
      window.alert(t("settings.passwordMismatch"))
      return
    }
    setPasswordSubmitting(true)
    const { error } = await updatePassword(newPassword)
    setPasswordSubmitting(false)
    if (error) {
      window.alert(`${t("settings.passwordChangeFailed")}: ${error.message}`)
      return
    }
    setPasswordOpen(false)
    window.alert(t("settings.passwordChangeDone"))
    await signOut()
  }

  const handleSendReset = async () => {
    const normalized = resetEmail.trim()
    if (!normalized) {
      window.alert(t("settings.requiredEmail"))
      return
    }
    if (!EMAIL_REGEX.test(normalized)) {
      window.alert(t("settings.invalidEmail"))
      return
    }
    setResetSubmitting(true)
    const { error } = await sendPasswordReset(normalized)
    setResetSubmitting(false)
    if (error) {
      window.alert(`${t("settings.authError")}: ${error.message}`)
      return
    }
    setResetOpen(false)
    window.alert(t("settings.resetPasswordSent"))
  }

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">{t("settings.title")}</h1>

      <div className="card border border-base-300 bg-base-100">
        <div className="card-body">
          <h2 className="card-title text-base">{t("settings.theme")}</h2>
          <button type="button" className="btn btn-outline" onClick={toggleTheme}>
            {theme === "light" ? t("settings.light") : t("settings.dark")}
          </button>
        </div>
      </div>

      <div className="card border border-base-300 bg-base-100">
        <div className="card-body">
          <h2 className="card-title text-base">{t("settings.language")}</h2>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              className={`btn ${language === "ko" ? "btn-primary" : "btn-outline"}`}
              onClick={() => setLanguage("ko")}
            >
              한국어
            </button>
            <button
              type="button"
              className={`btn ${language === "en" ? "btn-primary" : "btn-outline"}`}
              onClick={() => setLanguage("en")}
            >
              English
            </button>
          </div>
        </div>
      </div>

      <div className="card border border-base-300 bg-base-100">
        <div className="card-body gap-3">
          <h2 className="card-title text-base">{t("settings.account")}</h2>
          {!isConfigured ? (
            <p className="text-sm text-base-content/70">{t("settings.authNotConfigured")}</p>
          ) : authLoading ? (
            <span className="loading loading-dots loading-sm" />
          ) : session?.user ? (
            <div className="space-y-2">
              <p className="text-sm text-base-content/70">{t("settings.connected")}</p>
              <p className="text-sm">{session.user.email}</p>
              <p className="text-sm text-base-content/70">
                {t("settings.displayNameLabel")}: {currentDisplayName || t("settings.displayNameEmpty")}
              </p>
              <div className="flex items-center justify-end gap-2">
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setResetOpen(true)}>
                  {t("settings.resetPassword")}
                </button>
                <button type="button" className="btn btn-outline btn-sm" onClick={openDisplayName}>
                  {t("settings.changeDisplayName")}
                </button>
                {canChangePassword ? (
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => setPasswordOpen(true)}>
                    {t("settings.changePassword")}
                  </button>
                ) : null}
                <button type="button" className="btn btn-outline btn-sm" onClick={handleLogout}>
                  {t("settings.logout")}
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm text-base-content/70">{t("settings.guest")}</p>
              <p className="text-sm text-base-content/70">{t("settings.syncHint")}</p>
              <button
                type="button"
                className="btn btn-primary btn-sm self-end"
                onClick={() => setAuthOpen(true)}
              >
                {t("settings.login")}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="card border border-base-300 bg-base-100">
        <div className="card-body gap-2">
          <div className="text-sm text-base-content/70">
            favorites: {stats.favorites} / memos: {stats.memos}
          </div>
          <div className="text-sm text-base-content/60">
            last sync: {stats.lastSync ?? "-"}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" className="btn btn-outline btn-sm" onClick={handleExport}>
              {t("settings.export")}
            </button>
            <button type="button" className="btn btn-outline btn-sm" onClick={handleImport}>
              {t("settings.import")}
            </button>
          </div>
        </div>
      </div>

      {authOpen ? (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="text-lg font-bold">{authMode === "signIn" ? t("settings.signIn") : t("settings.signUp")}</h3>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                className={`btn btn-sm ${authMode === "signIn" ? "btn-primary" : "btn-outline"}`}
                onClick={() => setAuthMode("signIn")}
              >
                {t("settings.signIn")}
              </button>
              <button
                type="button"
                className={`btn btn-sm ${authMode === "signUp" ? "btn-primary" : "btn-outline"}`}
                onClick={() => setAuthMode("signUp")}
              >
                {t("settings.signUp")}
              </button>
            </div>
            <div className="mt-3 space-y-2">
              <input
                type="email"
                className="input input-bordered w-full"
                placeholder={t("settings.email")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="password"
                className="input input-bordered w-full"
                placeholder={t("settings.password")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="btn btn-primary w-full"
                onClick={handleEmailAuth}
                disabled={authSubmitting}
              >
                {authMode === "signIn" ? t("settings.signIn") : t("settings.signUp")}
              </button>
              <button type="button" className="btn btn-outline w-full" onClick={handleGoogle} disabled={authSubmitting}>
                {t("settings.googleLogin")}
              </button>
              <button type="button" className="btn w-full border-0 bg-[#FEE500] text-[#191919]" onClick={handleKakao} disabled={authSubmitting}>
                {t("settings.kakaoLogin")}
              </button>
            </div>
            <div className="modal-action">
              <button type="button" className="btn" onClick={() => setAuthOpen(false)}>
                {t("common.cancel")}
              </button>
            </div>
          </div>
        </dialog>
      ) : null}
      {displayNameOpen ? (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="text-lg font-bold">{t("settings.displayNameTitle")}</h3>
            <input
              className="input input-bordered mt-3 w-full"
              placeholder={t("settings.displayNamePlaceholder")}
              value={displayNameInput}
              onChange={(e) => setDisplayNameInput(e.target.value)}
            />
            <div className="modal-action">
              <button type="button" className="btn" onClick={() => setDisplayNameOpen(false)}>
                {t("common.cancel")}
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleDisplayNameSave}
                disabled={displayNameSubmitting}
              >
                {t("common.save")}
              </button>
            </div>
          </div>
        </dialog>
      ) : null}
      {passwordOpen ? (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="text-lg font-bold">{t("settings.changePasswordTitle")}</h3>
            <div className="mt-3 space-y-2">
              <input
                type="password"
                className="input input-bordered w-full"
                placeholder={t("settings.newPassword")}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <input
                type="password"
                className="input input-bordered w-full"
                placeholder={t("settings.confirmPassword")}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <div className="modal-action">
              <button type="button" className="btn" onClick={() => setPasswordOpen(false)}>
                {t("common.cancel")}
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handlePasswordChange}
                disabled={passwordSubmitting}
              >
                {t("common.save")}
              </button>
            </div>
          </div>
        </dialog>
      ) : null}
      {resetOpen ? (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="text-lg font-bold">{t("settings.resetPasswordTitle")}</h3>
            <input
              type="email"
              className="input input-bordered mt-3 w-full"
              placeholder={t("settings.email")}
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
            />
            <div className="modal-action">
              <button type="button" className="btn" onClick={() => setResetOpen(false)}>
                {t("common.cancel")}
              </button>
              <button type="button" className="btn btn-primary" onClick={handleSendReset} disabled={resetSubmitting}>
                {t("settings.resetPassword")}
              </button>
            </div>
          </div>
        </dialog>
      ) : null}
    </section>
  )
}
