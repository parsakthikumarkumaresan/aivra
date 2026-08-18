import type { EmployeePlan } from '@/types'

export const mockPlans: EmployeePlan[] = [
  {
    id: 'plan_hr_standard',
    employeeType: 'hr',
    name: 'Standard',
    monthlyPrice: 24999,
    annualPrice: 249990, // ~2 months free
    currency: 'INR',
    features: [
      'Resume analysis & OCR parsing',
      'AI candidate matching & scoring',
      'AI voice screening interviews',
      'Screening report generation',
      'Human interview scheduling',
      'HR analytics & reporting',
      'Company Brain integration',
    ],
    limits: [
      { label: 'Candidates processed', value: 'Up to 500 / month' },
      { label: 'Active job requisitions', value: 'Unlimited' },
      { label: 'AI screening calls', value: 'Up to 300 / month' },
      { label: 'Hiring team seats', value: 'Up to 10' },
    ],
  },
  {
    id: 'plan_voice_standard',
    employeeType: 'voice',
    name: 'Standard',
    monthlyPrice: 19999,
    annualPrice: 199990,
    currency: 'INR',
    features: [
      'Inbound & outbound voice handling',
      'Industry-specific configuration',
      'Booking, cancellation & FAQ tools',
      'Live call transcription',
      'Escalation to human agents',
      'Approvals for high-risk actions',
      'Company Brain integration',
    ],
    limits: [
      { label: 'Calls handled', value: 'Up to 2,000 / month' },
      { label: 'Connected minutes', value: 'Up to 4,000 / month' },
      { label: 'Configured industries', value: '1 active profile' },
      { label: 'Concurrent calls', value: 'Up to 5' },
    ],
  },
]

export function getPlanForEmployee(employeeType: 'hr' | 'voice'): EmployeePlan {
  const plan = mockPlans.find((p) => p.employeeType === employeeType)
  if (!plan) throw new Error(`No plan configured for employee type: ${employeeType}`)
  return plan
}
