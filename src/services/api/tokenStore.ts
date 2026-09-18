// Module-level (non-React) session state. Lives here rather than in a React
// context because httpClient.ts needs to read/write it outside of any
// component tree (e.g. from a plain fetch wrapper).
interface SessionState {
  accessToken: string | null
  expiresAt: number | null
  organizationId: string | null
  role: string | null
  /** AIVRA-internal role (aivra_admin/aivra_engineer), null for ordinary customer users. */
  platformRole: string | null
}

const STORAGE_KEY = 'aivra_session'
const EMPTY_STATE: SessionState = { accessToken: null, expiresAt: null, organizationId: null, role: null, platformRole: null }

function loadInitial(): SessionState {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed.expiresAt && parsed.expiresAt > Date.now()) {
        return { ...EMPTY_STATE, ...parsed }
      }
    }
  } catch {
    // Fallthrough to empty state on error
  }
  return { ...EMPTY_STATE }
}

let state: SessionState = loadInitial()
const listeners = new Set<() => void>()

export const tokenStore = {
  get(): SessionState {
    return state
  },
  set(next: Partial<SessionState>): void {
    state = { ...state, ...next }
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
      }
    } catch {
      // Ignore quota errors
    }
    listeners.forEach((listener) => listener())
  },
  clear(): void {
    state = { ...EMPTY_STATE }
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY)
      }
    } catch {
      // Ignore
    }
    listeners.forEach((listener) => listener())
  },
  isAuthenticated(): boolean {
    return Boolean(state.accessToken)
  },
  subscribe(listener: () => void): () => void {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
}
