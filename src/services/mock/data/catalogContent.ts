import type { EmployeeCatalogContent } from '@/types'

export const employeeCatalogContent: EmployeeCatalogContent[] = [
  {
    employeeType: 'hr',
    whatItDoes: [
      'Resume upload & OCR / resume parsing',
      'Candidate information extraction',
      'Skills extraction',
      'Experience extraction',
      'JD / role matching',
      'Candidate scoring',
      'HR approval',
      'AI voice screening',
      'AI interview',
      'AI screening report',
      'Human review',
      'Interview scheduling',
    ],
    howItWorks: [
      'Job / JD',
      'Resume Upload',
      'OCR / Resume Parsing',
      'Skills & Experience Extraction',
      'JD Matching',
      'Candidate Score',
      'HR Approval',
      'AI Voice Screening',
      'AI Screening Report',
      'Human Review',
      'Interview Scheduling',
    ],
    includes: [
      'Candidate processing',
      'Resume analysis',
      'AI screening',
      'AI interview',
      'Interview scheduling',
      'HR analytics',
      'Company Brain integration',
    ],
    faq: [
      { question: 'Does the AI make final hiring decisions?', answer: 'No. AI-generated assessments are evidence-backed recommendations — final hiring decisions always remain with your authorized HR personnel.' },
      { question: 'Can I cancel anytime?', answer: 'Yes, you can pause or cancel the Jexa HR subscription anytime from Billing & Subscriptions. Your data is retained if you reactivate later.' },
      { question: 'What happens if I go over my candidate limit?', answer: 'You will be notified before hitting your plan limit and can upgrade at any time.' },
      { question: 'Is this self-service?', answer: 'Yes — Jexa HR is a self-service subscription. Purchase it, configure your hiring team, jobs and rubric, and start screening candidates immediately.' },
    ],
  },
  {
    employeeType: 'voice',
    whatItDoes: [
      'Handles customer calls',
      'Answers enquiries',
      'Manages bookings',
      'Provides customer support',
      'Qualifies leads',
      'Shares business information',
      'Executes API actions on your systems',
      'Escalates to a human when needed',
      '24/7 voice availability',
    ],
    howItWorks: [
      'Discovery & Demo',
      'Business Requirements',
      'JEXA.AI Solution Team',
      'Customization',
      'Knowledge Configuration',
      'Tool / API Integration',
      'Voice Configuration',
      'Agent Workflow & Guardrails',
      'Telephony Setup',
      'Testing & Customer Approval',
      'Deployment to Your Account',
    ],
    includes: [
      'Custom-built conversation design',
      'Industry-specific configuration',
      'Booking & cancellation tools',
      'Live transcription',
      'Escalation routing',
      'Call analytics',
      'Company Brain integration',
    ],
    faq: [
      { question: 'Can I buy this like a normal subscription?', answer: 'No — Jaan is customized and deployed by JEXA.AI for your specific business. There is no self-service checkout; our team builds and configures it with you.' },
      { question: 'How long does deployment take?', answer: 'It depends on the complexity of your requirements. After discovery, our solution team configures knowledge, tools, voice and guardrails, then runs testing before deployment to your account.' },
      { question: 'What happens on a high-risk request?', answer: 'Actions like refunds or cancellations above your configured threshold are routed to the Approvals queue for human sign-off.' },
      { question: 'Can I make changes after it is live?', answer: 'Yes — you get safe, everyday controls (name, voice, language, greeting, hours) from your dashboard. JEXA.AI continues to manage the underlying AI configuration.' },
    ],
  },
]

export function getCatalogContent(employeeType: 'hr' | 'voice'): EmployeeCatalogContent {
  const content = employeeCatalogContent.find((c) => c.employeeType === employeeType)
  if (!content) throw new Error(`No catalog content for employee type: ${employeeType}`)
  return content
}
