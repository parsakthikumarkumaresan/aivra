import type { Candidate } from '@/types'

export const mockCandidates: Candidate[] = [
  // Senior Product Designer (job_1042)
  {
    id: 'cand_1', jobId: 'job_1042', name: 'Meera Krishnan', email: 'meera.krishnan@gmail.com', phone: '+91 98450 11223',
    appliedAt: '2026-08-10T09:00:00Z', stage: 'ai_interview', source: 'linkedin', overallScore: 88,
    resumeSummary: '7 years product design experience, led design for a fintech onboarding flow that improved conversion by 24%. Strong systems thinking and portfolio craft.',
    resumeEvidence: [
      { criterionId: 'crit_1', criterionLabel: 'Product Thinking', score: 90, evidence: 'Led a full redesign of a fintech onboarding flow, using cohort data to justify each design decision.', sourceExcerpt: '"...reduced onboarding drop-off from 38% to 14% by restructuring the KYC flow around user mental models..."' },
      { criterionId: 'crit_2', criterionLabel: 'UX Craft & Portfolio Quality', score: 92, evidence: 'Portfolio shows consistent visual system and strong interaction detailing across 4 case studies.', sourceExcerpt: '"...built and maintained the design system used across 3 product lines..."' },
      { criterionId: 'crit_3', criterionLabel: 'Collaboration & Communication', score: 85, evidence: 'Resume highlights close partnership with PM and eng leads on roadmap planning.' },
      { criterionId: 'crit_4', criterionLabel: 'Systems & Design Ops', score: 88, evidence: 'Owned a Figma component library adopted by 12 designers.' },
      { criterionId: 'crit_5', criterionLabel: 'Leadership & Mentorship', score: 80, evidence: 'Mentored 2 junior designers; no formal team-lead title yet.' },
    ],
    location: 'Bengaluru, India', yearsExperience: 7, currentTitle: 'Senior Product Designer, Finlytics',
    interviewId: 'int_1',
  },
  {
    id: 'cand_2', jobId: 'job_1042', name: 'Arvind Subramanian', email: 'arvind.s@outlook.com', phone: '+91 90031 22456',
    appliedAt: '2026-08-08T09:00:00Z', stage: 'human_interview', source: 'referral', overallScore: 91,
    resumeSummary: '9 years experience, previously design lead at a B2B SaaS company. Strong track record shipping 0-to-1 products.',
    resumeEvidence: [
      { criterionId: 'crit_1', criterionLabel: 'Product Thinking', score: 93, evidence: 'Shipped 3 zero-to-one products with documented discovery process.' },
      { criterionId: 'crit_2', criterionLabel: 'UX Craft & Portfolio Quality', score: 90, evidence: 'Polished portfolio with detailed rationale for each design decision.' },
      { criterionId: 'crit_3', criterionLabel: 'Collaboration & Communication', score: 92, evidence: 'Led weekly cross-functional design reviews with 15+ stakeholders.' },
      { criterionId: 'crit_4', criterionLabel: 'Systems & Design Ops', score: 85, evidence: 'Contributed to but did not own a design system.' },
      { criterionId: 'crit_5', criterionLabel: 'Leadership & Mentorship', score: 94, evidence: 'Formally led a team of 4 designers for 2 years.' },
    ],
    location: 'Bengaluru, India', yearsExperience: 9, currentTitle: 'Design Lead, CloudStack',
    interviewId: 'int_2',
  },
  {
    id: 'cand_3', jobId: 'job_1042', name: 'Priyanka Das', email: 'priyanka.das88@gmail.com',
    appliedAt: '2026-08-12T09:00:00Z', stage: 'shortlisted', source: 'careers_site', overallScore: 76,
    resumeSummary: '4 years experience at a mid-size e-commerce company. Solid craft, limited exposure to 0-to-1 product work.',
    resumeEvidence: [
      { criterionId: 'crit_1', criterionLabel: 'Product Thinking', score: 70, evidence: 'Mostly iterative feature work rather than ground-up problem framing.' },
      { criterionId: 'crit_2', criterionLabel: 'UX Craft & Portfolio Quality', score: 82, evidence: 'Clean, consistent visual craft across case studies.' },
      { criterionId: 'crit_3', criterionLabel: 'Collaboration & Communication', score: 78, evidence: 'Resume mentions regular collaboration with PM, limited detail.' },
      { criterionId: 'crit_4', criterionLabel: 'Systems & Design Ops', score: 74, evidence: 'Used but did not build a design system.' },
      { criterionId: 'crit_5', criterionLabel: 'Leadership & Mentorship', score: 60, evidence: 'No mentorship experience noted.' },
    ],
    location: 'Pune, India', yearsExperience: 4, currentTitle: 'Product Designer, ShopKart',
  },
  {
    id: 'cand_4', jobId: 'job_1042', name: 'Rohit Bhatia', email: 'rohit.bhatia@yahoo.com',
    appliedAt: '2026-08-13T09:00:00Z', stage: 'screening', source: 'job_board', overallScore: 62,
    resumeSummary: '3 years experience, mostly UI-focused work with limited product ownership.',
    resumeEvidence: [
      { criterionId: 'crit_1', criterionLabel: 'Product Thinking', score: 55, evidence: 'Limited evidence of independent problem framing.' },
      { criterionId: 'crit_2', criterionLabel: 'UX Craft & Portfolio Quality', score: 72, evidence: 'Decent visual polish but shallow case studies.' },
      { criterionId: 'crit_3', criterionLabel: 'Collaboration & Communication', score: 60, evidence: 'Limited detail on cross-functional work.' },
      { criterionId: 'crit_4', criterionLabel: 'Systems & Design Ops', score: 58, evidence: 'No design system experience mentioned.' },
      { criterionId: 'crit_5', criterionLabel: 'Leadership & Mentorship', score: 50, evidence: 'None noted.' },
    ],
    location: 'Hyderabad, India', yearsExperience: 3, currentTitle: 'UI Designer, Freelance',
  },
  {
    id: 'cand_5', jobId: 'job_1042', name: 'Sneha Reddy', email: 'sneha.reddy@gmail.com',
    appliedAt: '2026-08-14T09:00:00Z', stage: 'applied', source: 'linkedin', overallScore: null,
    resumeSummary: 'Awaiting AI resume screening.',
    resumeEvidence: [],
    location: 'Chennai, India', yearsExperience: 5, currentTitle: 'Product Designer, Nimbus Health',
  },
  {
    id: 'cand_6', jobId: 'job_1042', name: 'Farhan Ahmed', email: 'farhan.ahmed@gmail.com',
    appliedAt: '2026-07-28T09:00:00Z', stage: 'rejected', source: 'careers_site', overallScore: 41,
    resumeSummary: '1 year experience — well below the required seniority for this role.',
    resumeEvidence: [
      { criterionId: 'crit_1', criterionLabel: 'Product Thinking', score: 38, evidence: 'Junior-level work, mostly executing specs from senior designers.' },
      { criterionId: 'crit_2', criterionLabel: 'UX Craft & Portfolio Quality', score: 50, evidence: 'Basic portfolio, limited range.' },
    ],
    location: 'Delhi, India', yearsExperience: 1, currentTitle: 'Junior Designer, PixelWorks',
    needsAttention: false,
  },

  // Backend Engineer (job_1043)
  {
    id: 'cand_7', jobId: 'job_1043', name: 'Arjun Verma', email: 'arjun.verma@protonmail.com', phone: '+91 99870 44112',
    appliedAt: '2026-08-09T09:00:00Z', stage: 'ai_interview', source: 'referral', overallScore: 82,
    resumeSummary: '5 years backend experience, strong distributed systems background at a logistics scale-up.',
    resumeEvidence: [
      { criterionId: 'crit_1', criterionLabel: 'Systems Design', score: 85, evidence: 'Designed an event-driven order routing system handling 40K events/min.' },
      { criterionId: 'crit_2', criterionLabel: 'Coding Proficiency', score: 84, evidence: 'Deep Go and Python experience across 3 production services.' },
      { criterionId: 'crit_3', criterionLabel: 'Ownership & Reliability', score: 80, evidence: 'Primary on-call owner for payments service for 18 months.' },
      { criterionId: 'crit_4', criterionLabel: 'Collaboration', score: 78, evidence: 'Regularly presented technical designs to non-technical stakeholders.' },
      { criterionId: 'crit_5', criterionLabel: 'Security Awareness', score: 75, evidence: 'Implemented PCI-compliant tokenization for payments data.' },
    ],
    location: 'Remote, India', yearsExperience: 5, currentTitle: 'Backend Engineer, RouteX Logistics',
    interviewId: 'int_3',
  },
  {
    id: 'cand_8', jobId: 'job_1043', name: 'Divya Menon', email: 'divya.menon@gmail.com',
    appliedAt: '2026-08-11T09:00:00Z', stage: 'shortlisted', source: 'linkedin', overallScore: 79,
    resumeSummary: '4 years experience with strong API design and testing discipline.',
    resumeEvidence: [
      { criterionId: 'crit_1', criterionLabel: 'Systems Design', score: 78, evidence: 'Built a multi-tenant API gateway for an internal platform team.' },
      { criterionId: 'crit_2', criterionLabel: 'Coding Proficiency', score: 82, evidence: 'Strong Python fundamentals, contributes to open source.' },
      { criterionId: 'crit_3', criterionLabel: 'Ownership & Reliability', score: 76, evidence: 'Shared on-call rotation, limited incident-lead experience.' },
      { criterionId: 'crit_4', criterionLabel: 'Collaboration', score: 80, evidence: 'Resume highlights pairing and code review culture.' },
      { criterionId: 'crit_5', criterionLabel: 'Security Awareness', score: 74, evidence: 'General awareness, no specialized security work.' },
    ],
    location: 'Bengaluru, India', yearsExperience: 4, currentTitle: 'Software Engineer, DataForge',
  },
  {
    id: 'cand_9', jobId: 'job_1043', name: 'Karan Malhotra', email: 'karan.malhotra@gmail.com',
    appliedAt: '2026-08-12T09:00:00Z', stage: 'screening', source: 'job_board', overallScore: 58,
    resumeSummary: '2 years experience, mostly frontend-leaning full stack work.',
    resumeEvidence: [
      { criterionId: 'crit_1', criterionLabel: 'Systems Design', score: 50, evidence: 'Limited backend systems design exposure.' },
      { criterionId: 'crit_2', criterionLabel: 'Coding Proficiency', score: 65, evidence: 'Solid JavaScript/Node experience, limited Go/Python.' },
    ],
    location: 'Noida, India', yearsExperience: 2, currentTitle: 'Full Stack Engineer, Loopwise',
  },
  {
    id: 'cand_10', jobId: 'job_1043', name: 'Ishaan Kapoor', email: 'ishaan.kapoor@gmail.com',
    appliedAt: '2026-08-06T09:00:00Z', stage: 'human_interview', source: 'agency', overallScore: 86,
    resumeSummary: '6 years experience, ex-FAANG, deep distributed systems background.',
    resumeEvidence: [
      { criterionId: 'crit_1', criterionLabel: 'Systems Design', score: 90, evidence: 'Designed sharding strategy for a service handling 2M+ QPS.' },
      { criterionId: 'crit_2', criterionLabel: 'Coding Proficiency', score: 88, evidence: 'Deep Go expertise, strong CS fundamentals.' },
      { criterionId: 'crit_3', criterionLabel: 'Ownership & Reliability', score: 85, evidence: 'Led incident response for multiple P0 outages.' },
      { criterionId: 'crit_4', criterionLabel: 'Collaboration', score: 80, evidence: 'Cross-team design reviews at scale.' },
      { criterionId: 'crit_5', criterionLabel: 'Security Awareness', score: 82, evidence: 'Contributed to internal security review process.' },
    ],
    location: 'Bengaluru, India', yearsExperience: 6, currentTitle: 'Senior Software Engineer, Meridian Cloud',
    interviewId: 'int_4',
  },
  {
    id: 'cand_11', jobId: 'job_1043', name: 'Vikram Sen', email: 'vikram.sen@gmail.com',
    appliedAt: '2026-08-15T09:00:00Z', stage: 'applied', source: 'careers_site', overallScore: null,
    resumeSummary: 'Awaiting AI resume screening.', resumeEvidence: [],
    location: 'Kolkata, India', yearsExperience: 4, currentTitle: 'Backend Developer, PayNest',
  },

  // Customer Success Manager (job_1044)
  {
    id: 'cand_12', jobId: 'job_1044', name: 'Ananya Iyer', email: 'ananya.iyer@gmail.com',
    appliedAt: '2026-08-10T09:00:00Z', stage: 'selected', source: 'referral', overallScore: 90,
    resumeSummary: '4 years CS experience at a B2B SaaS company, strong retention track record.',
    resumeEvidence: [],
    location: 'Mumbai, India', yearsExperience: 4, currentTitle: 'Senior CSM, Growthly',
  },
  {
    id: 'cand_13', jobId: 'job_1044', name: 'Naveen Pillai', email: 'naveen.pillai@gmail.com',
    appliedAt: '2026-08-12T09:00:00Z', stage: 'on_hold', source: 'linkedin', overallScore: 68,
    resumeSummary: 'Strong communicator, less enterprise SaaS exposure than preferred. On hold pending budget approval.',
    resumeEvidence: [], needsAttention: true, attentionReason: 'On hold for 5 days — budget approval pending from finance.',
    location: 'Mumbai, India', yearsExperience: 3, currentTitle: 'Account Manager, Bright Retail',
  },
  {
    id: 'cand_14', jobId: 'job_1044', name: 'Tara Joseph', email: 'tara.joseph@gmail.com',
    appliedAt: '2026-08-14T09:00:00Z', stage: 'applied', source: 'job_board', overallScore: null,
    resumeSummary: 'Awaiting AI resume screening.', resumeEvidence: [],
    location: 'Mumbai, India', yearsExperience: 2, currentTitle: 'Customer Support Lead, Quickserve',
  },
]

export function getCandidatesByJob(jobId: string) {
  return mockCandidates.filter((c) => c.jobId === jobId)
}
