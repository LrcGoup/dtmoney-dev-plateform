'use client'

import { FormEvent, useEffect, useState } from 'react'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardTitle } from '@/components/ui/card'
import { Input, Label } from '@/components/ui/input'
import { api, ApiError } from '@/lib/api'
import { useAuth } from '@/contexts/auth-context'

export default function ProviderSettlementPage() {
  const { account, refreshAccount } = useAuth()
  const [providerCode, setProviderCode] = useState('')
  const [providerDisplayLabel, setProviderDisplayLabel] = useState('')
  const [settlementCreditAccountType, setSettlementCreditAccountType] = useState<
    'PRIMARY' | 'PROVIDER_EARNINGS'
  >('PRIMARY')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!account) return
    setProviderCode(account.providerCode ?? '')
    setProviderDisplayLabel(account.providerDisplayLabel ?? '')
    setSettlementCreditAccountType(account.settlementCreditAccountType ?? 'PRIMARY')
  }, [account])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)
    try {
      const code = providerCode.trim().toUpperCase()
      const data = await api.updateAccountProvider({
        providerCode: code || null,
        settlementCreditAccountType,
        providerDisplayLabel: providerDisplayLabel.trim() || null,
      })
      setSuccess(data.message)
      await refreshAccount()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Enregistrement impossible')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardShell title="Provider & settlement">
      <div className="max-w-xl">
        <Card>
          <CardTitle>Configuration provider</CardTitle>
          <CardDescription>
            Détermine où sont crédités les gains de vos bénéficiaires (prestataires, partenaires) lors
            d’un settlement. Avec <strong className="text-slate-300">PROVIDER_EARNINGS</strong>, les
            fonds vont sur un sous-solde séparé du wallet DTMoney principal (transfert manuel requis
            côté app).
          </CardDescription>
          {account && !account.providerCode && (
            <Alert variant="info" className="mt-4">
              Choisissez un code provider unique et, si besoin,{' '}
              <strong>PROVIDER_EARNINGS</strong> pour isoler les gains de votre plateforme du wallet
              principal de vos utilisateurs.
            </Alert>
          )}
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            {error && <Alert variant="error">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            <div>
              <Label htmlFor="providerCode">Code provider</Label>
              <Input
                id="providerCode"
                placeholder="MY_PLATFORM"
                value={providerCode}
                onChange={(e) => setProviderCode(e.target.value.toUpperCase())}
                pattern="[A-Z][A-Z0-9_]*"
              />
              <p className="mt-1 text-xs text-slate-500">
                MAJUSCULES, unique par intégration (ex. LRC_JOBS, ACME_MARKET)
              </p>
            </div>

            <div>
              <Label htmlFor="label">Libellé UI</Label>
              <Input
                id="label"
                placeholder="Ma plateforme"
                value={providerDisplayLabel}
                onChange={(e) => setProviderDisplayLabel(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="accountType">Compte crédité au settlement</Label>
              <select
                id="accountType"
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200"
                value={settlementCreditAccountType}
                onChange={(e) =>
                  setSettlementCreditAccountType(e.target.value as 'PRIMARY' | 'PROVIDER_EARNINGS')
                }
              >
                <option value="PRIMARY">PRIMARY — wallet principal (legacy)</option>
                <option value="PROVIDER_EARNINGS">PROVIDER_EARNINGS — sous-solde provider</option>
              </select>
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </form>
        </Card>
      </div>
    </DashboardShell>
  )
}
