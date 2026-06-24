# Architecture — dt-dev-platform

## Stack

Next.js **16** · React 19 · Tailwind 4 · TypeScript

## Zones app

| Zone | Routes |
|------|--------|
| Marketing | `/`, `/login`, `/register`, `/verify-email` |
| Dashboard | `/dashboard/*` — api-keys, webhooks, docs, payment-methods… |

## Layout

- `app/layout.tsx` — `AuthProvider`, Geist fonts, FR metadata
- Dashboard : `components/layout/dashboard-shell.tsx`, `dashboard-sidebar.tsx`

## Rôle

Portail **développeurs DTMoney** — doc + gestion clés API.  
**Pas** l'app Ride consumer.

## Next.js 16

Lire `node_modules/next/dist/docs/` — breaking vs training data (`AGENTS.md`).

## Prod port

`4023` — `npm run start:prod`

## Hub

`ride-platform-docs/projects/dt-dev-platform.md`
