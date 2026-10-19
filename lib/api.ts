import type {
  ApiKeyCreated,
  ApiKeyItem,
  ApiResponse,
  AuthLoginData,
  ConnectAppProfile,
  RegisterPayload,
  WalletPhoneVerification,
  WebhookDeliveryDetail,
  WebhookDeliveryListPage,
  WebhookEventDoc,
} from './types'
import { getAccessToken, setAccessToken } from './auth-storage'

const PROXY_API_BASE = '/api/v3'

export function getApiMountPath(): 'connect' {
  return 'connect'
}

export function getBusinessApiKeyHeader(): 'dt-connect-key' {
  return 'dt-connect-key'
}

export function getProductLabel(): string {
  return 'DT Connect API'
}

/** En navigateur, préfère le proxy same-origin pour que le cookie refresh httpOnly survive au F5. */
function resolveApiBase(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL ?? PROXY_API_BASE
  if (configured.startsWith('/')) return configured.replace(/\/$/, '')
  if (typeof window === 'undefined') return configured.replace(/\/$/, '')

  try {
    const target = new URL(configured, window.location.origin)
    if (target.origin !== window.location.origin) return PROXY_API_BASE
    return configured.replace(/\/$/, '')
  } catch {
    return PROXY_API_BASE
  }
}

function mountPath(suffix: string): string {
  const normalized = suffix.startsWith('/') ? suffix : `/${suffix}`
  return `/connect${normalized}`
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

  /**
   * SSO from dt-business: exchange a user JWT for a Connect session.
   * Must run same-origin (via proxy) so the refresh httpOnly cookie sticks on this portal.
   */
  loginFromUser: (userAccessToken: string, connectAppId?: string) =>
    request<
      AuthLoginData & {
        requiresConnectAppChoice?: boolean
        connectApps?: Array<{ id: string; email: string; name: string | null; status: string }>
      }
    >(mountPath('/auth/from-user'), {
      method: 'POST',
      body: JSON.stringify(connectAppId ? { connectAppId } : {}),
      token: userAccessToken,
      skipRefresh: true,
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
    const data = await request<ConnectAppProfile | { connectApp: ConnectAppProfile }>(
      mountPath('/account'),
    )
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

  listWebhookDeliveries: (params?: {
    page?: number
    pageSize?: number
    event?: string
    success?: boolean
    responseCode?: number
    from?: string
    to?: string
  }) => {
    const q = new URLSearchParams()
    if (params?.page) q.set('page', String(params.page))
    if (params?.pageSize) q.set('pageSize', String(params.pageSize))
    if (params?.event) q.set('event', params.event)
    if (typeof params?.success === 'boolean') q.set('success', String(params.success))
    if (typeof params?.responseCode === 'number') q.set('responseCode', String(params.responseCode))
    if (params?.from) q.set('from', params.from)
    if (params?.to) q.set('to', params.to)
    const qs = q.toString()
    return request<WebhookDeliveryListPage>(
      mountPath(`/webhooks/deliveries${qs ? `?${qs}` : ''}`),
    )
  },

  getWebhookDelivery: (id: string, includeSummary = false) =>
    request<WebhookDeliveryDetail>(
      mountPath(
        `/webhooks/deliveries/${id}${includeSummary ? '?includeSummary=true' : ''}`,
      ),
    ),

  retryWebhookDelivery: (id: string) =>
    request<WebhookDeliveryDetail>(mountPath(`/webhooks/deliveries/${id}/retry`), {
      method: 'POST',
    }),

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
  const configured = process.env.NEXT_PUBLIC_API_URL ?? PROXY_API_BASE
  if (configured.startsWith('/')) {
    const publicOrigin = process.env.NEXT_PUBLIC_API_ORIGIN?.replace(/\/$/, '')
    if (publicOrigin) return `${publicOrigin}/api/v3`
    if (typeof window !== 'undefined') return `${window.location.origin}${configured}`
    return 'http://localhost:4017/api/v3'
  }
  return configured.replace(/\/$/, '')
}

export function getSwaggerUrl() {
  const configured = process.env.NEXT_PUBLIC_API_URL ?? PROXY_API_BASE
  if (configured.startsWith('/')) {
    const apiOrigin = (process.env.NEXT_PUBLIC_API_ORIGIN ?? 'http://localhost:4017').replace(/\/$/, '')
    return `${apiOrigin}/api/docs/connect`
  }
  const root = configured.replace(/\/api\/v[23]\/?$/, '')
  return `${root}/api/docs/connect`
}
