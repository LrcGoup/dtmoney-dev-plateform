# Auth Session — dt-dev-platform

## Storage (`lib/auth-storage.ts`)

- Access token : mémoire / local
- Refresh : **httpOnly cookie** (set by dt-api)

## Context (`contexts/auth-context.tsx`)

Bootstrap mount :
1. Try refresh cookie first
2. Fallback stored access token
3. `setAuthFromVerify()` post email verification

## Hook

`useAuth()` — user, login, logout, loading

## Marketing auth pages

`/login`, `/register`, `/verify-email` — phone input `react-simple-phone-input`

## Dashboard gate

`DashboardShell` — redirect si non auth

## vs ride dashboards

next-auth **non utilisé** ici — auth custom JWT dt-api developers
