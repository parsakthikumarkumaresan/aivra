// Real auth client against app/identity/api/auth.py. Access token lives in
// memory (tokenStore) and travels via the Authorization header; the refresh
// token is an httpOnly cookie the browser sends automatically; the CSRF
// cookie is echoed back by httpClient on mutating requests.
import { httpClient } from './httpClient'
import { tokenStore } from './tokenStore'

export interface BackendUser {
  id: string
  email: string
  fullName: string
  platformRole: string | null
  isActive: boolean
}

interface AuthResponse {
  user: BackendUser
  accessToken: string
  tokenType: string
  expiresIn: number
  organizationId: string | null
  role: string | null
}

function applySession(res: AuthResponse): AuthResponse {
  tokenStore.set({
    accessToken: res.accessToken,
    expiresAt: Date.now() + res.expiresIn * 1000,
    organizationId: res.organizationId,
    role: res.role,
  })
  return res
}

export const authService = {
  async login(email: string, password: string): Promise<BackendUser> {
    const res = await httpClient.post<AuthResponse>('/auth/login', { email, password })
    return applySession(res).user
  },
  async register(email: string, password: string, fullName: string): Promise<BackendUser> {
    return httpClient.post<BackendUser>('/auth/register', { email, password, fullName })
  },
  async logout(): Promise<void> {
    try {
      await httpClient.post<void>('/auth/logout')
    } finally {
      tokenStore.clear()
    }
  },
  async me(): Promise<BackendUser> {
    return httpClient.get<BackendUser>('/auth/me')
  },
  /** Tries to restore a session from the refresh cookie — call once at app boot. */
  async bootstrapSession(): Promise<boolean> {
    return httpClient.bootstrapSession()
  },
  isAuthenticated(): boolean {
    return tokenStore.isAuthenticated()
  },
  currentOrganizationId(): string | null {
    return tokenStore.get().organizationId
  },
  currentRole(): string | null {
    return tokenStore.get().role
  },
}
