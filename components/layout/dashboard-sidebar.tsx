'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/cn'

const links = [
  { href: '/dashboard', label: 'Vue d’ensemble', exact: true },
  { href: '/dashboard/api-keys', label: 'Clés API' },
  { href: '/dashboard/webhooks', label: 'Webhooks' },
  { href: '/dashboard/docs', label: 'Documentation' },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-800 bg-slate-950">
      <div className="shrink-0 border-b border-slate-800 px-5 py-5">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-sm font-bold text-white">
            DT
          </div>
          <div>
            <div className="text-sm font-semibold text-white">DTMoney API</div>
            <div className="text-xs text-slate-500">Developer Platform</div>
          </div>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {links.map((link) => {
          const active = link.exact ? pathname === link.href : pathname.startsWith(link.href)
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'block rounded-lg px-3 py-2 text-sm transition',
                active ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200',
              )}
            >
              {link.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
