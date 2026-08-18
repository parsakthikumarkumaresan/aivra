// Stands in for a real internal-admin authorization check, which this
// prototype has no backend/auth to provide (see product-model brief,
// section 20 and the stabilization-pass brief, item 4). Toggled only from
// Settings → Developer — a normal customer session never has this set, so
// the Voice Advanced Setup route stays blocked by default.
const KEY = 'aivra:internal-mode'

export function isInternalModeEnabled(): boolean {
  return localStorage.getItem(KEY) === 'true'
}

export function setInternalMode(enabled: boolean) {
  localStorage.setItem(KEY, String(enabled))
}
