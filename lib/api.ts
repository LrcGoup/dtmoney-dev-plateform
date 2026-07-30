import type {
  ApiKeyCreated,
  ApiKeyItem,
  ApiResponse,
  AuthLoginData,
  ConnectAppProfile,
  RegisterPayload,
  WalletPhoneVerification,
  WebhookEventDoc,
} from './types'
import { getAccessToken, setAccessToken } from './auth-storage'

const PROXY_API_BASE_V2 = '/api/v2'
const PROXY_API_BASE_V3 = '/api/v3'

/** Feature flag: dashboard + docs target DT Connect API v3. */
export function useConnectV3(): boolean {
  return process.env.NEXT_PUBLIC_DT_CONNECT_V3 === 'true'
}

export function getApiMountPath(): 'connect' | 'dtmoney-api' {
  return useConnectV3() ? 'connect' : 'dtmoney-api'
}

export function getBusinessApiKeyHeader(): 'dt-connect-key' | 'dt-api-key' {
  return useConnectV3() ? 'dt-connect-key' : 'dt-api-key'
}

export function getProductLabel(): string {
  return useConnectV3() ? 'DT Connect API' : 'DTMoney API'
}

function defaultProxyBase(): string {
  return useConnectV3() ? PROXY_API_BASE_V3 : PROXY_API_BASE_V2
}

/** En navigateur, préfère le proxy same-origin pour que le cookie refresh httpOnly survive au F5. */
function resolveApiBase(): string {
  const fallback = defaultProxyBase()
  const configured = process.env.NEXT_PUBLIC_API_URL ?? fallback
  if (configured.startsWith('/')) return configured.replace(/\/$/, '')
  if (typeof window === 'undefined') return configured.replace(/\/$/, '')

  try {
    const target = new URL(configured, window.location.origin)
    if (target.origin !== window.location.origin) return fallback
    return configured.replace(/\/$/, '')
  } catch {
    return fallback
  }
}

function mountPath(suffix: string): string {
  const mount = getApiMountPath()
  const normalized = suffix.startsWith('/') ? suffix : `/${suffix}`
  return `/${mount}${normalized}`
}

export class ApiError extends Error {
  statusCode: number
  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
  }
}

async function request<T>(
  path: string,
  options: RequestInit & { token?: string | null; skipRefresh?: boolean } = {},
): Promise<T> {
  const { token, skipRefresh, ...init } = options
  const headers = new Headers(init.headers)
  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json')
  }
  const authToken = token !== undefined ? token : getAccessToken()
  if (authToken) headers.set('Authorization', `Bearer ${authToken}`)

  const res = await fetch(`${resolveApiBase()}${path}`, {
    ...init,
    headers,
    credentials: 'include',
  })

  if (res.status === 401 && !skipRefresh && token !== null) {
    try {
      const refreshed = await refreshAccessToken()
      setAccessToken(refreshed.accessToken)
      headers.set('Authorization', `Bearer ${refreshed.accessToken}`)
      const retry = await fetch(`${resolveApiBase()}${path}`, { ...init, headers, credentials: 'include' })
      const retryJson = (await retry.json()) as ApiResponse<T>
      if (!retryJson.ok) {
        throw new ApiError(
          'error' in retryJson && retryJson.error?.message
            ? retryJson.error.message
            : `Erreur API (${retry.status})`,
          retryJson.statusCode ?? retry.status,
        )
      }
      return retryJson.data
    } catch {
      setAccessToken(null)
    }
  }

  const json = (await res.json()) as ApiResponse<T>

  if (!json.ok) {
    const message =
      'error' in json && json.error?.message
        ? json.error.message
        : `Erreur API (${res.status})`
    throw new ApiError(message, json.statusCode ?? res.status)
  }

  return json.data
}

async function refreshAccessToken() {
  const res = await fetch(`${resolveApiBase()}${mountPath('/auth/refresh')}`, {
    method: 'POST',
    credentials: 'include',
  })
  const json = (await res.json()) as ApiResponse<AuthLoginData>
  if (!json.ok) {
    throw new ApiError('Session expirée', json.statusCode ?? 401)
  }
  return json.data
}

function unwrapAccountProfile(
  data: ConnectAppProfile | { connectApp: ConnectAppProfile; account?: ConnectAppProfile },
): ConnectAppProfile {
  if (data && typeof data === 'object' && 'connectApp' in data && data.connectApp) {
    return data.connectApp
  }
  return data as ConnectAppProfile
}

export const api = {
  refreshSession: refreshAccessToken,

  verifyWalletPhone: (phone: string) =>
    request<WalletPhoneVerification>(mountPath('/auth/verify-wallet-phone'), {
      method: 'POST',
      body: JSON.stringify({ phone }),
      token: null,
    }),

  register: (payload: RegisterPayload) =>
    request<{
      status: boolean
      message: string
      email: string
      connectAppId?: string
      apiClientId?: string
      devVerificationCode?: string
    }>(mountPath('/auth/register'), { method: 'POST', body: JSON.stringify(payload), token: null }),

  login: (email: string, password: string) =>
    request<AuthLoginData>(mountPath('/auth/login'), {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      token: null,
    }),

  verifyEmail: (email: string, code: string) =>
    request<{
      status: boolean
      message: string
      accessToken: string
      expiresIn: number
      connectAppId?: string
      apiClientId?: string
    }>(mountPath('/auth/verify-email'), {
      method: 'POST',
      body: JSON.stringify({ email, code }),
      token: null,
    }),

  logout: () =>
    request<{ status: boolean; message: string }>(mountPath('/auth/logout'), {
      method: 'POST',
    }),

  getAccount: async () => {
    const data = await request<
      ConnectAppProfile | { connectApp: ConnectAppProfile }
    >(mountPath('/account'))
    return unwrapAccountProfile(data)
  },

  updateAccountProvider: async (payload: {
    providerCode?: string | null
    settlementCreditAccountType?: 'PRIMARY' | 'PROVIDER_EARNINGS'
    providerDisplayLabel?: string | null
  }) => {
    const data = await request<{
      status: boolean
      message: string
      account?: ConnectAppProfile
      connectApp?: ConnectAppProfile
    }>(mountPath('/account'), {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
    return {
      status: data.status,
      message: data.message,
      account: data.connectApp ?? data.account!,
    }
  },

  listApiKeys: () => request<{ status: boolean; apiKeys: ApiKeyItem[] }>(mountPath('/api-keys')),

  createApiKey: (name?: string, scopes?: string[], environment?: 'TEST' | 'LIVE') =>
    request<{ status: boolean; message: string; apiKey: ApiKeyCreated }>(mountPath('/api-keys'), {
      method: 'POST',
      body: JSON.stringify({ name, scopes, environment }),
    }),

  revokeApiKey: (id: string) =>
    request<{ status: boolean; message: string }>(mountPath(`/api-keys/${id}`), { method: 'DELETE' }),

  rotateApiKey: (id: string, name?: string) =>
    request<{ status: boolean; message: string; apiKey: ApiKeyCreated & { rotatedFrom: string } }>(
      mountPath(`/api-keys/${id}/rotate`),
      { method: 'POST', body: JSON.stringify({ name }) },
    ),

  updateWebhooks: (webhookUrl?: string | null, webhookSecret?: string | null) =>
    request<{ status: boolean; message: string }>(mountPath('/webhooks'), {
      method: 'PUT',
      body: JSON.stringify({ webhookUrl, webhookSecret }),
    }),

  listWebhookEvents: () =>
    request<{
      status: boolean
      events: WebhookEventDoc[]
      signatureHeader: string
      signatureFormat: string
      deliveryHeader?: string
      retryStrategy?: string
      verificationExample?: string
    }>(mountPath('/webhooks/events')),

  getPaymentMethods: () =>
    request<{
      status: boolean
      enabledMethods: string[]
      catalog: Array<{
        type: string
        label: string
        enabled: boolean
        available: boolean
        comingSoon?: boolean
      }>
    }>(mountPath('/payment-methods')),

  updatePaymentMethods: (enabledMethods: string[]) =>
    request<{ status: boolean; message: string; enabledMethods: string[] }>(mountPath('/payment-methods'), {
      method: 'PUT',
      body: JSON.stringify({ enabledMethods }),
    }),
}

export function getApiBaseUrl() {
  const fallback = defaultProxyBase()
  const configured = process.env.NEXT_PUBLIC_API_URL ?? fallback
  if (configured.startsWith('/')) {
    const publicOrigin = process.env.NEXT_PUBLIC_API_ORIGIN?.replace(/\/$/, '')
    const versionPath = useConnectV3() ? '/api/v3' : '/api/v2'
    if (publicOrigin) return `${publicOrigin}${versionPath}`
    if (typeof window !== 'undefined') return `${window.location.origin}${configured}`
    return `http://localhost:4017${versionPath}`
  }
  return configured.replace(/\/$/, '')
}

export function getSwaggerUrl() {
  const docsPath = useConnectV3() ? '/api/docs/connect' : '/api/docs/dtmoney-api'
  const fallback = defaultProxyBase()
  const configured = process.env.NEXT_PUBLIC_API_URL ?? fallback
  if (configured.startsWith('/')) {
    const apiOrigin = (process.env.NEXT_PUBLIC_API_ORIGIN ?? 'http://localhost:4017').replace(/\/$/, '')
    return `${apiOrigin}${docsPath}`
  }
  const root = configured.replace(/\/api\/v[23]\/?$/, '')
  return `${root}${docsPath}`
}
