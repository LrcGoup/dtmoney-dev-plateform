import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { AuthProvider } from '@/contexts/auth-context'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'DTMoney API — Plateforme développeurs',
  description: 'Intégrez les paiements DTMoney dans vos applications. Clés API, webhooks, documentation.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="min-h-full antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
