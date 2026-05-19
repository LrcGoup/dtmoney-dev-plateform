const CLIENT_KEY = 'dtmoney_api_client'

/** Access token en mémoire uniquement (non persisté — limite l'exposition XSS). */
let accessTokenMemory: string | null = null

export function getAccessToken(): string | null {
  return accessTokenMemory
}

export function setAccessToken(token: string | null) {
  accessTokenMemory = token
}

export function setClientStub(client: { id: string; email: string; name: string | null; status: string }) {
  if (typeof window === 'undefined') return
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
  accessTokenMemory = null
  if (typeof window !== 'undefined') {
    localStorage.removeItem(CLIENT_KEY)
  }
}

export function isAuthenticated(): boolean {
  return Boolean(accessTokenMemory)
}

/** @deprecated use getAccessToken */
export function getToken(): string | null {
  return getAccessToken()
}

/** @deprecated use setAccessToken + setClientStub */
export function setSession(token: string, client: { id: string; email: string; name: string | null; status: string }) {
  setAccessToken(token)
  setClientStub(client)
}
