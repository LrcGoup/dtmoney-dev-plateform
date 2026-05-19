'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { FormEvent, Suspense, useState } from 'react'
import { MarketingNav } from '@/components/layout/marketing-nav'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardTitle } from '@/components/ui/card'
import { Input, Label } from '@/components/ui/input'
import { api, ApiError } from '@/lib/api'
import { useAuth } from '@/contexts/auth-context'

function VerifyEmailForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { setAuthFromVerify } = useAuth()
  const [email, setEmail] = useState(searchParams.get('email') ?? '')
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const data = await api.verifyEmail(email.trim().toLowerCase(), code.trim())
      setAuthFromVerify(data.accessToken, email.trim().toLowerCase())
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Vérification impossible')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardTitle>Vérifier votre email</CardTitle>
      <CardDescription>Saisissez le code à 5 chiffres reçu par email</CardDescription>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {error && <Alert variant="error">{error}</Alert>}
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="code">Code OTP</Label>
          <Input
            id="code"
            inputMode="numeric"
            pattern="[0-9]{5}"
            maxLength={5}
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="12345"
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Vérification…' : 'Vérifier et accéder au dashboard'}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        <Link href="/login" className="text-emerald-400 hover:underline">
          Retour à la connexion
        </Link>
      </p>
    </Card>
  )
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <MarketingNav />
      <div className="mx-auto max-w-md px-6 py-16">
        <Suspense fallback={<p className="text-center text-slate-500">Chargement…</p>}>
          <VerifyEmailForm />
        </Suspense>
      </div>
    </div>
  )
}
