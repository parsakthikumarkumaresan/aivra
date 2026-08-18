export interface VoiceProject {
  businessName: string
  industry: string
}

// Mutable, in-memory — set when a Voice Employee is provisioned (via a
// customization lead, simulated by the Developer panel's "AIVRA
// Provisioning" action). employees.service reads this to brand the Voice
// employee with the customer's own business name once it exists.
let currentVoiceProject: VoiceProject | null = null

export function getVoiceProject(): VoiceProject | null {
  return currentVoiceProject
}

export function setVoiceProject(project: VoiceProject | null) {
  currentVoiceProject = project
}
