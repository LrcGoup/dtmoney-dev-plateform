'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'

export function MarketingAuthActions({ size = 'sm' }: { size?: 'sm' | 'lg' }) {
  const { token, loading } = useAuth()

  if (loading) return null

  if (token) {
    return (
      <Link href="/dashboard">
        <Button size={size}>Dashboard</Button>
      </Link>
    )
  }

  if (size === 'lg') {
    return (
      <>
        <Link href="/login">
          <Button size="lg">Se connecter</Button>
        </Link>
      </>
    )
  }

  return (
    <Link href="/login">
      <Button size="sm">Connexion</Button>
    </Link>
  )
}
