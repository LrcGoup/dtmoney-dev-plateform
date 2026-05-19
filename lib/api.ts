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
import { getToken } from './auth-storage'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4017/api/v2'

export class ApiError extends Error {
  statusCode: number
  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
  }
}

async function request<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {},
): Promise<T> {
  const { token, ...init } = options
  const headers = new Headers(init.headers)
  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json')
  }
  const authToken = token ?? getToken()
  if (authToken) headers.set('Authorization', `Bearer ${authToken}`)

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers })
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

export const api = {
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
    request<{ status: boolean; message: string; accessToken: string }>('/dtmoney-api/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
      token: null,
    }),

  getAccount: () => request<ApiClientProfile>('/dtmoney-api/account'),

  listApiKeys: () => request<{ status: boolean; apiKeys: ApiKeyItem[] }>('/dtmoney-api/api-keys'),

  createApiKey: (name?: string, scopes?: string[]) =>
    request<{ status: boolean; message: string; apiKey: ApiKeyCreated }>('/dtmoney-api/api-keys', {
      method: 'POST',
      body: JSON.stringify({ name, scopes }),
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
    request<{ status: boolean; events: WebhookEventDoc[]; signatureHeader: string; signatureFormat: string }>(
      '/dtmoney-api/webhooks/events',
    ),
}

export function getApiBaseUrl() {
  return API_BASE
}

export function getSwaggerUrl() {
  const root = API_BASE.replace(/\/api\/v2\/?$/, '')
  return `${root}/api/docs/dtmoney-api`
}
