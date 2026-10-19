import Link from 'next/link'
import { redirect } from 'next/navigation'

/**
 * Self-service Connect registration removed (2026-10-19).
 * Onboarding = invite DT Business (DEVELOPER) → SSO from-user.
 */
export default function RegisterRemovedPage({
  searchParams,
}: {
  searchParams?: { stay?: string }
}) {
  if (searchParams?.stay !== '1') {
    redirect('/login?notice=register-disabled')
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center gap-4 px-4 py-16">
      <h1 className="text-2xl font-semibold text-slate-100">Inscription désactivée</h1>
      <p className="text-sm text-slate-400">
        Les comptes Connect se créent via une invitation Développeur dans DT Business, puis
        l’ouverture SSO depuis le portail enseigne.
      </p>
      <Link href="/login" className="text-sm font-medium text-emerald-400 hover:underline">
        Aller à la connexion
      </Link>
    </main>
  )
}
