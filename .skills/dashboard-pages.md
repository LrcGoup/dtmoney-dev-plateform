# Dashboard Pages — dt-dev-platform

## Pattern page

```typescript
'use client'
export default function Page() {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const load = useCallback(async () => { ... api.* ... }, [])
  useEffect(() => { void load() }, [load])
  return <DashboardShell title="...">...</DashboardShell>
}
```

## Routes dashboard

- `/dashboard` — home
- `/dashboard/api-keys` — CRUD clés
- `/dashboard/webhooks` — config webhooks
- `/dashboard/docs` — guide intégration
- `/dashboard/payment-methods` — si présent

## Sidebar

`components/layout/dashboard-sidebar.tsx` + nav items

## Redirect

`/docs` → `/dashboard/docs`
