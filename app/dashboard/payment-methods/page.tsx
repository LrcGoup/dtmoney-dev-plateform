'use client'

import { useCallback, useEffect, useState } from 'react'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardTitle } from '@/components/ui/card'
import { api, ApiError } from '@/lib/api'

type MethodRow = {
  type: string
  label: string
  enabled: boolean
  available: boolean
  comingSoon?: boolean
}

export default function PaymentMethodsPage() {
  const [catalog, setCatalog] = useState<MethodRow[]>([])
  const [enabled, setEnabled] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setError(null)
    try {
      const data = await api.getPaymentMethods()
      setCatalog(data.catalog)
      setEnabled(new Set(data.enabledMethods))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Impossible de charger les moyens de paiement')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const toggle = (type: string) => {
    if (type === 'WALLET_PHONE') return
    setEnabled((prev) => {
      const next = new Set(prev)
      if (next.has(type)) next.delete(type)
      else next.add(type)
      return next
    })
  }

  const save = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const res = await api.updatePaymentMethods([...enabled])
      setSuccess(res.message)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Enregistrement impossible')
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardShell title="Moyens de paiement">
      {error && <Alert variant="error">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Card className="max-w-2xl">
        <CardTitle>Orchestration des paiements</CardTitle>
        <div className="mt-2">
          <CardDescription>
            Activez les instruments acceptés sur votre intégration. Tous les paiements passent par{' '}
            <code className="text-emerald-400">POST /payments/confirm</code> avec{' '}
            <code className="text-emerald-400">paymentMethod.type</code>.
          </CardDescription>
        </div>

        {loading ? (
          <p className="mt-6 text-sm text-slate-400">Chargement…</p>
        ) : (
          <ul className="mt-6 space-y-3">
            {catalog.map((m) => (
              <li
                key={m.type}
                className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/40 px-4 py-3"
              >
                <div>
                  <p className="font-medium text-white">{m.label}</p>
                  <p className="text-xs text-slate-500">{m.type}</p>
                </div>
                {m.comingSoon ? (
                  <span className="text-xs text-slate-500">Bientôt</span>
                ) : (
                  <Button
                    variant={enabled.has(m.type) ? 'primary' : 'outline'}
                    size="sm"
                    disabled={m.type === 'WALLET_PHONE'}
                    onClick={() => toggle(m.type)}
                  >
                    {enabled.has(m.type) ? 'Activé' : 'Désactivé'}
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-6">
          <Button onClick={save} disabled={saving || loading}>
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </Button>
        </div>
      </Card>
    </DashboardShell>
  )
}
