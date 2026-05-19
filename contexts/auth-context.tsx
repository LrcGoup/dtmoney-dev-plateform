'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '@/lib/api'
import { clearSession, getAccessToken, getStoredClient, setAccessToken, setClientStub } from '@/lib/auth-storage'
import type { ApiClientProfile } from '@/lib/types'

interface AuthContextValue {
  token: string | null
  client: { id: string; email: string; name: string | null; status: string } | null
  account: ApiClientProfile | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshAccount: () => Promise<void>
  setAuthFromVerify: (accessToken: string, email: string) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [client, setClient] = useState<AuthContextValue['client']>(null)
  const [account, setAccount] = useState<ApiClientProfile | null>(null)
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
    const bootstrap = async () => {
      const stored = getStoredClient()
      if (stored) setClient(stored)

      try {
        const refreshed = await api.refreshSession()
        setAccessToken(refreshed.accessToken)
        setToken(refreshed.accessToken)
        if (refreshed.apiClient) setClient(refreshed.apiClient)
        await refreshAccount()
      } catch {
        const existing = getAccessToken()
        setToken(existing)
        if (existing) await refreshAccount()
      } finally {
        setLoading(false)
      }
    }
    void bootstrap()
  }, [refreshAccount])

  const login = useCallback(
    async (email: string, password: string) => {
      const data = await api.login(email, password)
      setAccessToken(data.accessToken)
      setToken(data.accessToken)
      setClient(data.apiClient)
      setClientStub(data.apiClient)
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
    (accessToken: string, email: string) => {
      const stub = { id: '', email, name: null, status: 'active' }
      setAccessToken(accessToken)
      setToken(accessToken)
      setClient(stub)
      setClientStub(stub)
      refreshAccount()
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
