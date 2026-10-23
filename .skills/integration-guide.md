# DT Connect API v3 Integration Guide — dt-dev-platform

## Composant

`components/docs/integration-guide-content.tsx` — guide complet React (pas MDX)

## Navigation sections

`lib/integration-guide.ts` — `integrationGuideSections` IDs partagés avec sidebar docs page

## Contenu documenté

- Public integration base URL `/api/v3/connect/` (trailing slash)
- Header `dt-connect-key`
- Flux quote → initiate → confirm
- Plans et abonnements récurrents
- Idempotency keys
- Webhooks
- Exemples `Code` blocks avec `base` URL dynamique
- PaymentToken cURL quickstart, settlement, card tokenization, and SSO-only onboarding
- Explicit warning: `dt_test_*` keys are not a sandbox and do not isolate transactions

## Page

`app/dashboard/docs/page.tsx` — sticky sidebar + `<IntegrationGuideContent />`

## Sync

Quand les contrats Connect v3 changent → mettre à jour **ce composant** + hub `connect-payments.md`

## ride-api

Ride mobile ne lit pas ce guide — consomme via `MOBILE_DTMONEY.md`
