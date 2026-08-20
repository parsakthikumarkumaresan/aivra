// Module-level (non-React) session state. Lives here rather than in a React
// context because httpClient.ts needs to read/write it outside of any
// component tree (e.g. from a plain fetch wrapper).
interface SessionState {
  accessToken: string | null
  expiresAt: number | null
  organizationId: string | null
  role: string | null
}

const STORAGE_KEY = 'aivra_session'

function loadInitial(): SessionState {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed.expiresAt && parsed.expiresAt > Date.now()) {
        return parsed
      }
    }
  } catch {
    // Fallthrough to empty state on error
  }
  return { accessToken: null, expiresAt: null, organizationId: null, role: null }
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
    state = { accessToken: null, expiresAt: null, organizationId: null, role: null }
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
