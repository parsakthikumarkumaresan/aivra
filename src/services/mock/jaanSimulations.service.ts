import type { Simulation } from '@/types'
import { mockSimulations } from './data/jaan/simulations'
import { delay, nextId } from './utils'

export const jaanSimulationsService = {
  listSimulations(): Promise<Simulation[]> {
    return delay(mockSimulations)
  },
  runSimulation(input: Pick<Simulation, 'agentId' | 'agentName' | 'scenarioName' | 'testUser' | 'variables' | 'expectedOutcome'>): Promise<Simulation> {
    const simulation: Simulation = { ...input, id: nextId('sim'), status: 'running', startedAt: new Date().toISOString() }
    mockSimulations.unshift(simulation)
    return delay(simulation, 500)
  },
}
