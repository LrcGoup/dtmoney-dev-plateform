'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { api, ApiError } from '@/lib/api'
import { setClientStub } from '@/lib/auth-storage'

function SsoHandoff() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setAuthFromVerify } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true

    const run = async () => {
      const userAccessToken = searchParams.get('userAccessToken')
      const connectAppId = searchParams.get('connectAppId') || undefined
      // Legacy: Connect accessToken already minted on dt-business (no refresh cookie on this origin)
      const legacyAccessToken = searchParams.get('accessToken')
      const legacyEmail = searchParams.get('email') || 'sso@connect'
      const legacyId = searchParams.get('connectAppId') || ''
      const legacyName = searchParams.get('name')
      const legacyStatus = searchParams.get('status') || 'active'

      try {
        if (userAccessToken) {
          const data = await api.loginFromUser(userAccessToken, connectAppId)
          if (!data.accessToken) {
            if (data.requiresConnectAppChoice) {
              setError('Plusieurs comptes Connect : rouvrez Connect API depuis dt-business.')
              return
            }
            setError('Session Connect incomplète.')
            return
          }
          const email = data.connectApp?.email || legacyEmail
          setAuthFromVerify(data.accessToken, email, data.connectApp ?? undefined)
          router.replace('/dashboard')
          return
        }

        if (legacyAccessToken) {
          setAuthFromVerify(legacyAccessToken, legacyEmail)
          if (legacyId) {
            try {
              setClientStub({
                id: legacyId,
                email: legacyEmail,
                name: legacyName || null,
                status: legacyStatus,
              })
            } catch {
              // ignore
            }
          }
          router.replace('/dashboard')
          return
        }

        router.replace('/login')
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : 'Connexion SSO impossible.'
        setError(message)
      }
    }

    void run()
  }, [searchParams, setAuthFromVerify, router])

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-sm text-red-400">{error}</p>
        <a href="/login" className="text-sm text-zinc-400 underline hover:text-zinc-200">
          Aller au login
        </a>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center text-sm text-zinc-500">
      Connexion Connect en cours…
    </main>
  )
}

export default function AuthSsoPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center text-sm text-zinc-500">
          Chargement…
        </main>
      }
    >
      <SsoHandoff />
    </Suspense>
  )
}
