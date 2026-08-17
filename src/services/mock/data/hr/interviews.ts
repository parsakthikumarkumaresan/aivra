import type { Interview } from '@/types'

export const mockInterviews: Record<string, Interview> = {
  int_1: {
    id: 'int_1',
    candidateId: 'cand_1',
    jobId: 'job_1042',
    status: 'in_progress',
    template: 'Senior Product Design — Structured Interview v3',
    durationMinutes: 30,
    language: 'English (India)',
    questionCategories: ['Product Thinking', 'UX Craft', 'Collaboration', 'Systems Thinking'],
    questions: [
      { id: 'q1', category: 'Product Thinking', prompt: 'Walk me through a time you had to make a product decision with incomplete data. What was your process?', answered: true, askedAt: '2026-08-17T10:00:10Z', candidateResponseSummary: 'Described the fintech onboarding redesign, using qualitative interviews to fill gaps in quantitative data.' },
      { id: 'q2', category: 'Product Thinking', prompt: 'How do you decide what NOT to build when a stakeholder pushes for a feature you disagree with?', answered: true, askedAt: '2026-08-17T10:03:40Z', candidateResponseSummary: 'Emphasized framing tradeoffs in terms of user impact and using prototypes to test contested ideas quickly.' },
      { id: 'q3', category: 'UX Craft', prompt: 'Tell me about the most complex interaction pattern you have designed. What made it hard to get right?', answered: true, askedAt: '2026-08-17T10:07:15Z', candidateResponseSummary: 'Discussed a multi-step KYC flow with conditional branching and how she simplified it through progressive disclosure.' },
      { id: 'q4', category: 'Collaboration', prompt: 'Describe a disagreement you had with an engineer or PM about a design decision. How was it resolved?', answered: false },
      { id: 'q5', category: 'Systems Thinking', prompt: 'How would you approach designing a component that needs to work across 5 different product surfaces?', answered: false },
    ],
    transcript: [
      { id: 't1', speaker: 'ai', text: 'Hi Meera, thanks for joining. I\'ll be asking you a series of structured questions about your product design experience — this should take about 30 minutes. Ready to begin?', timestamp: '2026-08-17T10:00:00Z' },
      { id: 't2', speaker: 'candidate', text: 'Yes, ready!', timestamp: '2026-08-17T10:00:05Z' },
      { id: 't3', speaker: 'ai', text: 'Walk me through a time you had to make a product decision with incomplete data. What was your process?', timestamp: '2026-08-17T10:00:10Z' },
      { id: 't4', speaker: 'candidate', text: 'Sure — when we redesigned our fintech onboarding flow, we didn\'t have great quantitative data on where users were confused, just an aggregate drop-off number. So I ran five quick qualitative interviews with recently churned users to understand the emotional and cognitive friction points, then used that to prioritize which steps to redesign first.', timestamp: '2026-08-17T10:01:20Z' },
      { id: 't5', speaker: 'ai', text: 'That\'s helpful. How do you decide what NOT to build when a stakeholder pushes for a feature you disagree with?', timestamp: '2026-08-17T10:03:40Z' },
      { id: 't6', speaker: 'candidate', text: 'I try to reframe it around the underlying user or business outcome the stakeholder is after, then propose a prototype we can test cheaply — often the disagreement is really about two different paths to the same goal, and testing resolves it faster than debate.', timestamp: '2026-08-17T10:04:50Z' },
      { id: 't7', speaker: 'ai', text: 'Tell me about the most complex interaction pattern you have designed. What made it hard to get right?', timestamp: '2026-08-17T10:07:15Z' },
      { id: 't8', speaker: 'candidate', text: 'Probably the conditional KYC flow — depending on document type and risk score, users could branch into up to six different paths. The hard part was keeping the interface feeling linear and simple even though the logic underneath was complex, so I used progressive disclosure and only showed the next step once the current one was resolved.', timestamp: '2026-08-17T10:08:45Z' },
    ],
  },

  int_2: {
    id: 'int_2',
    candidateId: 'cand_2',
    jobId: 'job_1042',
    status: 'completed',
    template: 'Senior Product Design — Structured Interview v3',
    durationMinutes: 30,
    language: 'English (India)',
    questionCategories: ['Product Thinking', 'UX Craft', 'Collaboration', 'Systems Thinking'],
    questions: [
      { id: 'q1', category: 'Product Thinking', prompt: 'Walk me through a time you had to make a product decision with incomplete data.', answered: true, candidateResponseSummary: 'Strong example from a 0-to-1 launch, showed clear prioritization framework.' },
      { id: 'q2', category: 'Leadership', prompt: 'How have you grown other designers on your team?', answered: true, candidateResponseSummary: 'Described a structured weekly critique format and 1:1 growth plans for 4 direct reports.' },
    ],
    transcript: [
      { id: 't1', speaker: 'ai', text: 'Hi Arvind, thanks for joining — let\'s get started.', timestamp: '2026-08-15T11:00:00Z' },
      { id: 't2', speaker: 'candidate', text: 'Happy to be here.', timestamp: '2026-08-15T11:00:05Z' },
    ],
    completedAt: '2026-08-15T11:32:00Z',
    scheduledHumanInterviewAt: '2026-08-19T10:30:00Z',
    scheduledInterviewer: 'Design Leadership Panel',
    meetingLink: 'meet.google.com/arv-hire-042',
    report: {
      summary: 'Arvind demonstrates strong product thinking and clear leadership experience, backed by concrete examples across multiple 0-to-1 launches. Communication was structured and confident throughout.',
      strengths: ['Clear, structured storytelling with measurable outcomes', 'Demonstrated formal leadership of a 4-person design team', 'Strong grasp of tradeoffs between speed and craft'],
      gaps: ['Limited detail on design systems ownership', 'Did not probe deeply on cross-functional conflict resolution'],
      unansweredQuestions: [],
      criterionEvidence: [
        { criterionId: 'crit_1', criterionLabel: 'Product Thinking', score: 93, evidence: 'Consistently framed decisions around measurable user and business outcomes.' },
        { criterionId: 'crit_5', criterionLabel: 'Leadership & Mentorship', score: 94, evidence: 'Detailed, concrete mentorship examples with structured growth plans.' },
      ],
      recommendedNextStep: 'Proceed to human interview with design leadership.',
      humanReviewRequired: true,
    },
  },

  int_3: {
    id: 'int_3',
    candidateId: 'cand_7',
    jobId: 'job_1043',
    status: 'completed',
    template: 'Backend Engineering — Structured Interview v2',
    durationMinutes: 35,
    language: 'English (India)',
    questionCategories: ['Systems Design', 'Coding Proficiency', 'Ownership', 'Security'],
    questions: [
      { id: 'q1', category: 'Systems Design', prompt: 'Describe a distributed system you designed. What were the key scaling challenges?', answered: true, candidateResponseSummary: 'Detailed the event-driven order routing system, including partitioning strategy.' },
      { id: 'q2', category: 'Coding Proficiency', prompt: 'How do you approach testing for services with complex async behavior?', answered: true, candidateResponseSummary: 'Described contract testing and chaos testing for async message flows.' },
      { id: 'q3', category: 'Ownership', prompt: 'Tell me about the most significant production incident you\'ve handled.', answered: true, candidateResponseSummary: 'Walked through a payments outage, root cause, and the postmortem process he drove.' },
      { id: 'q4', category: 'Security', prompt: 'How do you think about securing sensitive customer data in a service you own?', answered: true, candidateResponseSummary: 'Discussed tokenization approach and least-privilege access patterns, but response was fairly high-level.' },
    ],
    transcript: [
      { id: 't1', speaker: 'ai', text: 'Hi Arjun, thanks for making time. Let\'s dive in — describe a distributed system you designed and the key scaling challenges.', timestamp: '2026-08-16T14:00:00Z' },
      { id: 't2', speaker: 'candidate', text: 'At RouteX I designed the event-driven order routing system. The main challenge was partitioning — we needed ordering guarantees per merchant but high throughput overall, so I used merchant ID as the partition key with a custom rebalancing strategy.', timestamp: '2026-08-16T14:01:40Z' },
      { id: 't3', speaker: 'ai', text: 'How do you approach testing for services with complex async behavior?', timestamp: '2026-08-16T14:04:10Z' },
      { id: 't4', speaker: 'candidate', text: 'We relied heavily on contract tests between services, plus a chaos testing suite that randomly delayed or dropped messages to verify our retry and idempotency logic actually held up.', timestamp: '2026-08-16T14:05:50Z' },
      { id: 't5', speaker: 'ai', text: 'Tell me about the most significant production incident you\'ve handled.', timestamp: '2026-08-16T14:08:00Z' },
      { id: 't6', speaker: 'candidate', text: 'We had a payments service outage caused by a downstream rate limit we didn\'t know existed. I led the incident, coordinated the rollback, and then drove the postmortem that added circuit breakers across all downstream calls.', timestamp: '2026-08-16T14:10:30Z' },
      { id: 't7', speaker: 'ai', text: 'How do you think about securing sensitive customer data in a service you own?', timestamp: '2026-08-16T14:13:00Z' },
      { id: 't8', speaker: 'candidate', text: 'Tokenize anything sensitive at the edge, least-privilege access for services that need it, and audit logging on every read.', timestamp: '2026-08-16T14:14:20Z' },
    ],
    completedAt: '2026-08-16T14:35:00Z',
    report: {
      summary: 'Arjun shows strong systems design and incident ownership experience with concrete, verifiable examples. His security response was solid but less detailed than other areas — worth probing further in the human round.',
      strengths: ['Concrete distributed systems experience with real scaling constraints', 'Led incident response and drove long-term reliability improvements', 'Clear communicator, structured answers'],
      gaps: ['Security response was high-level — limited detail on specific compliance frameworks', 'No mention of mentoring or leading other engineers'],
      unansweredQuestions: [],
      criterionEvidence: [
        { criterionId: 'crit_1', criterionLabel: 'Systems Design', score: 85, evidence: 'Detailed, concrete example of partitioning strategy under real scaling constraints.' },
        { criterionId: 'crit_3', criterionLabel: 'Ownership & Reliability', score: 83, evidence: 'Led incident response and postmortem for a significant production outage.' },
        { criterionId: 'crit_5', criterionLabel: 'Security Awareness', score: 68, evidence: 'Described tokenization and least-privilege access, but answer lacked depth on specific frameworks.' },
      ],
      recommendedNextStep: 'Proceed to human interview — probe security depth further.',
      humanReviewRequired: true,
    },
  },

  int_4: {
    id: 'int_4',
    candidateId: 'cand_10',
    jobId: 'job_1043',
    status: 'completed',
    template: 'Backend Engineering — Structured Interview v2',
    durationMinutes: 35,
    language: 'English (India)',
    questionCategories: ['Systems Design', 'Coding Proficiency', 'Ownership', 'Security'],
    questions: [
      { id: 'q1', category: 'Systems Design', prompt: 'Describe a distributed system you designed at scale.', answered: true, candidateResponseSummary: 'Detailed sharding strategy for a service at 2M+ QPS.' },
    ],
    transcript: [
      { id: 't1', speaker: 'ai', text: 'Hi Ishaan, let\'s get started with systems design.', timestamp: '2026-08-14T09:00:00Z' },
      { id: 't2', speaker: 'candidate', text: 'Sounds good.', timestamp: '2026-08-14T09:00:05Z' },
    ],
    completedAt: '2026-08-14T09:38:00Z',
    scheduledHumanInterviewAt: '2026-08-18T15:00:00Z',
    scheduledInterviewer: 'Rohan Mehta',
    meetingLink: 'meet.google.com/isk-hire-107',
    report: {
      summary: 'Ishaan demonstrates deep, expert-level distributed systems experience at significant scale, with strong incident leadership. One of the strongest technical candidates screened for this role.',
      strengths: ['Expert-level distributed systems design at very large scale', 'Extensive incident leadership across multiple P0s', 'Deep CS fundamentals'],
      gaps: ['Limited detail on mentoring junior engineers'],
      unansweredQuestions: [],
      criterionEvidence: [
        { criterionId: 'crit_1', criterionLabel: 'Systems Design', score: 90, evidence: 'Designed sharding for a service handling 2M+ QPS with clear tradeoff reasoning.' },
      ],
      recommendedNextStep: 'Fast-track to human interview with engineering leadership.',
      humanReviewRequired: true,
    },
  },

  int_5: {
    id: 'int_5',
    candidateId: 'cand_16',
    jobId: 'job_1042',
    status: 'completed',
    template: 'Senior Product Design — Structured Interview v3',
    durationMinutes: 28,
    language: 'English (India)',
    questionCategories: ['Product Thinking', 'UX Craft', 'Collaboration', 'Systems Thinking'],
    questions: [
      { id: 'q1', category: 'Systems Thinking', prompt: 'How did you get design system adoption across 5 product teams?', answered: true, candidateResponseSummary: 'Described a phased rollout with embedded design office hours and a contribution model.' },
    ],
    transcript: [
      { id: 't1', speaker: 'ai', text: 'Hi Neha, thanks for joining — let\'s get started.', timestamp: '2026-08-12T10:00:00Z' },
      { id: 't2', speaker: 'candidate', text: 'Happy to be here!', timestamp: '2026-08-12T10:00:05Z' },
    ],
    completedAt: '2026-08-12T10:29:00Z',
    report: {
      summary: 'Neha shows deep, hands-on design systems ownership with clear evidence of org-wide adoption. Strong communicator with a structured approach to research.',
      strengths: ['Design system adopted across 5 product teams with a clear rollout plan', 'Strong research practice backing design decisions', 'Confident, structured communicator'],
      gaps: ['Limited exposure to 0-to-1 product launches'],
      unansweredQuestions: [],
      criterionEvidence: [
        { criterionId: 'crit_4', criterionLabel: 'Systems & Design Ops', score: 94, evidence: 'Drove design system adoption across 5 product teams with a documented contribution model.' },
      ],
      recommendedNextStep: 'Approve for human interview with design leadership.',
      humanReviewRequired: true,
    },
  },

  int_6: {
    id: 'int_6',
    candidateId: 'cand_17',
    jobId: 'job_1043',
    status: 'failed',
    template: 'Backend Engineering — Structured Interview v2',
    durationMinutes: 35,
    language: 'English (India)',
    questionCategories: ['Systems Design', 'Coding Proficiency', 'Ownership', 'Security'],
    questions: [],
    transcript: [
      { id: 't1', speaker: 'system', text: 'Dialing +91 99887 12233…', timestamp: '2026-08-17T11:00:00Z' },
      { id: 't2', speaker: 'system', text: 'Call failed — no answer after 3 attempts.', timestamp: '2026-08-17T11:02:30Z' },
    ],
  },

  int_demo: {
    id: 'int_demo',
    candidateId: 'cand_demo',
    jobId: 'job_1043',
    status: 'not_started',
    template: 'Backend Engineering — Structured Interview v2 (Sample)',
    durationMinutes: 20,
    language: 'English (India)',
    questionCategories: ['Systems Design', 'Coding Proficiency'],
    isDemo: true,
    questions: [
      { id: 'q1', category: 'Systems Design', prompt: 'Describe a distributed system you designed. What were the key scaling challenges?', answered: true, askedAt: '2026-08-17T10:00:10Z', candidateResponseSummary: 'Sample response describing a partitioning strategy for a high-throughput queue.' },
      { id: 'q2', category: 'Coding Proficiency', prompt: 'How do you approach testing for services with complex async behavior?', answered: true, askedAt: '2026-08-17T10:03:40Z', candidateResponseSummary: 'Sample response describing contract and chaos testing.' },
    ],
    transcript: [
      { id: 't1', speaker: 'ai', text: 'Hi, this is a preview of the AI screening call. Ready to begin?', timestamp: '2026-08-17T10:00:00Z' },
      { id: 't2', speaker: 'candidate', text: 'Yes, ready!', timestamp: '2026-08-17T10:00:05Z' },
      { id: 't3', speaker: 'ai', text: 'Describe a distributed system you designed. What were the key scaling challenges?', timestamp: '2026-08-17T10:00:10Z' },
      { id: 't4', speaker: 'candidate', text: 'Sample answer: I designed an event-driven queue partitioned by tenant ID to balance throughput with per-tenant ordering guarantees.', timestamp: '2026-08-17T10:01:20Z' },
      { id: 't5', speaker: 'ai', text: 'How do you approach testing for services with complex async behavior?', timestamp: '2026-08-17T10:03:40Z' },
      { id: 't6', speaker: 'candidate', text: 'Sample answer: I rely on contract tests between services plus chaos testing that randomly delays or drops messages.', timestamp: '2026-08-17T10:04:50Z' },
    ],
  },
}

export function getInterviewByCandidate(candidateId: string): Interview | undefined {
  return Object.values(mockInterviews).find((i) => i.candidateId === candidateId)
}
