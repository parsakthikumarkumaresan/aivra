import type { Lead } from '@/types'

// In-memory only, like every other mock store in this app — resets on a
// full page reload. See scenario.ts for how a "voice deployment" lead can
// be turned into an active subscription via the Developer panel.
export const mockLeads: Lead[] = []
