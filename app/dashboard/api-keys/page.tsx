'use client'

import { useCallback, useEffect, useState } from 'react'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { Alert } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardTitle } from '@/components/ui/card'
import { Input, Label } from '@/components/ui/input'
import { api, ApiError } from '@/lib/api'
import type { ApiKeyCreated, ApiKeyItem } from '@/lib/types'

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKeyItem[]>([])
  const [newKeyName, setNewKeyName] = useState('')
  const [revealedKey, setRevealedKey] = useState<ApiKeyCreated | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)

  const load = useCallback(async () => {
    setError(null)
    try {
      const data = await api.listApiKeys()
      setKeys(data.apiKeys)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Impossible de charger les clés')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function createKey() {
    setBusy('create')
    setError(null)
    try {
      const data = await api.createApiKey(newKeyName.trim() || undefined)
      setRevealedKey(data.apiKey)
      setNewKeyName('')
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Création impossible')
    } finally {
      setBusy(null)
    }
  }

  async function revoke(id: string) {
    if (!confirm('Révoquer cette clé ? Les requêtes avec cette clé seront rejetées.')) return
    setBusy(id)
    try {
      await api.revokeApiKey(id)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Révocation impossible')
    } finally {
      setBusy(null)
    }
  }

  async function rotate(id: string) {
    setBusy(`rotate-${id}`)
    try {
      const data = await api.rotateApiKey(id)
      setRevealedKey(data.apiKey)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Rotation impossible')
    } finally {
      setBusy(null)
    }
  }

  return (
    <DashboardShell title="Clés API">
      {error && <Alert variant="error" className="mb-6">{error}</Alert>}

      {revealedKey && (
        <Alert variant="success" className="mb-6">
          <p className="font-medium">Nouvelle clé — copiez-la maintenant, elle ne sera plus affichée :</p>
          <code className="mt-2 block break-all rounded bg-slate-950/80 p-3 font-mono text-sm text-emerald-300">
            {revealedKey.key}
          </code>
          <Button variant="ghost" size="sm" className="mt-3" onClick={() => setRevealedKey(null)}>
            J’ai copié la clé
          </Button>
        </Alert>
      )}

      <Card className="mb-6">
        <CardTitle>Créer une clé</CardTitle>
        <CardDescription>Utilisez l’en-tête HTTP <code className="text-emerald-400">dt-api-key</code> pour authentifier vos appels.</CardDescription>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Label htmlFor="keyName">Nom (optionnel)</Label>
            <Input
              id="keyName"
              placeholder="Production, Sandbox…"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
            />
          </div>
          <Button onClick={createKey} disabled={busy === 'create'}>
            {busy === 'create' ? 'Création…' : 'Générer une clé'}
          </Button>
        </div>
      </Card>

      <Card>
        <CardTitle>Clés existantes</CardTitle>
        {loading ? (
          <p className="mt-4 text-sm text-slate-500">Chargement…</p>
        ) : keys.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">Aucune clé API. Créez-en une pour commencer.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-slate-500">
                <tr className="border-b border-slate-800">
                  <th className="pb-3 pr-4 font-medium">Nom</th>
                  <th className="pb-3 pr-4 font-medium">Aperçu</th>
                  <th className="pb-3 pr-4 font-medium">Scopes</th>
                  <th className="pb-3 pr-4 font-medium">Statut</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {keys.map((k) => (
                  <tr key={k.id} className="border-b border-slate-800/60">
                    <td className="py-3 pr-4 text-slate-200">{k.name ?? '—'}</td>
                    <td className="py-3 pr-4 font-mono text-xs text-slate-400">{k.keyPreview}</td>
                    <td className="py-3 pr-4">
                      <div className="flex flex-wrap gap-1">
                        {k.scopes.slice(0, 2).map((s) => (
                          <Badge key={s}>{s}</Badge>
                        ))}
                        {k.scopes.length > 2 && <Badge>+{k.scopes.length - 2}</Badge>}
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <Badge tone={k.isActive ? 'success' : 'danger'}>{k.isActive ? 'Active' : 'Révoquée'}</Badge>
                    </td>
                    <td className="py-3">
                      {k.isActive && (
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" disabled={!!busy} onClick={() => rotate(k.id)}>
                            Rotation
                          </Button>
                          <Button variant="danger" size="sm" disabled={!!busy} onClick={() => revoke(k.id)}>
                            Révoquer
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </DashboardShell>
  )
}
