'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { FormEvent, Suspense, useEffect, useState } from 'react'
import { MarketingNav } from '@/components/layout/marketing-nav'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardTitle } from '@/components/ui/card'
import { Input, Label } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { ApiError } from '@/lib/api'
import { useAuth } from '@/contexts/auth-context'

function LoginForm() {
  const { login, token } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const registerDisabled = searchParams.get('notice') === 'register-disabled'

  useEffect(() => {
    if (token) router.replace('/dashboard')
  }, [token, router])

  if (token) return null

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(email.trim().toLowerCase(), password)
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Connexion impossible')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardTitle>Connexion développeur</CardTitle>
      <CardDescription>Accédez à votre dashboard DTMoney API</CardDescription>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {registerDisabled && (
          <Alert variant="info">
            L’inscription self-service est désactivée. Demandez une invitation Développeur dans
            DT Business, puis ouvrez Connect via SSO.
          </Alert>
        )}
        {error && <Alert variant="error">{error}</Alert>}
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="password">Mot de passe</Label>
          <PasswordInput
            id="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Connexion…' : 'Se connecter'}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        Pas encore de compte ? Demandez une invitation Développeur dans{' '}
        <Link href="https://business.dtmoney.cg" className="text-emerald-400 hover:underline">
          DT Business
        </Link>
        .
      </p>
    </Card>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <MarketingNav />
      <div className="mx-auto flex max-w-md flex-col px-6 py-16">
        <Suspense fallback={<Card><CardTitle>Connexion…</CardTitle></Card>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
