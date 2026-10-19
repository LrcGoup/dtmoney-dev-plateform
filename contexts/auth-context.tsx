'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '@/lib/api'
import { clearSession, getAccessToken, getStoredClient, setAccessToken, setClientStub } from '@/lib/auth-storage'
import type { ConnectAppProfile } from '@/lib/types'
import { sessionAppFromAuth } from '@/lib/types'

interface AuthContextValue {
  token: string | null
  client: { id: string; email: string; name: string | null; status: string } | null
  account: ConnectAppProfile | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshAccount: () => Promise<void>
  setAuthFromVerify: (
    accessToken: string,
    email: string,
    connectApp?: { id: string; email: string; name: string | null; status: string },
  ) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [client, setClient] = useState<AuthContextValue['client']>(null)
  const [account, setAccount] = useState<ConnectAppProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshAccount = useCallback(async () => {
    const t = getAccessToken()
    if (!t) {
      setAccount(null)
      return
    }
    try {
      const profile = await api.getAccount()
      setAccount(profile)
      const clientStub = {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        status: profile.status,
      }
      setClient(clientStub)
      setClientStub(clientStub)
    } catch {
      clearSession()
      setToken(null)
      setClient(null)
      setAccount(null)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    const bootstrap = async () => {
      const stored = getStoredClient()
      if (stored) setClient(stored)

      try {
        const refreshed = await api.refreshSession()
        if (cancelled) return
        setAccessToken(refreshed.accessToken)
        setToken(refreshed.accessToken)
        const sessionApp = sessionAppFromAuth(refreshed)
        if (sessionApp) {
          setClient(sessionApp)
          setClientStub(sessionApp)
        }
        await refreshAccount()
      } catch {
        // Re-read after await: SSO handoff may have set a token while refresh failed.
        // Never call setToken(null) here — that races with /auth/sso.
        if (cancelled) return
        const existing = getAccessToken()
        if (existing) {
          setToken(existing)
          await refreshAccount()
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void bootstrap()
    return () => {
      cancelled = true
    }
  }, [refreshAccount])

  const login = useCallback(
    async (email: string, password: string) => {
      const data = await api.login(email, password)
      setAccessToken(data.accessToken)
      setToken(data.accessToken)
      const sessionApp = sessionAppFromAuth(data)
      if (sessionApp) {
        setClient(sessionApp)
        setClientStub(sessionApp)
      }
      await refreshAccount()
    },
    [refreshAccount],
  )

  const logout = useCallback(async () => {
    try {
      await api.logout()
    } catch {
      // ignore
    }
    clearSession()
    setToken(null)
    setClient(null)
    setAccount(null)
  }, [])

  const setAuthFromVerify = useCallback(
    (
      accessToken: string,
      email: string,
      connectApp?: { id: string; email: string; name: string | null; status: string },
    ) => {
      const stub = connectApp ?? { id: '', email, name: null, status: 'active' }
      setAccessToken(accessToken)
      setToken(accessToken)
      setClient(stub)
      setClientStub(stub)
      void refreshAccount()
    },
    [refreshAccount],
  )

  const value = useMemo(
    () => ({ token, client, account, loading, login, logout, refreshAccount, setAuthFromVerify }),
    [token, client, account, loading, login, logout, refreshAccount, setAuthFromVerify],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
