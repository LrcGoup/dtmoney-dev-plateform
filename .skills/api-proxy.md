# API Proxy — dt-dev-platform

## next.config.ts rewrites

```typescript
{ source: '/api/v2/:path*', destination: `${apiOrigin}/api/v2/:path*` }
{ source: '/api/docs/:path*', destination: `${apiOrigin}/api/docs/:path*` }
```

`API_PROXY_TARGET` env — défaut `http://localhost:4017`

## Pourquoi

Browser appelle **same-origin** `/api/v2` → cookies httpOnly refresh survivent F5.

## Server vs browser

`lib/api.ts` — `resolveApiBase()` :
- Browser : `/api/v2` (proxy)
- Server : peut utiliser `NEXT_PUBLIC_API_ORIGIN` direct

## Env

`API_PROXY_TARGET`, `NEXT_PUBLIC_API_ORIGIN`
