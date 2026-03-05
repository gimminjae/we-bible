"use client"

import { isSupabaseConfigured, supabase } from "@/lib/supabase"
import type {
  AuthError,
  Session,
  SignInWithPasswordCredentials,
  SignUpWithPasswordCredentials,
} from "@supabase/supabase-js"
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"

const LOGIN_AT_KEY = "auth_login_at"
const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000

type AuthResult = { error: AuthError | null }

type AuthContextValue = {
  isConfigured: boolean
  session: Session | null
  loading: boolean
  signIn: (credentials: SignInWithPasswordCredentials) => Promise<AuthResult>
  signUp: (credentials: SignUpWithPasswordCredentials) => Promise<AuthResult>
  signInWithGoogle: () => Promise<AuthResult>
  signInWithKakao: () => Promise<AuthResult>
  sendPasswordReset: (email: string) => Promise<AuthResult>
  updateDisplayName: (displayName: string) => Promise<AuthResult>
  updatePassword: (newPassword: string) => Promise<AuthResult>
  signOut: () => Promise<AuthResult>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function getStoredLoginAt(): number | null {
  try {
    const raw = localStorage.getItem(LOGIN_AT_KEY)
    if (!raw) return null
    const n = Number(raw)
    return Number.isFinite(n) ? n : null
  } catch {
    return null
  }
}

function setStoredLoginAt(v: number): void {
  try {
    localStorage.setItem(LOGIN_AT_KEY, String(v))
  } catch {}
}

function clearStoredLoginAt(): void {
  try {
    localStorage.removeItem(LOGIN_AT_KEY)
  } catch {}
}

function toAuthError(message: string): AuthError {
  return { name: "AuthError", message, status: 400 } as AuthError
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase || !isSupabaseConfigured) {
      setLoading(false)
      return
    }
    const client = supabase

    let mounted = true
    const checkRollingExpiry = async () => {
      const { data } = await client.auth.getSession()
      const currentSession = data.session ?? null
      if (!currentSession) {
        clearStoredLoginAt()
        if (mounted) setSession(null)
        return
      }
      const loginAt = getStoredLoginAt()
      if (loginAt && Date.now() - loginAt > ONE_MONTH_MS) {
        await client.auth.signOut()
        clearStoredLoginAt()
        if (mounted) setSession(null)
        return
      }
      setStoredLoginAt(Date.now())
      if (mounted) setSession(currentSession)
    }

    void checkRollingExpiry().finally(() => {
      if (mounted) setLoading(false)
    })

    const { data } = client.auth.onAuthStateChange((_event, nextSession) => {
      if (nextSession) setStoredLoginAt(Date.now())
      else clearStoredLoginAt()
      setSession(nextSession)
    })

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        void checkRollingExpiry()
      }
    }
    document.addEventListener("visibilitychange", onVisible)

    return () => {
      mounted = false
      data.subscription.unsubscribe()
      document.removeEventListener("visibilitychange", onVisible)
    }
  }, [])

  const signIn = useCallback(async (credentials: SignInWithPasswordCredentials): Promise<AuthResult> => {
    if (!supabase) return { error: null }
    const { error } = await supabase.auth.signInWithPassword(credentials)
    return { error }
  }, [])

  const signUp = useCallback(async (credentials: SignUpWithPasswordCredentials): Promise<AuthResult> => {
    if (!supabase) return { error: null }
    const { error } = await supabase.auth.signUp(credentials)
    return { error }
  }, [])

  const signInWithGoogle = useCallback(async (): Promise<AuthResult> => {
    if (!supabase) return { error: null }
    const redirectTo = `${window.location.origin}/auth/callback`
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo, queryParams: { prompt: "select_account" } },
    })
    return { error }
  }, [])

  const signInWithKakao = useCallback(async (): Promise<AuthResult> => {
    if (!supabase) return { error: null }
    const redirectTo = `${window.location.origin}/auth/callback`
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: { redirectTo },
    })
    return { error }
  }, [])

  const sendPasswordReset = useCallback(async (email: string): Promise<AuthResult> => {
    if (!supabase) return { error: null }
    const redirectTo = `${window.location.origin}/settings`
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
    return { error }
  }, [])

  const updateDisplayName = useCallback(async (displayName: string): Promise<AuthResult> => {
    if (!supabase) return { error: null }
    const normalized = displayName.trim()
    const { data, error } = await supabase.auth.updateUser({
      data: { name: normalized },
    })
    if (!error && data.user) {
      setSession((prev) => (prev ? { ...prev, user: data.user } : prev))
    }
    return { error }
  }, [])

  const updatePassword = useCallback(async (newPassword: string): Promise<AuthResult> => {
    if (!supabase) return { error: null }
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    return { error }
  }, [])

  const signOut = useCallback(async (): Promise<AuthResult> => {
    if (!supabase) return { error: null }
    const { error } = await supabase.auth.signOut()
    if (!error) clearStoredLoginAt()
    return { error }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      isConfigured: isSupabaseConfigured,
      session,
      loading,
      signIn,
      signUp,
      signInWithGoogle,
      signInWithKakao,
      sendPasswordReset,
      updateDisplayName,
      updatePassword,
      signOut,
    }),
    [
      loading,
      session,
      sendPasswordReset,
      signIn,
      signInWithGoogle,
      signInWithKakao,
      signOut,
      signUp,
      updateDisplayName,
      updatePassword,
    ]
  )

  if (!isSupabaseConfigured && !loading && !session) {
    // keep silent; UI handles unconfigured state
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}

export function ensureSupabaseConfigured(): void {
  if (!isSupabaseConfigured) {
    throw toAuthError("Supabase is not configured.")
  }
}
