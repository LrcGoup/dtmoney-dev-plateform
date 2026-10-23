# Auth Session — dt-dev-platform

## Storage (`lib/auth-storage.ts`)

- Access token : mémoire uniquement
- Refresh : **httpOnly cookie** (set by dt-api, same-origin via proxy `/api/v3`)

## Context (`contexts/auth-context.tsx`)

Bootstrap mount :
1. Try refresh cookie first
2. Fallback stored access token in memory (do **not** `setToken(null)` on refresh failure — races with SSO)
3. `setAuthFromVerify()` post email verification / SSO

## SSO handoff (`app/auth/sso`)

Query params :
- `userAccessToken` (+ optional `connectAppId`) — **preferred** : portal calls `POST /connect/auth/from-user` same-origin
- `accessToken` (+ email stubs) — legacy memory-only (no refresh cookie on this origin)

## Hook

`useAuth()` — user, login, logout, loading

## Auth pages

`/login` — onboarding = invitation DT Business DEVELOPER + SSO

## Dashboard gate

`DashboardShell` — redirect si non auth

## vs ride dashboards

next-auth **non utilisé** ici — auth custom JWT Connect (dt-api)
