'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'
import { MarketingNav } from '@/components/layout/marketing-nav'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardTitle } from '@/components/ui/card'
import { DtmoneyPhoneInput } from '@/components/ui/dtmoney-phone-input'
import { Input, Label } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { api, ApiError } from '@/lib/api'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    email: '',
    password: '',
    phone: '',
    name: '',
    service: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [devCode, setDevCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [phoneCheck, setPhoneCheck] = useState<{
    loading: boolean
    valid: boolean
    message: string
    displayName?: string
    profileType?: string
  } | null>(null)

  async function verifyPhone(phone: string) {
    const trimmed = phone.trim()
    if (trimmed.length < 8) {
      setPhoneCheck(null)
      return
    }
    setPhoneCheck({ loading: true, valid: false, message: 'Vérification…' })
    try {
      const data = await api.verifyWalletPhone(trimmed)
      setPhoneCheck({
        loading: false,
        valid: true,
        message: `Compte trouvé — ${data.displayName} (${data.profileType})`,
        displayName: data.displayName,
        profileType: data.profileType,
      })
    } catch (err) {
      setPhoneCheck({
        loading: false,
        valid: false,
        message: err instanceof ApiError ? err.message : 'Numéro introuvable',
      })
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setDevCode(null)
    setLoading(true)
    try {
      try {
        const check = await api.verifyWalletPhone(form.phone.trim())
        setPhoneCheck({
          loading: false,
          valid: true,
          message: `Compte trouvé — ${check.displayName} (${check.profileType})`,
          displayName: check.displayName,
          profileType: check.profileType,
        })
      } catch (err) {
        const message = err instanceof ApiError ? err.message : 'Numéro introuvable'
        setPhoneCheck({ loading: false, valid: false, message })
        throw err
      }

      const data = await api.register({
        email: form.email.trim().toLowerCase(),
        password: form.password,
        phone: form.phone.trim(),
        name: form.name.trim() || undefined,
        service: form.service.trim() || undefined,
      })
      setInfo(data.message)
      if (data.devVerificationCode) setDevCode(data.devVerificationCode)
      router.push(`/verify-email?email=${encodeURIComponent(data.email)}`)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Inscription impossible')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <MarketingNav />
      <div className="mx-auto max-w-lg px-6 py-16">
        <Card>
          <CardTitle>Créer un compte développeur</CardTitle>
          <CardDescription>
            Liez votre wallet DTMoney (profil Agent, Marchand ou Partenaire) pour encaisser les paiements.
          </CardDescription>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            {error && <Alert variant="error">{error}</Alert>}
            {info && <Alert variant="success">{info}</Alert>}
            {devCode && (
              <Alert variant="info">
                Mode dev — code OTP : <code className="font-mono text-emerald-400">{devCode}</code>
              </Alert>
            )}
            <div>
              <Label htmlFor="email">Email développeur</Label>
              <Input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="password">Mot de passe</Label>
              <PasswordInput
                id="password"
                required
                minLength={8}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="phone">Numéro de téléphone DTMoney</Label>
              <DtmoneyPhoneInput
                id="phone"
                value={form.phone}
                disabled={loading}
                onChange={(phone) => {
                  setForm({ ...form, phone })
                  setPhoneCheck(null)
                }}
                onBlur={() => verifyPhone(form.phone)}
              />
              {phoneCheck && (
                <p
                  className={`mt-1.5 text-xs ${phoneCheck.valid ? 'text-emerald-400' : phoneCheck.loading ? 'text-slate-500' : 'text-red-400'}`}
                >
                  {phoneCheck.message}
                </p>
              )}
              <p className="mt-1 text-xs text-slate-500">
                Wallet qui recevra les paiements de votre intégration. Le compte doit exister sur DTMoney.
              </p>
            </div>
            <div>
              <Label htmlFor="name">Nom de l’intégration (optionnel)</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="service">Description du service (optionnel)</Label>
              <Input id="service" value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })} />
            </div>
            <Button type="submit" className="w-full" disabled={loading || phoneCheck?.loading}>
              {loading ? 'Création…' : 'Créer le compte'}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-500">
            Déjà inscrit ?{' '}
            <Link href="/login" className="text-emerald-400 hover:underline">
              Se connecter
            </Link>
          </p>
        </Card>
      </div>
    </div>
  )
}
