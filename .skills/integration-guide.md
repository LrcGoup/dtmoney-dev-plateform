# Integration Guide — dt-dev-platform

## Composant

`components/docs/integration-guide-content.tsx` — guide complet React (pas MDX)

## Navigation sections

`lib/integration-guide.ts` — `integrationGuideSections` IDs partagés avec sidebar docs page

## Contenu documenté

- Base URL `/api/v2/dtmoney-api/...`
- Header `dt-api-key`
- Flux quote → initiate → confirm
- Idempotency keys
- Webhooks
- Exemples `Code` blocks avec `base` URL dynamique

## Page

`app/dashboard/docs/page.tsx` — sticky sidebar + `<IntegrationGuideContent />`

## Sync

Quand dt-api payments change → mettre à jour **ce composant** + hub `payments-dtmoney.md`

## ride-api

Ride mobile ne lit pas ce guide — consomme via `MOBILE_DTMONEY.md`
