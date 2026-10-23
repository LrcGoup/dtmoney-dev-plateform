# DT Connect API — Developer Portal

Portail intégrateurs Next.js pour Connect v3 : clés API, webhooks, paiements ponctuels et abonnements.

## Prérequis

- [Bun](https://bun.sh) ou Node.js 20+
- API dt-api en cours d’exécution (Connect v3, `/api/v3/connect/*`)

## Configuration

```bash
cp .env.local.example .env.local
```

Variables (voir `.env.local.example`) :

- `NEXT_PUBLIC_API_URL=/api/v3` — appels API via proxy Next (same-origin, cookie refresh au F5)
- `API_PROXY_TARGET=http://localhost:4017` — backend NestJS local
- `NEXT_PUBLIC_API_ORIGIN` — URL publique affichée (Swagger, doc intégration)

> Ne pointez pas le navigateur directement vers `:4017` : le refresh token est un cookie httpOnly sur l’origine du portail. Un F5 perd l’access token (mémoire) ; la session est restaurée via ce cookie.

## Lancer le projet en dev

```bash
bun install
bun run dev
```

Ouvrir [http://localhost:4023](http://localhost:4023).

## Pages

| Route | Description |
|-------|-------------|
| `/` | Redirection vers la connexion |
| `/auth/sso` | Accès SSO depuis DT Business |
| `/dashboard` | Vue d’ensemble compte |
| `/dashboard/api-keys` | CRUD clés API |
| `/dashboard/webhooks` | Configuration webhooks |
| `/dashboard/docs` | Guide d’intégration (connexion requise) |
| `/docs` | Redirection vers `/dashboard/docs` |

## Stack

- Next.js 16 (App Router)
- React 19
- Tailwind CSS 4
- Auth JWT (access token en mémoire + refresh httpOnly cookie) → `/api/v3/connect/*`
# dtmoney-dev-plateform
