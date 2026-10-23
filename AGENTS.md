# AGENTS.md — dt-dev-platform

## Ecosystem

- **Index :** `D:\Projects\dtmoney-platform-docs\INDEX.md`
- **Fiche projet :** `D:\Projects\dtmoney-platform-docs\projects\dt-dev-platform.md`
- **Intégration :** `dtmoney-platform-docs/integrations/connect-payments.md`
- **Pont Ride :** `ride-platform-docs/integrations/payments-dtmoney.md`

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Stack

- Next.js 16, React 19, TypeScript, Tailwind 4
- Port **4023** (dev `next dev -p 4023` + `start:prod`) — ne pas utiliser 3000 (souvent pris)

## Commands

```bash
bun run dev
bun run build
bun run start:prod
bun run lint
```

## Structure

```
app/                              # Pages
components/docs/                  # integration-guide-content.tsx
```

## Rôle

Portail **DT Connect API v3** — documentation développeurs, gestion des clés `dt-connect-key`, paiements, abonnements et webhooks.

## API / Intégrations

- Les appels métier du portail ciblent exclusivement **dt-api Connect v3** (`/api/v3/connect/...`).
- Auth métier : `dt-connect-key`. Le JWT de dashboard sert uniquement à la gestion du compte, des clés et des webhooks.
- Connect v2 (`/api/v2/dtmoney-api/...`) n’est pas utilisé par le portail.
- ride-api consomme la même API en server-to-server — voir hub payments

## Do not

- Confondre avec ride-client (les apps Ride passent par ride-api)
