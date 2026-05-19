'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '@/lib/api'
import { clearSession, getStoredClient, getToken, setSession } from '@/lib/auth-storage'
import type { ApiClientProfile } from '@/lib/types'

interface AuthContextValue {
  token: string | null
  client: { id: string; email: string; name: string | null; status: string } | null
  account: ApiClientProfile | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
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
    const t = getToken()
    if (!t) {
      setAccount(null)
      return
    }
    try {
      const profile = await api.getAccount()
      setAccount(profile)
      setClient({
        id: profile.id,
        email: profile.email,
        name: profile.name,
        status: profile.status,
      })
    } catch {
      clearSession()
      setToken(null)
      setClient(null)
      setAccount(null)
    }
  }, [])

  useEffect(() => {
    const t = getToken()
    const c = getStoredClient()
    setToken(t)
    setClient(c)
    if (t) {
      refreshAccount().finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [refreshAccount])

  const login = useCallback(async (email: string, password: string) => {
    const data = await api.login(email, password)
    setSession(data.accessToken, data.apiClient)
    setToken(data.accessToken)
    setClient(data.apiClient)
    await refreshAccount()
  }, [refreshAccount])

  const logout = useCallback(() => {
    clearSession()
    setToken(null)
    setClient(null)
    setAccount(null)
  }, [])

  const setAuthFromVerify = useCallback(
    (accessToken: string, email: string) => {
      const stub = { id: '', email, name: null, status: 'active' }
      setSession(accessToken, stub)
      setToken(accessToken)
      setClient(stub)
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
