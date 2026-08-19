// Module-level (non-React) session state. Lives here rather than in a React
// context because httpClient.ts needs to read/write it outside of any
// component tree (e.g. from a plain fetch wrapper).
interface SessionState {
  accessToken: string | null
  expiresAt: number | null
  organizationId: string | null
  role: string | null
}

let state: SessionState = { accessToken: null, expiresAt: null, organizationId: null, role: null }
const listeners = new Set<() => void>()

export const tokenStore = {
  get(): SessionState {
    return state
  },
  set(next: Partial<SessionState>): void {
    state = { ...state, ...next }
    listeners.forEach((listener) => listener())
  },
  clear(): void {
    state = { accessToken: null, expiresAt: null, organizationId: null, role: null }
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
