'use client'

import { FormEvent, useCallback, useEffect, useState } from 'react'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { Alert } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardTitle } from '@/components/ui/card'
import { Input, Label } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { api, ApiError } from '@/lib/api'
import { useAuth } from '@/contexts/auth-context'
import type {
  WebhookDeliveryDetail,
  WebhookDeliveryListItem,
  WebhookEventDoc,
} from '@/lib/types'

type StatusFilter = 'all' | 'success' | 'failed'

function statusTone(status: WebhookDeliveryListItem['status']): 'success' | 'warning' | 'danger' {
  if (status === 'delivered') return 'success'
  if (status === 'pending_retry') return 'warning'
  return 'danger'
}

function statusLabel(status: WebhookDeliveryListItem['status']): string {
  if (status === 'delivered') return 'Livré'
  if (status === 'pending_retry') return 'Nouvelle tentative prévue'
  return 'Échoué'
}

export default function WebhooksPage() {
  const { account, refreshAccount } = useAuth()
  const [webhookUrl, setWebhookUrl] = useState('')
  const [webhookSecret, setWebhookSecret] = useState('')
  const [events, setEvents] = useState<WebhookEventDoc[]>([])
  const [signatureHeader, setSignatureHeader] = useState('X-DTMoney-Signature')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const [deliveries, setDeliveries] = useState<WebhookDeliveryListItem[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [eventFilter, setEventFilter] = useState('')
  const [listLoading, setListLoading] = useState(false)
  const [listError, setListError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detail, setDetail] = useState<WebhookDeliveryDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [summaryVisible, setSummaryVisible] = useState(false)
  const [retryBusy, setRetryBusy] = useState(false)

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

  const loadDeliveries = useCallback(async () => {
    setListLoading(true)
    setListError(null)
    try {
      const data = await api.listWebhookDeliveries({
        page,
        pageSize: 15,
        event: eventFilter || undefined,
        success: statusFilter === 'all' ? undefined : statusFilter === 'success',
      })
      setDeliveries(data.items)
      setTotalPages(data.totalPages)
      setTotal(data.total)
    } catch (err) {
      setListError(err instanceof ApiError ? err.message : 'Impossible de charger les livraisons')
    } finally {
      setListLoading(false)
    }
  }, [page, eventFilter, statusFilter])

  useEffect(() => {
    void loadDeliveries()
  }, [loadDeliveries])

  async function openDetail(id: string) {
    setSelectedId(id)
    setSummaryVisible(false)
    setDetail(null)
    setDetailLoading(true)
    setListError(null)
    try {
      const data = await api.getWebhookDelivery(id, false)
      setDetail(data)
    } catch (err) {
      setListError(err instanceof ApiError ? err.message : 'Détail indisponible')
    } finally {
      setDetailLoading(false)
    }
  }

  async function revealSummary() {
    if (!selectedId) return
    setDetailLoading(true)
    try {
      const data = await api.getWebhookDelivery(selectedId, true)
      setDetail(data)
      setSummaryVisible(true)
    } catch (err) {
      setListError(err instanceof ApiError ? err.message : 'Résumé indisponible')
    } finally {
      setDetailLoading(false)
    }
  }

  async function onRetry() {
    if (!detail?.canRetry) return
    const confirmed = window.confirm(
      'Relancer cette livraison échouée ? Le même événement sera renvoyé (pas de nouveau paiement).',
    )
    if (!confirmed) return
    setRetryBusy(true)
    setListError(null)
    try {
      const data = await api.retryWebhookDelivery(detail.id)
      setDetail(data)
      setSuccess(
        data.success
          ? 'Relance réussie — livraison confirmée.'
          : 'Relance effectuée — la livraison a encore échoué (voir code HTTP).',
      )
      await loadDeliveries()
    } catch (err) {
      setListError(err instanceof ApiError ? err.message : 'Relance impossible')
    } finally {
      setRetryBusy(false)
    }
  }

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
              <Alert variant="info">
                Un secret webhook est déjà configuré. Laissez vide pour le conserver.
              </Alert>
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
        </Card>
      </div>

      <Card className="mt-6">
        <CardTitle>Livraisons</CardTitle>
        <CardDescription>
          Historique des tentatives pour ce ConnectApp. Les secrets et le payload brut ne sont pas
          exposés. La relance réutilise le même identifiant de livraison.
        </CardDescription>

        <div className="mt-4 flex flex-wrap items-end gap-3">
          <div>
            <Label htmlFor="statusFilter">Statut</Label>
            <select
              id="statusFilter"
              className="mt-1 block rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              value={statusFilter}
              onChange={(e) => {
                setPage(1)
                setStatusFilter(e.target.value as StatusFilter)
              }}
            >
              <option value="all">Tous</option>
              <option value="success">Livrés</option>
              <option value="failed">Échoués / en attente</option>
            </select>
          </div>
          <div>
            <Label htmlFor="eventFilter">Événement</Label>
            <Input
              id="eventFilter"
              placeholder="payment.succeeded"
              value={eventFilter}
              onChange={(e) => {
                setPage(1)
                setEventFilter(e.target.value)
              }}
            />
          </div>
          <Button type="button" variant="outline" disabled={listLoading} onClick={() => void loadDeliveries()}>
            Actualiser
          </Button>
        </div>

        {listError && (
          <div className="mt-4">
            <Alert variant="error">{listError}</Alert>
          </div>
        )}

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="px-2 py-2">Événement</th>
                <th className="px-2 py-2">Statut</th>
                <th className="px-2 py-2">HTTP</th>
                <th className="px-2 py-2">Tentatives</th>
                <th className="px-2 py-2">Créé</th>
                <th className="px-2 py-2" />
              </tr>
            </thead>
            <tbody>
              {listLoading && (
                <tr>
                  <td colSpan={6} className="px-2 py-6 text-slate-400">
                    Chargement…
                  </td>
                </tr>
              )}
              {!listLoading && deliveries.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-2 py-6 text-slate-400">
                    Aucune livraison pour ces filtres.
                  </td>
                </tr>
              )}
              {deliveries.map((row) => (
                <tr key={row.id} className="border-t border-slate-800">
                  <td className="px-2 py-3 font-mono text-xs">{row.event}</td>
                  <td className="px-2 py-3">
                    <Badge tone={statusTone(row.status)}>{statusLabel(row.status)}</Badge>
                  </td>
                  <td className="px-2 py-3">{row.responseCode ?? '—'}</td>
                  <td className="px-2 py-3">{row.attempts}</td>
                  <td className="px-2 py-3 text-slate-400">
                    {new Date(row.createdAt).toLocaleString()}
                  </td>
                  <td className="px-2 py-3 text-right">
                    <Button type="button" variant="outline" onClick={() => void openDetail(row.id)}>
                      Détail
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-400">
          <span>
            {total} livraison{total === 1 ? '' : 's'} · page {page}/{totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={page <= 1 || listLoading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Précédent
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={page >= totalPages || listLoading}
              onClick={() => setPage((p) => p + 1)}
            >
              Suivant
            </Button>
          </div>
        </div>

        {(detailLoading || detail) && (
          <div className="mt-6 rounded-lg border border-slate-800 p-4">
            <h3 className="text-sm font-semibold text-slate-200">Détail de livraison</h3>
            {detailLoading && !detail && <p className="mt-2 text-sm text-slate-400">Chargement…</p>}
            {detail && (
              <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-slate-500">Delivery ID</dt>
                  <dd className="font-mono text-xs">{detail.id}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Événement</dt>
                  <dd>{detail.event}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Statut</dt>
                  <dd>
                    <Badge tone={statusTone(detail.status)}>{statusLabel(detail.status)}</Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Code HTTP</dt>
                  <dd>{detail.responseCode ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Tentatives</dt>
                  <dd>{detail.attempts}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Prochaine tentative</dt>
                  <dd>
                    {detail.nextRetryAt
                      ? new Date(detail.nextRetryAt).toLocaleString()
                      : '—'}
                  </dd>
                </div>
              </dl>
            )}

            {detail && (
              <div className="mt-4 flex flex-wrap gap-2">
                {!summaryVisible ? (
                  <Button type="button" variant="outline" disabled={detailLoading} onClick={() => void revealSummary()}>
                    Afficher le résumé technique
                  </Button>
                ) : (
                  <pre className="w-full overflow-x-auto rounded-lg bg-slate-950/80 p-3 text-xs text-slate-300">
                    {JSON.stringify(detail.summary ?? {}, null, 2)}
                  </pre>
                )}
                {detail.canRetry ? (
                  <Button type="button" disabled={retryBusy} onClick={() => void onRetry()}>
                    {retryBusy ? 'Relance…' : 'Relancer la livraison'}
                  </Button>
                ) : (
                  detail.retryBlockedReason && (
                    <p className="text-xs text-slate-500">{detail.retryBlockedReason}</p>
                  )
                )}
              </div>
            )}
          </div>
        )}
      </Card>
    </DashboardShell>
  )
}
