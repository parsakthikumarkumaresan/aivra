// Single HTTP boundary between the frontend and the real FastAPI backend.
// Every real service module (auth, organization, hr) goes through this —
// base URL, auth header injection, CSRF header injection, cookie handling,
// 401-triggered silent refresh, and the error envelope all live in one place.
import { tokenStore } from './tokenStore'
import { readCsrfToken } from './csrf'
import { ApiError } from './errors'

const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:8001/api/v1'
const CSRF_HEADER_NAME = 'X-CSRF-Token'

interface RequestOptions {
  method?: string
  json?: unknown
  body?: FormData
  headers?: Record<string, string>
  /** Internal — prevents infinite recursion when a refreshed request also 401s. */
  skipAuthRetry?: boolean
}

interface RefreshResponseBody {
  accessToken: string
  expiresIn: number
  organizationId: string | null
  role: string | null
  user: { platformRole: string | null }
}

let refreshPromise: Promise<boolean> | null = null

async function rawRefresh(): Promise<boolean> {
  const csrf = readCsrfToken()
  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: csrf ? { [CSRF_HEADER_NAME]: csrf } : {},
    })
  } catch {
    return false
  }
  if (!response.ok) {
    tokenStore.clear()
    return false
  }
  const body = (await response.json()) as RefreshResponseBody
  tokenStore.set({
    accessToken: body.accessToken,
    expiresAt: Date.now() + body.expiresIn * 1000,
    organizationId: body.organizationId,
    role: body.role,
    platformRole: body.user.platformRole,
  })
  return true
}

/** Dedupes concurrent 401s into a single in-flight refresh call. */
function refreshSession(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = rawRefresh().finally(() => {
      refreshPromise = null
    })
  }
  return refreshPromise
}

interface ErrorEnvelope {
  error?: { code?: string; message?: string; details?: Record<string, unknown>; request_id?: string }
}

async function toApiError(response: Response): Promise<ApiError> {
  let payload: ErrorEnvelope | null = null
  try {
    payload = (await response.json()) as ErrorEnvelope
  } catch {
    // Non-JSON error body (network/proxy failure) — fall through to a generic error below.
  }
  const err = payload?.error
  return new ApiError(err?.message ?? `Request failed with status ${response.status}`, {
    code: err?.code ?? 'UNKNOWN_ERROR',
    status: response.status,
    details: err?.details,
    requestId: err?.request_id,
  })
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { ...options.headers }
  const { accessToken } = tokenStore.get()
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`

  const method = options.method ?? (options.json !== undefined || options.body ? 'POST' : 'GET')
  const isMutating = method !== 'GET' && method !== 'HEAD'
  if (isMutating) {
    const csrf = readCsrfToken()
    if (csrf) headers[CSRF_HEADER_NAME] = csrf
  }

  let body: BodyInit | undefined
  if (options.body) {
    body = options.body
  } else if (options.json !== undefined) {
    headers['Content-Type'] = 'application/json'
    body = JSON.stringify(options.json)
  }

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { method, credentials: 'include', headers, body })
  } catch (cause) {
    throw new ApiError('Could not reach the JEXA.AI backend. Is it running on ' + API_BASE_URL + '?', {
      code: 'NETWORK_ERROR',
      status: 0,
      details: { cause: String(cause) },
    })
  }

  if (response.status === 401 && !options.skipAuthRetry) {
    const refreshed = await refreshSession()
    if (refreshed) {
      return request<T>(path, { ...options, skipAuthRetry: true })
    }
  }

  if (!response.ok) {
    throw await toApiError(response)
  }

  if (response.status === 204) return undefined as T
  const contentType = response.headers.get('content-type') ?? ''
  if (!contentType.includes('application/json')) return undefined as T
  return (await response.json()) as T
}

export const httpClient = {
  get: <T>(path: string, options?: Omit<RequestOptions, 'method'>) => request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, json?: unknown, options?: Omit<RequestOptions, 'method' | 'json'>) =>
    request<T>(path, { ...options, method: 'POST', json }),
  patch: <T>(path: string, json?: unknown, options?: Omit<RequestOptions, 'method' | 'json'>) =>
    request<T>(path, { ...options, method: 'PATCH', json }),
  postForm: <T>(path: string, formData: FormData, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'POST', body: formData }),
  /** Attempts to restore a session from localStorage or the httpOnly refresh cookie (e.g. on page load). */
  async bootstrapSession(): Promise<boolean> {
    const current = tokenStore.get()
    if (current.accessToken && current.expiresAt && current.expiresAt > Date.now()) {
      return true
    }
    return refreshSession()
  },
}
