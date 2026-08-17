import type { EvaluationCriterion } from '@/types'

export const mockRubric: Record<string, EvaluationCriterion[]> = {
  job_1042: [
    { id: 'crit_1', label: 'Product Thinking', description: 'Ability to frame ambiguous problems and reason about tradeoffs from first principles.', weight: 30, evidenceHint: 'Look for structured reasoning about user needs, business constraints and tradeoffs.' },
    { id: 'crit_2', label: 'UX Craft & Portfolio Quality', description: 'Visual and interaction craft demonstrated in shipped work.', weight: 25, evidenceHint: 'Look for polish, consistency and attention to detail in portfolio case studies.' },
    { id: 'crit_3', label: 'Collaboration & Communication', description: 'Works effectively with product, engineering and stakeholders.', weight: 20, evidenceHint: 'Look for examples of cross-functional collaboration and clear communication.' },
    { id: 'crit_4', label: 'Systems & Design Ops', description: 'Experience building and maintaining scalable design systems.', weight: 15, evidenceHint: 'Look for design system contributions or component library ownership.' },
    { id: 'crit_5', label: 'Leadership & Mentorship', description: 'Experience mentoring designers or leading design initiatives.', weight: 10, evidenceHint: 'Look for mentorship, leading critiques, or driving design culture.' },
  ],
  job_1043: [
    { id: 'crit_1', label: 'Systems Design', description: 'Ability to design scalable, reliable backend services.', weight: 30, evidenceHint: 'Look for evidence of designing distributed systems at scale.' },
    { id: 'crit_2', label: 'Coding Proficiency', description: 'Depth in Python/Go and strong engineering fundamentals.', weight: 25, evidenceHint: 'Look for production experience with relevant languages and frameworks.' },
    { id: 'crit_3', label: 'Ownership & Reliability', description: 'Track record of owning services in production, including on-call.', weight: 20, evidenceHint: 'Look for on-call experience and incident response ownership.' },
    { id: 'crit_4', label: 'Collaboration', description: 'Works well with cross-functional teams and communicates technical tradeoffs.', weight: 15, evidenceHint: 'Look for examples of technical communication with non-engineers.' },
    { id: 'crit_5', label: 'Security Awareness', description: 'Understanding of secure coding and data handling practices.', weight: 10, evidenceHint: 'Look for awareness of common vulnerabilities and mitigations.' },
  ],
}

export const defaultRubricTemplate: Omit<EvaluationCriterion, 'id'>[] = [
  { label: 'Role-Specific Expertise', description: 'Core technical or functional skill required for the role.', weight: 35, evidenceHint: 'Look for direct experience with the core responsibilities of this role.' },
  { label: 'Problem Solving', description: 'Ability to reason through ambiguous or novel problems.', weight: 25, evidenceHint: 'Look for structured thinking and sound judgment under ambiguity.' },
  { label: 'Communication', description: 'Clarity of written and verbal communication.', weight: 20, evidenceHint: 'Look for clear, concise communication in resume and responses.' },
  { label: 'Collaboration', description: 'Ability to work effectively with a cross-functional team.', weight: 20, evidenceHint: 'Look for examples of teamwork and stakeholder management.' },
]
