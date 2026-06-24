# API Client — dt-dev-platform

Fichier : `lib/api.ts`

## Pattern

- Native `fetch` — **pas Axios, pas React Query**
- Objet `api` exporté avec méthodes domaine

## Auth header

Bearer access token depuis `auth-storage.ts`

## 401 handling

1. `refreshAccessToken()` via cookie httpOnly
2. Retry request une fois
3. Sinon `ApiError`

## Envelope

dt-api format : unwrap `{ ok, data }` — **pas** enveloppe ride-api

## Errors

`ApiError` class — status + message

## Types

`lib/types.ts` — `ApiResponse<T>`, API key types, client profile
