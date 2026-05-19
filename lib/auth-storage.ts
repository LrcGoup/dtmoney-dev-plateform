const TOKEN_KEY = 'dtmoney_api_token'
const CLIENT_KEY = 'dtmoney_api_client'

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export function setSession(token: string, client: { id: string; email: string; name: string | null; status: string }) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(CLIENT_KEY, JSON.stringify(client))
}

export function getStoredClient() {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(CLIENT_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as { id: string; email: string; name: string | null; status: string }
  } catch {
    return null
  }
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(CLIENT_KEY)
}

export function isAuthenticated(): boolean {
  return Boolean(getToken())
}
