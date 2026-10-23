export type ApiResponse<T> =
  | { ok: true; statusCode: number; data: T }
  | { ok: false; statusCode: number; error: { message: string } }

export interface ConnectAppProfile {
  id: string
  email: string
  name: string | null
  service: string | null
  type: string
  status: string
  emailVerified: boolean
  feePercentage: number
  webhookUrl: string | null
  webhookSecretConfigured: boolean
  userId: string | null
  organizationId?: string | null
  dtmoneyPhone: string | null
  providerCode: string | null
  settlementCreditAccountType: 'PRIMARY' | 'PROVIDER_EARNINGS'
  providerDisplayLabel: string | null
  createdAt: string
}

/** @deprecated Use ConnectAppProfile — kept for transitional imports */
export type ApiClientProfile = ConnectAppProfile

export interface ConnectAppStub {
  id: string
  email: string
  name: string | null
  status: string
}

export interface AuthLoginData {
  status: boolean
  accessToken: string
  expiresIn?: number
  /** v3 Connect vocabulary */
  connectApp?: ConnectAppStub
  connectAppId?: string
  /** v2 legacy vocabulary */
  apiClient?: ConnectAppStub
  apiClientId?: string
}

export function sessionAppFromAuth(data: AuthLoginData): ConnectAppStub | null {
  return data.connectApp ?? data.apiClient ?? null
}

export interface ApiKeyItem {
  id: string
  keyPrefix: string | null
  keyPreview?: string
  name: string | null
  scopes: string[]
  environment: 'TEST' | 'LIVE'
  isActive: boolean
  lastUsedAt: string | null
  createdAt: string
}

export interface ApiKeyCreated {
  id: string
  key: string
  name: string | null
  scopes: string[]
  isActive: boolean
  createdAt: string
}

export interface WebhookEventDoc {
  event: string
  description: string
}

export type WebhookDeliveryStatus = 'delivered' | 'pending_retry' | 'failed'

export interface WebhookDeliveryListItem {
  id: string
  event: string
  responseCode: number | null
  success: boolean
  attempts: number
  nextRetryAt: string | null
  createdAt: string
  updatedAt: string
  status: WebhookDeliveryStatus
}

export interface WebhookDeliveryDetail extends WebhookDeliveryListItem {
  summary: Record<string, unknown> | null
  canRetry: boolean
  retryBlockedReason: string | null
}

export interface WebhookDeliveryListPage {
  items: WebhookDeliveryListItem[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface WalletPhoneVerification {
  status: boolean
  exists: boolean
  phone: string
  displayName: string
  profileType: string
}
