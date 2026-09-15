// Enterprise "Simulations" — persistent, reviewable test runs against a
// scenario/dataset, distinct from the ephemeral one-off Simulate tab inside
// the agent workspace (which reuses the existing basic Test/Replay tools).

export type SimulationStatus = 'queued' | 'running' | 'passed' | 'needs_review' | 'failed'

export interface SimulationVariable {
  name: string
  value: string
}

export interface Simulation {
  id: string
  agentId: string
  agentName: string
  scenarioName: string
  testUser: string
  status: SimulationStatus
  variables: SimulationVariable[]
  expectedOutcome: string
  score?: number
  latencyMs?: number
  startedAt: string
  completedAt?: string
}
