# Env & Config — dt-dev-platform

## Commands

```bash
npm run dev
npm run build
npm run start:prod    # port 4023
npm run lint
```

## Env

| Variable | Usage |
|----------|-------|
| `API_PROXY_TARGET` | dt-api origin pour rewrites |
| `NEXT_PUBLIC_API_ORIGIN` | Affichage URLs doc |

## Local dev

1. Lancer dt-api (ex. port 4017)
2. Lancer dt-dev-platform `npm run dev`
3. Proxy `/api/v2` → dt-api

## Hub

`reference/env-vars.md`
