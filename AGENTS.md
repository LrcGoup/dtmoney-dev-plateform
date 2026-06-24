# AGENTS.md — dt-dev-platform

## Ecosystem

- **Index :** `D:\Projects\ride-platform-docs\INDEX.md`
- **Fiche projet :** `D:\Projects\ride-platform-docs\projects\dt-dev-platform.md`
- **Intégration :** `ride-platform-docs/integrations/payments-dtmoney.md`

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Stack

- Next.js 16, React 19, TypeScript, Tailwind 4
- Port prod : 4023 (`npm run start:prod`)

## Commands

```bash
npm run dev
npm run build
npm run start:prod
npm run lint
```

## Structure

```
app/                              # Pages
components/docs/                  # integration-guide-content.tsx
```

## Rôle

Portail **documentation développeurs DTMoney** — exemples API, `dt-api-key`, flux quote/initiate/confirm.

## API / Intégrations

- Documente les appels vers **dt-api** (`/api/v2/dtmoney-api/...`)
- ride-api consomme la même API en server-to-server — voir hub payments

## Do not

- Confondre avec ride-client (les apps Ride passent par ride-api)
