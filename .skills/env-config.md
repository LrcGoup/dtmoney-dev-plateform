# Env & Config — dt-dev-platform

## Commands

```bash
bun run dev          # port 4023
bun run build
bun run start:prod   # port 4023
bun run lint
```

## Env

| Variable | Usage |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | **`/api/v3`** (Connect) — same-origin proxy |
| `API_PROXY_TARGET` | dt-api origin pour rewrites (ex. `http://127.0.0.1:4017`) |
| `NEXT_PUBLIC_API_ORIGIN` | Affichage URLs doc / Swagger |
| `NEXT_PUBLIC_DT_BUSINESS_URL` | URL Business pour la redirection d’accueil et le lien de retour SSO (défaut `https://business.dt-money.com`) |

Les variables `NEXT_PUBLIC_*` sont intégrées au bundle lors de `next build` : définir cette URL dans l’environnement de build.

## Local dev

1. Lancer dt-api (ex. port 4017)
2. Lancer dt-dev-platform `bun run dev` → **4023** (évite le conflit avec d’autres apps sur 3000)
3. Proxy `/api/v3` → dt-api
4. dt-business : `NEXT_PUBLIC_DT_DEV_PLATFORM_URL=http://127.0.0.1:4023`

## Hub

`reference/env-vars.md`
