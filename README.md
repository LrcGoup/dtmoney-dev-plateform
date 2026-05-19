# DTMoney API — Developer Portal

Plateforme développeurs Next.js pour gérer les comptes DTMoney API (clés API, webhooks, documentation).

## Prérequis

- [Bun](https://bun.sh) ou Node.js 20+
- API backend v2 en cours d’exécution (`cd v2 && bun run start:dev`)

## Configuration

```bash
cp .env.local.example .env.local
```

Variables (voir `.env.local.example`) :

- `NEXT_PUBLIC_API_URL=/api/v2` — appels API via proxy Next (same-origin, cookie refresh au F5)
- `API_PROXY_TARGET=http://localhost:4017` — backend NestJS local
- `NEXT_PUBLIC_API_ORIGIN` — URL publique affichée (Swagger, doc intégration)

> Ne pointez pas le navigateur directement vers `:4017` : le refresh token est un cookie httpOnly sur l’origine du portail. Un F5 perd l’access token (mémoire) ; la session est restaurée via ce cookie.

## Lancer le projet en dev

```bash
bun install
bun run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing marketing |
| `/register` | Inscription développeur |
| `/verify-email` | Vérification OTP email |
| `/login` | Connexion JWT |
| `/dashboard` | Vue d’ensemble compte |
| `/dashboard/api-keys` | CRUD clés API |
| `/dashboard/webhooks` | Configuration webhooks |
| `/dashboard/docs` | Guide d’intégration (connexion requise) |
| `/docs` | Redirection vers `/dashboard/docs` |

## Stack

- Next.js 16 (App Router)
- React 19
- Tailwind CSS 4
- Auth JWT (access token en mémoire + refresh httpOnly cookie) → `/api/v2/dtmoney-api/*`
# dtmoney-dev-plateform
