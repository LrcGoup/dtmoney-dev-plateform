# API Proxy — dt-dev-platform

## next.config.ts rewrites

```typescript
{ source: '/api/v2/:path*', destination: `${apiOrigin}/api/v2/:path*` }
{ source: '/api/v3/:path*', destination: `${apiOrigin}/api/v3/:path*` }
{ source: '/api/docs/:path*', destination: `${apiOrigin}/api/docs/:path*` }
```

`API_PROXY_TARGET` env — défaut `http://localhost:4017`

## Pourquoi

Browser appelle **same-origin** `/api/v3` → cookies httpOnly refresh survivent F5 (login + SSO `from-user`).

Connect dashboard = **v3** (`/api/v3/connect/*`). Ne pas pointer `NEXT_PUBLIC_API_URL` vers `/api/v2`.

## Server vs browser

`lib/api.ts` — `resolveApiBase()` :
- Relative `/api/v3` : same-origin proxy
- Absolute cross-origin : force `/api/v3` proxy en navigateur

## Env

`API_PROXY_TARGET`, `NEXT_PUBLIC_API_ORIGIN`, `NEXT_PUBLIC_API_URL=/api/v3`
