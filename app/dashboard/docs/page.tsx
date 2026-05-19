'use client'

import { DashboardShell } from '@/components/layout/dashboard-shell'
import { IntegrationGuideContent } from '@/components/docs/integration-guide-content'
import { integrationGuideSections } from '@/lib/integration-guide'

export default function DashboardDocsPage() {
  return (
    <DashboardShell title="Documentation">
      <div className="flex max-w-6xl gap-10">
        <aside className="hidden w-56 shrink-0 lg:block">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Guide d’intégration</p>
          <nav className="sticky top-20 space-y-1 text-sm">
            {integrationGuideSections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="block rounded-lg px-3 py-2 text-slate-400 transition hover:bg-slate-900 hover:text-emerald-400"
              >
                {s.title}
              </a>
            ))}
          </nav>
        </aside>
        <div className="min-w-0 flex-1">
          <IntegrationGuideContent />
        </div>
      </div>
    </DashboardShell>
  )
}
