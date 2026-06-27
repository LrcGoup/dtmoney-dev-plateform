'use client'

import Link from 'next/link'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { Badge } from '@/components/ui/badge'
import { Card, CardDescription, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/auth-context'
import { getApiBaseUrl, getSwaggerUrl } from '@/lib/api'

export default function DashboardPage() {
  const { account } = useAuth()

  return (
    <DashboardShell title="Vue d’ensemble">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle>Compte développeur</CardTitle>
          <CardDescription>Informations de votre intégration DTMoney API</CardDescription>
          {account ? (
            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Email</dt>
                <dd className="text-slate-200">{account.email}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Statut</dt>
                <dd>
                  <Badge tone={account.status === 'active' ? 'success' : 'warning'}>{account.status}</Badge>
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Frais API</dt>
                <dd className="text-slate-200">{account.feePercentage}%</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Téléphone DTMoney</dt>
                <dd className="text-slate-200">{account.dtmoneyPhone ?? '—'}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Provider</dt>
                <dd className="text-slate-200">
                  {account.providerCode
                    ? `${account.providerDisplayLabel ?? account.providerCode} (${account.settlementCreditAccountType})`
                    : '—'}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Webhook</dt>
                <dd className="truncate text-slate-400">{account.webhookUrl ?? 'Non configuré'}</dd>
              </div>
            </dl>
          ) : (
            <p className="mt-4 text-sm text-slate-500">Chargement du profil…</p>
          )}
        </Card>

        <Card>
          <CardTitle>Démarrage rapide</CardTitle>
          <CardDescription>Prochaines étapes pour intégrer DTMoney</CardDescription>
          <ul className="mt-6 space-y-3 text-sm text-slate-300">
            <li>
              1.{' '}
              <Link href="/dashboard/api-keys" className="text-emerald-400 hover:underline">
                Créer une clé API
              </Link>
            </li>
            <li>
              2.{' '}
              <Link href="/dashboard/webhooks" className="text-emerald-400 hover:underline">
                Configurer les webhooks
              </Link>
            </li>
            <li>
              3.{' '}
              <Link href="/dashboard/provider-settlement" className="text-emerald-400 hover:underline">
                Configurer provider & settlement
              </Link>
              {account && !account.providerCode ? (
                <span className="ml-1 text-amber-400">(si gains séparés)</span>
              ) : null}
            </li>
            <li>
              4.{' '}
              <Link href="/dashboard/docs" className="text-emerald-400 hover:underline">
                Lire le guide d’intégration
              </Link>
            </li>
          </ul>
          <div className="mt-6 rounded-lg border border-slate-800 bg-slate-950/60 p-4">
            <p className="text-xs text-slate-500">Base URL API</p>
            <code className="mt-1 block break-all text-sm text-emerald-400">{getApiBaseUrl()}</code>
            <a
              href={getSwaggerUrl()}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-block text-sm text-slate-400 hover:text-emerald-400"
            >
              Ouvrir Swagger →
            </a>
          </div>
        </Card>
      </div>
    </DashboardShell>
  )
}
