// Dev-only switcher for mock organization states, so the full hire → subscribe →
// activate → pause/cancel lifecycle can be exercised without a real backend.
// See SETTINGS_PAGE (Developer section) for the UI. Persisted in localStorage so
// it survives a reload — the mock subscription store re-seeds from it on init.
import { MOCK_SCENARIOS } from './data/subscriptions'
import type { MockScenarioId } from './data/subscriptions'

const KEY = 'aivra:mock-scenario'
const DEFAULT_SCENARIO: MockScenarioId = 'B'

export function getMockScenario(): MockScenarioId {
  const stored = localStorage.getItem(KEY)
  const match = MOCK_SCENARIOS.find((s) => s.id === stored)
  return match ? match.id : DEFAULT_SCENARIO
}

export function setMockScenario(id: MockScenarioId) {
  localStorage.setItem(KEY, id)
}

export { MOCK_SCENARIOS }
export type { MockScenarioId }
