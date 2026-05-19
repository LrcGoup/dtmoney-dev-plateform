'use client'

import { FormEvent, useEffect, useState } from 'react'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { Alert } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardTitle } from '@/components/ui/card'
import { Input, Label } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { api, ApiError } from '@/lib/api'
import { useAuth } from '@/contexts/auth-context'
import type { WebhookEventDoc } from '@/lib/types'

export default function WebhooksPage() {
  const { account, refreshAccount } = useAuth()
  const [webhookUrl, setWebhookUrl] = useState('')
  const [webhookSecret, setWebhookSecret] = useState('')
  const [events, setEvents] = useState<WebhookEventDoc[]>([])
  const [signatureHeader, setSignatureHeader] = useState('X-DTMoney-Signature')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (account?.webhookUrl) setWebhookUrl(account.webhookUrl)
  }, [account?.webhookUrl])

  useEffect(() => {
    api
      .listWebhookEvents()
      .then((data) => {
        setEvents(data.events)
        setSignatureHeader(data.signatureHeader)
      })
      .catch(() => {})
  }, [])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)
    try {
      const data = await api.updateWebhooks(
        webhookUrl.trim() || '',
        webhookSecret.trim() || undefined,
      )
      setSuccess(data.message)
      setWebhookSecret('')
      await refreshAccount()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Enregistrement impossible')
    } finally {
      setLoading(false)
    }
  }

  async function disableWebhooks() {
    setLoading(true)
    try {
      await api.updateWebhooks('', '')
      setWebhookUrl('')
      setWebhookSecret('')
      setSuccess('Webhooks désactivés')
      await refreshAccount()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erreur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardShell title="Webhooks">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle>Configuration</CardTitle>
          <CardDescription>
            DTMoney enverra un POST JSON signé HMAC SHA-256 à votre URL après chaque événement.
          </CardDescription>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            {error && <Alert variant="error">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}
            {account?.webhookSecretConfigured && (
              <Alert variant="info">Un secret webhook est déjà configuré. Laissez vide pour le conserver.</Alert>
            )}
            <div>
              <Label htmlFor="url">URL de callback</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://votre-app.com/webhooks/dtmoney"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="secret">Secret (optionnel)</Label>
              <PasswordInput
                id="secret"
                placeholder="whsec_…"
                value={webhookSecret}
                onChange={(e) => setWebhookSecret(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <Button type="submit" disabled={loading}>
                {loading ? 'Enregistrement…' : 'Enregistrer'}
              </Button>
              <Button type="button" variant="outline" disabled={loading} onClick={disableWebhooks}>
                Désactiver
              </Button>
            </div>
          </form>
        </Card>

        <Card>
          <CardTitle>Événements disponibles</CardTitle>
          <CardDescription>
            Header de signature : <code className="text-emerald-400">{signatureHeader}</code>
          </CardDescription>
          <ul className="mt-6 space-y-4">
            {events.map((ev) => (
              <li key={ev.event} className="rounded-lg border border-slate-800 p-4">
                <Badge tone="success">{ev.event}</Badge>
                <p className="mt-2 text-sm text-slate-400">{ev.description}</p>
              </li>
            ))}
          </ul>
          <pre className="mt-6 overflow-x-auto rounded-lg bg-slate-950/80 p-4 text-xs text-slate-400">
            {`// Vérification Node.js
const crypto = require('crypto')
const sig = req.headers['x-dtmoney-signature']
const expected = 'sha256=' + crypto
  .createHmac('sha256', secret)
  .update(rawBody)
  .digest('hex')`}
          </pre>
        </Card>
      </div>
    </DashboardShell>
  )
}
