'use client'

import Link from 'next/link'
import { MarketingAuthActions } from '@/components/layout/marketing-auth-actions'

export function MarketingNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 font-bold text-white">
            DT
          </div>
          <span className="font-semibold text-white">DTMoney API</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-slate-400 md:flex">
          <Link href="#features" className="hover:text-white">
            Fonctionnalités
          </Link>
          <Link href="#integration" className="hover:text-white">
            Intégration
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <MarketingAuthActions />
        </div>
      </div>
    </header>
  )
}
