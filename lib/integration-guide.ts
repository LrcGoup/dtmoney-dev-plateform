import {
  getApiBaseUrl,
  getApiMountPath,
  getBusinessApiKeyHeader,
  getProductLabel,
  getSwaggerUrl,
  useConnectV3,
} from '@/lib/api'

export function getIntegrationGuideMeta() {
  const base = getApiBaseUrl()
  const swagger = getSwaggerUrl()
  const mount = getApiMountPath()
  const keyHeader = getBusinessApiKeyHeader()
  const product = getProductLabel()
  const connectV3 = useConnectV3()
  return { base, swagger, mount, keyHeader, product, connectV3 }
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
