'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'

export function DashboardShell({ children, title }: { children: React.ReactNode; title: string }) {
  const { token, client, loading, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !token) router.replace('/login')
  }, [loading, token, router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
        Chargement…
      </div>
    )
  }

  if (!token) return null

  return (
    <div className="min-h-screen bg-slate-950">
      <DashboardSidebar />
      <header className="fixed top-0 right-0 left-64 z-30 border-b border-slate-800 bg-slate-950/95 px-8 py-4 backdrop-blur">
        <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">{title}</h1>
          {client && <p className="text-sm text-slate-500">{client.email}</p>}
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => logout()}>
            Déconnexion
          </Button>
          <Link href="/">
            <Button variant="outline" size="sm">
              Site
            </Button>
          </Link>
        </div>
        </div>
      </header>
      <main className="min-h-screen pl-64 pt-20">
        <div className="p-8">{children}</div>
      </main>
    </div>
  )
}
