import { getApiBaseUrl, getSwaggerUrl } from '@/lib/api'

export function getIntegrationGuideMeta() {
  const base = getApiBaseUrl()
  const swagger = getSwaggerUrl()
  return { base, swagger }
}

export const integrationGuideSections = [
  { id: 'prerequisites', title: 'Prérequis' },
  { id: 'base-url', title: 'Base URL' },
  { id: 'onboarding', title: 'Compte développeur' },
  { id: 'authentication', title: 'Authentification API' },
  { id: 'responses', title: 'Format des réponses' },
  { id: 'checkout', title: 'Flux checkout' },
  { id: 'secure-checkout', title: 'Checkout sécurisé' },
  { id: 'payment-methods', title: 'Moyens de paiement' },
  { id: 'endpoints', title: 'Endpoints' },
  { id: 'refunds', title: 'Remboursements & dettes' },
  { id: 'idempotency', title: 'Idempotence' },
  { id: 'webhooks', title: 'Webhooks' },
  { id: 'security', title: 'Sécurité & limites' },
  { id: 'best-practices', title: 'Bonnes pratiques' },
] as const
