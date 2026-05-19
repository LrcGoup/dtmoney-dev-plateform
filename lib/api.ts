import type {
  ApiClientProfile,
  ApiKeyCreated,
  ApiKeyItem,
  ApiResponse,
  AuthLoginData,
  RegisterPayload,
  WalletPhoneVerification,
  WebhookEventDoc,
} from './types'
import { getAccessToken, setAccessToken } from './auth-storage'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '/api/v2'

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

  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
    credentials: 'include',
  })

  if (res.status === 401 && !skipRefresh && token !== null) {
    try {
      const refreshed = await refreshAccessToken()
      setAccessToken(refreshed.accessToken)
      headers.set('Authorization', `Bearer ${refreshed.accessToken}`)
      const retry = await fetch(`${API_BASE}${path}`, { ...init, headers, credentials: 'include' })
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
  const res = await fetch(`${API_BASE}/dtmoney-api/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  })
  const json = (await res.json()) as ApiResponse<AuthLoginData>
  if (!json.ok) {
    throw new ApiError('Session expirée', json.statusCode ?? 401)
  }
  return json.data
}

export const api = {
  refreshSession: refreshAccessToken,

  verifyWalletPhone: (phone: string) =>
    request<WalletPhoneVerification>('/dtmoney-api/auth/verify-wallet-phone', {
      method: 'POST',
      body: JSON.stringify({ phone }),
      token: null,
    }),

  register: (payload: RegisterPayload) =>
    request<{ status: boolean; message: string; apiClientId: string; email: string; devVerificationCode?: string }>(
      '/dtmoney-api/auth/register',
      { method: 'POST', body: JSON.stringify(payload), token: null },
    ),

  login: (email: string, password: string) =>
    request<AuthLoginData>('/dtmoney-api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      token: null,
    }),

  verifyEmail: (email: string, code: string) =>
    request<{ status: boolean; message: string; accessToken: string; expiresIn: number }>(
      '/dtmoney-api/auth/verify-email',
      {
        method: 'POST',
        body: JSON.stringify({ email, code }),
        token: null,
      },
    ),

  logout: () =>
    request<{ status: boolean; message: string }>('/dtmoney-api/auth/logout', {
      method: 'POST',
    }),

  getAccount: () => request<ApiClientProfile>('/dtmoney-api/account'),

  listApiKeys: () => request<{ status: boolean; apiKeys: ApiKeyItem[] }>('/dtmoney-api/api-keys'),

  createApiKey: (name?: string, scopes?: string[], environment?: 'TEST' | 'LIVE') =>
    request<{ status: boolean; message: string; apiKey: ApiKeyCreated }>('/dtmoney-api/api-keys', {
      method: 'POST',
      body: JSON.stringify({ name, scopes, environment }),
    }),

  revokeApiKey: (id: string) =>
    request<{ status: boolean; message: string }>(`/dtmoney-api/api-keys/${id}`, { method: 'DELETE' }),

  rotateApiKey: (id: string, name?: string) =>
    request<{ status: boolean; message: string; apiKey: ApiKeyCreated & { rotatedFrom: string } }>(
      `/dtmoney-api/api-keys/${id}/rotate`,
      { method: 'POST', body: JSON.stringify({ name }) },
    ),

  updateWebhooks: (webhookUrl?: string | null, webhookSecret?: string | null) =>
    request<{ status: boolean; message: string }>('/dtmoney-api/webhooks', {
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
    }>('/dtmoney-api/webhooks/events'),

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
    }>('/dtmoney-api/payment-methods'),

  updatePaymentMethods: (enabledMethods: string[]) =>
    request<{ status: boolean; message: string; enabledMethods: string[] }>('/dtmoney-api/payment-methods', {
      method: 'PUT',
      body: JSON.stringify({ enabledMethods }),
    }),
}

export function getApiBaseUrl() {
  return API_BASE
}

export function getSwaggerUrl() {
  if (API_BASE.startsWith('/')) {
    const apiOrigin = (process.env.NEXT_PUBLIC_API_ORIGIN ?? '').replace(/\/$/, '')
    return apiOrigin ? `${apiOrigin}/api/docs/dtmoney-api` : '/api/docs/dtmoney-api'
  }
  const root = API_BASE.replace(/\/api\/v2\/?$/, '')
  return `${root}/api/docs/dtmoney-api`
}
