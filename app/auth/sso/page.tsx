'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'

function SsoHandoff() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setAuthFromVerify } = useAuth()

  useEffect(() => {
    const accessToken = searchParams.get('accessToken')
    const email = searchParams.get('email') || 'sso@connect'
    const connectAppId = searchParams.get('connectAppId') || ''
    const name = searchParams.get('name')
    const status = searchParams.get('status') || 'active'

    if (!accessToken) {
      router.replace('/login')
      return
    }

    setAuthFromVerify(accessToken, email)
    if (connectAppId && typeof window !== 'undefined') {
      const stub = {
        id: connectAppId,
        email,
        name: name || null,
        status,
      }
      try {
        localStorage.setItem('dtmoney_api_client', JSON.stringify(stub))
      } catch {
        // ignore
      }
    }
    router.replace('/dashboard')
  }, [searchParams, setAuthFromVerify, router])

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
