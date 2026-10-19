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

## Local dev

1. Lancer dt-api (ex. port 4017)
2. Lancer dt-dev-platform `bun run dev` → **4023** (évite le conflit avec d’autres apps sur 3000)
3. Proxy `/api/v3` → dt-api
4. dt-business : `NEXT_PUBLIC_DT_DEV_PLATFORM_URL=http://127.0.0.1:4023`

## Hub

`reference/env-vars.md`
