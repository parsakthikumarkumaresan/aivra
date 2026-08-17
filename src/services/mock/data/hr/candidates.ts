import type { Candidate, ExtractedResumeProfile } from '@/types'
import { mockJobs } from './jobs'
import { computeJdMatch } from './matching'

function job(id: string) {
  const found = mockJobs.find((j) => j.id === id)
  if (!found) throw new Error(`Unknown job ${id}`)
  return found
}

function profile(input: Omit<ExtractedResumeProfile, 'fileSizeLabel' | 'parsedAt'> & { fileSizeLabel?: string; parsedAt?: string }): ExtractedResumeProfile {
  return {
    fileSizeLabel: input.fileSizeLabel ?? '412 KB',
    parsedAt: input.parsedAt ?? '2026-08-10T09:05:00Z',
    ...input,
  }
}

// ---------------------------------------------------------------------
// Candidates for Senior Product Designer (job_1042)
// ---------------------------------------------------------------------
const meeraProfile = profile({
  fileName: 'Meera_Krishnan_Resume.pdf',
  fullName: 'Meera Krishnan', email: 'meera.krishnan@gmail.com', phone: '+91 98450 11223', location: 'Bengaluru, India',
  yearsExperience: 7, currentTitle: 'Senior Product Designer',
  previousCompanies: ['Finlytics', 'PixelCraft Studio'],
  skills: ['Figma', 'Design Systems', 'Interaction Design', 'Prototyping', 'User Research', 'Sketch'],
  technicalSkills: ['Figma', 'Design Tokens', 'Storybook'],
  education: [{ degree: 'B.Des, Visual Communication', institution: 'NID Ahmedabad' }],
  certifications: [],
  projects: ['Fintech onboarding redesign', 'Design system v3 rollout'],
  jobTitles: ['Senior Product Designer', 'Product Designer'],
  summary: '7 years product design experience, led design for a fintech onboarding flow that improved conversion by 24%. Strong systems thinking and portfolio craft.',
})

const arvindProfile = profile({
  fileName: 'Arvind_Subramanian_CV.pdf',
  fullName: 'Arvind Subramanian', email: 'arvind.s@outlook.com', phone: '+91 90031 22456', location: 'Bengaluru, India',
  yearsExperience: 9, currentTitle: 'Design Lead',
  previousCompanies: ['CloudStack', 'Nimbus Retail'],
  skills: ['Figma', 'Design Systems', 'Interaction Design', 'User Research', 'Prototyping', 'Team Leadership'],
  technicalSkills: ['Figma', 'Framer', 'Design Ops'],
  education: [{ degree: 'B.Des', institution: 'MIT Institute of Design' }],
  certifications: [],
  projects: ['0-to-1 SaaS product launch', 'Grew design team from 1 to 4 designers'],
  jobTitles: ['Design Lead', 'Senior Product Designer'],
  summary: '9 years experience, previously design lead at a B2B SaaS company. Strong track record shipping 0-to-1 products.',
})

const priyankaProfile = profile({
  fileName: 'Priyanka_Das_Resume.pdf',
  fullName: 'Priyanka Das', email: 'priyanka.das88@gmail.com', phone: '+91 98111 44556', location: 'Pune, India',
  yearsExperience: 4, currentTitle: 'Product Designer',
  previousCompanies: ['ShopKart'],
  skills: ['Figma', 'Interaction Design', 'Visual Design'],
  technicalSkills: ['Figma', 'Adobe XD'],
  education: [{ degree: 'B.Des', institution: 'Pearl Academy' }],
  certifications: [],
  projects: ['E-commerce checkout redesign'],
  jobTitles: ['Product Designer'],
  summary: '4 years experience at a mid-size e-commerce company. Solid craft, limited exposure to 0-to-1 product work.',
})

const rohitProfile = profile({
  fileName: 'Rohit_Bhatia_CV.docx',
  fullName: 'Rohit Bhatia', email: 'rohit.bhatia@yahoo.com', phone: '+91 91234 55667', location: 'Hyderabad, India',
  yearsExperience: 3, currentTitle: 'UI Designer',
  previousCompanies: ['Freelance'],
  skills: ['Figma', 'Visual Design'],
  technicalSkills: ['Figma', 'Adobe Illustrator'],
  education: [{ degree: 'Diploma in Graphic Design', institution: 'Arena Animation' }],
  certifications: [],
  projects: ['Freelance UI projects for 6 clients'],
  jobTitles: ['UI Designer'],
  summary: '3 years experience, mostly UI-focused work with limited product ownership.',
})

const farhanProfile = profile({
  fileName: 'Farhan_Ahmed_Resume.pdf',
  fullName: 'Farhan Ahmed', email: 'farhan.ahmed@gmail.com', phone: '+91 99001 22334', location: 'Delhi, India',
  yearsExperience: 1, currentTitle: 'Junior Designer',
  previousCompanies: ['PixelWorks'],
  skills: ['Figma'],
  technicalSkills: ['Figma'],
  education: [{ degree: 'B.Des', institution: 'Local Design Institute' }],
  certifications: [],
  projects: ['Landing page redesigns'],
  jobTitles: ['Junior Designer'],
  summary: '1 year experience — well below the required seniority for this role.',
})

const nehaProfile = profile({
  fileName: 'Neha_Kulkarni_Resume.pdf',
  fullName: 'Neha Kulkarni', email: 'neha.kulkarni@gmail.com', phone: '+91 97788 11223', location: 'Bengaluru, India',
  yearsExperience: 6, currentTitle: 'Senior Product Designer',
  previousCompanies: ['Northstar Labs'],
  skills: ['Figma', 'Design Systems', 'Interaction Design', 'User Research', 'Prototyping'],
  technicalSkills: ['Figma', 'Storybook', 'Design Tokens'],
  education: [{ degree: 'B.Des', institution: 'Srishti School of Design' }],
  certifications: [],
  projects: ['Design system adopted across 5 product teams'],
  jobTitles: ['Senior Product Designer'],
  summary: '6 years experience with deep design systems ownership and strong research practice.',
})

// ---------------------------------------------------------------------
// Candidates for Backend Engineer (job_1043)
// ---------------------------------------------------------------------
const arjunProfile = profile({
  fileName: 'Arjun_Verma_Resume.pdf',
  fullName: 'Arjun Verma', email: 'arjun.verma@protonmail.com', phone: '+91 99870 44112', location: 'Remote, India',
  yearsExperience: 5, currentTitle: 'Backend Engineer',
  previousCompanies: ['RouteX Logistics'],
  skills: ['Python', 'Go', 'PostgreSQL', 'Distributed Systems', 'Kafka'],
  technicalSkills: ['Python', 'Go', 'PostgreSQL', 'Docker', 'Kubernetes'],
  education: [{ degree: 'B.Tech, Computer Science', institution: 'NIT Trichy' }],
  certifications: [],
  projects: ['Event-driven order routing system handling 40K events/min'],
  jobTitles: ['Backend Engineer'],
  summary: '5 years backend experience, strong distributed systems background at a logistics scale-up.',
})

const divyaProfile = profile({
  fileName: 'Divya_Menon_CV.pdf',
  fullName: 'Divya Menon', email: 'divya.menon@gmail.com', phone: '+91 98220 55443', location: 'Bengaluru, India',
  yearsExperience: 4, currentTitle: 'Software Engineer',
  previousCompanies: ['DataForge'],
  skills: ['Python', 'PostgreSQL', 'API Design'],
  technicalSkills: ['Python', 'FastAPI', 'PostgreSQL'],
  education: [{ degree: 'B.E, Computer Science', institution: 'PES University' }],
  certifications: [],
  projects: ['Multi-tenant API gateway for internal platform team'],
  jobTitles: ['Software Engineer'],
  summary: '4 years experience with strong API design and testing discipline.',
})

const karanProfile = profile({
  fileName: 'Karan_Malhotra_Resume.docx',
  fullName: 'Karan Malhotra', email: 'karan.malhotra@gmail.com', phone: '+91 90332 11009', location: 'Noida, India',
  yearsExperience: 2, currentTitle: 'Full Stack Engineer',
  previousCompanies: ['Loopwise'],
  skills: ['JavaScript', 'Node.js'],
  technicalSkills: ['Node.js', 'MongoDB'],
  education: [{ degree: 'B.Tech, IT', institution: 'Local Engineering College' }],
  certifications: [],
  projects: ['Internal tooling dashboard'],
  jobTitles: ['Full Stack Engineer'],
  summary: '2 years experience, mostly frontend-leaning full stack work.',
})

const ishaanProfile = profile({
  fileName: 'Ishaan_Kapoor_Resume.pdf',
  fullName: 'Ishaan Kapoor', email: 'ishaan.kapoor@gmail.com', phone: '+91 99009 88776', location: 'Bengaluru, India',
  yearsExperience: 6, currentTitle: 'Senior Software Engineer',
  previousCompanies: ['Meridian Cloud'],
  skills: ['Go', 'Distributed Systems', 'AWS', 'PostgreSQL', 'Kubernetes'],
  technicalSkills: ['Go', 'AWS', 'Kubernetes', 'PostgreSQL'],
  education: [{ degree: 'B.Tech, Computer Science', institution: 'IIT Delhi' }],
  certifications: ['AWS Certified Solutions Architect'],
  projects: ['Sharding strategy for a service handling 2M+ QPS'],
  jobTitles: ['Senior Software Engineer'],
  summary: '6 years experience, ex-FAANG, deep distributed systems background.',
})

const sanjayProfile = profile({
  fileName: 'Sanjay_Rao_Resume.pdf',
  fullName: 'Sanjay Rao', email: 'sanjay.rao@gmail.com', phone: '+91 98456 77321', location: 'Chennai, India',
  yearsExperience: 4, currentTitle: 'Backend Engineer',
  previousCompanies: ['Vertex Systems'],
  skills: ['Python', 'PostgreSQL', 'AWS', 'Distributed Systems'],
  technicalSkills: ['Python', 'AWS', 'PostgreSQL', 'Redis'],
  education: [{ degree: 'B.E, Computer Science', institution: 'Anna University' }],
  certifications: [],
  projects: ['Migrated monolith to microservices on AWS'],
  jobTitles: ['Backend Engineer'],
  summary: '4 years backend experience with solid AWS and distributed systems fundamentals.',
})

const deepakProfile = profile({
  fileName: 'Deepak_Verma_Resume.pdf',
  fullName: 'Deepak Verma', email: 'deepak.verma@gmail.com', phone: '+91 99887 12233', location: 'Pune, India',
  yearsExperience: 3, currentTitle: 'Backend Developer',
  previousCompanies: ['Loopr Systems'],
  skills: ['Python', 'PostgreSQL'],
  technicalSkills: ['Python', 'Django', 'PostgreSQL'],
  education: [{ degree: 'B.Tech, Computer Science', institution: 'VIT Vellore' }],
  certifications: [],
  projects: ['Internal billing service'],
  jobTitles: ['Backend Developer'],
  summary: '3 years backend experience, mostly monolithic Django services.',
})

// ---------------------------------------------------------------------
// Candidates for Customer Success Manager (job_1044)
// ---------------------------------------------------------------------
const ananyaProfile = profile({
  fileName: 'Ananya_Iyer_Resume.pdf',
  fullName: 'Ananya Iyer', email: 'ananya.iyer@gmail.com', phone: '+91 98901 22110', location: 'Mumbai, India',
  yearsExperience: 4, currentTitle: 'Senior CSM',
  previousCompanies: ['Growthly'],
  skills: ['Account Management', 'Onboarding', 'SaaS', 'Communication'],
  technicalSkills: ['Salesforce', 'HubSpot'],
  education: [{ degree: 'BBA', institution: 'Christ University' }],
  certifications: [],
  projects: ['Reduced enterprise churn 18% year-over-year'],
  jobTitles: ['Senior CSM', 'Customer Success Manager'],
  summary: '4 years CS experience at a B2B SaaS company, strong retention track record.',
})

const naveenProfile = profile({
  fileName: 'Naveen_Pillai_Resume.pdf',
  fullName: 'Naveen Pillai', email: 'naveen.pillai@gmail.com', phone: '+91 90045 66778', location: 'Mumbai, India',
  yearsExperience: 3, currentTitle: 'Account Manager',
  previousCompanies: ['Bright Retail'],
  skills: ['Account Management', 'Communication'],
  technicalSkills: ['Zoho CRM'],
  education: [{ degree: 'BBA', institution: 'Local University' }],
  certifications: [],
  projects: [],
  jobTitles: ['Account Manager'],
  summary: 'Strong communicator, less enterprise SaaS exposure than preferred. On hold pending budget approval.',
})

export const mockCandidates: Candidate[] = [
  // Senior Product Designer (job_1042)
  {
    id: 'cand_1', jobId: 'job_1042', name: 'Meera Krishnan', email: 'meera.krishnan@gmail.com', phone: '+91 98450 11223',
    uploadedAt: '2026-08-10T09:00:00Z', stage: 'ai_screening', source: 'linkedin',
    screeningApproval: 'approved', interviewApproval: 'not_ready',
    extractedProfile: meeraProfile, jdMatch: computeJdMatch(meeraProfile, job('job_1042')),
    overallScore: computeJdMatch(meeraProfile, job('job_1042')).overallScore,
    resumeSummary: meeraProfile.summary,
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
    uploadedAt: '2026-08-08T09:00:00Z', stage: 'interview_scheduled', source: 'referral',
    screeningApproval: 'approved', interviewApproval: 'approved',
    extractedProfile: arvindProfile, jdMatch: computeJdMatch(arvindProfile, job('job_1042')),
    overallScore: computeJdMatch(arvindProfile, job('job_1042')).overallScore,
    resumeSummary: arvindProfile.summary,
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
    uploadedAt: '2026-08-12T09:00:00Z', stage: 'hr_review', source: 'careers_site',
    screeningApproval: 'pending', interviewApproval: 'not_ready',
    extractedProfile: priyankaProfile, jdMatch: computeJdMatch(priyankaProfile, job('job_1042')),
    overallScore: computeJdMatch(priyankaProfile, job('job_1042')).overallScore,
    resumeSummary: priyankaProfile.summary,
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
    uploadedAt: '2026-08-13T09:00:00Z', stage: 'analyzed', source: 'job_board',
    screeningApproval: 'pending', interviewApproval: 'not_ready',
    extractedProfile: rohitProfile, jdMatch: computeJdMatch(rohitProfile, job('job_1042')),
    overallScore: computeJdMatch(rohitProfile, job('job_1042')).overallScore,
    resumeSummary: rohitProfile.summary,
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
    uploadedAt: '2026-08-14T09:00:00Z', stage: 'processing', source: 'linkedin',
    screeningApproval: 'not_ready', interviewApproval: 'not_ready',
    overallScore: null,
    resumeSummary: 'Resume processing in progress.',
    resumeEvidence: [],
    location: 'Chennai, India', yearsExperience: 5, currentTitle: 'Product Designer, Nimbus Health',
  },
  {
    id: 'cand_6', jobId: 'job_1042', name: 'Farhan Ahmed', email: 'farhan.ahmed@gmail.com',
    uploadedAt: '2026-07-28T09:00:00Z', stage: 'rejected', source: 'careers_site',
    screeningApproval: 'rejected', interviewApproval: 'not_ready',
    extractedProfile: farhanProfile, jdMatch: computeJdMatch(farhanProfile, job('job_1042')),
    overallScore: computeJdMatch(farhanProfile, job('job_1042')).overallScore,
    resumeSummary: farhanProfile.summary,
    resumeEvidence: [
      { criterionId: 'crit_1', criterionLabel: 'Product Thinking', score: 38, evidence: 'Junior-level work, mostly executing specs from senior designers.' },
      { criterionId: 'crit_2', criterionLabel: 'UX Craft & Portfolio Quality', score: 50, evidence: 'Basic portfolio, limited range.' },
    ],
    location: 'Delhi, India', yearsExperience: 1, currentTitle: 'Junior Designer, PixelWorks',
  },
  {
    id: 'cand_16', jobId: 'job_1042', name: 'Neha Kulkarni', email: 'neha.kulkarni@gmail.com', phone: '+91 97788 11223',
    uploadedAt: '2026-08-05T09:00:00Z', stage: 'interview_approved', source: 'referral',
    screeningApproval: 'approved', interviewApproval: 'approved',
    extractedProfile: nehaProfile, jdMatch: computeJdMatch(nehaProfile, job('job_1042')),
    overallScore: computeJdMatch(nehaProfile, job('job_1042')).overallScore,
    resumeSummary: nehaProfile.summary,
    resumeEvidence: [
      { criterionId: 'crit_1', criterionLabel: 'Product Thinking', score: 89, evidence: 'Clear discovery process backed by user research across 3 launches.' },
      { criterionId: 'crit_4', criterionLabel: 'Systems & Design Ops', score: 93, evidence: 'Design system adopted org-wide across 5 product teams.' },
    ],
    location: 'Bengaluru, India', yearsExperience: 6, currentTitle: 'Senior Product Designer, Northstar Labs',
    interviewId: 'int_5',
  },

  // Backend Engineer (job_1043)
  {
    id: 'cand_7', jobId: 'job_1043', name: 'Arjun Verma', email: 'arjun.verma@protonmail.com', phone: '+91 99870 44112',
    uploadedAt: '2026-08-09T09:00:00Z', stage: 'human_review', source: 'referral',
    screeningApproval: 'approved', interviewApproval: 'pending',
    extractedProfile: arjunProfile, jdMatch: computeJdMatch(arjunProfile, job('job_1043')),
    overallScore: computeJdMatch(arjunProfile, job('job_1043')).overallScore,
    resumeSummary: arjunProfile.summary,
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
    uploadedAt: '2026-08-11T09:00:00Z', stage: 'hr_review', source: 'linkedin',
    screeningApproval: 'pending', interviewApproval: 'not_ready',
    extractedProfile: divyaProfile, jdMatch: computeJdMatch(divyaProfile, job('job_1043')),
    overallScore: computeJdMatch(divyaProfile, job('job_1043')).overallScore,
    resumeSummary: divyaProfile.summary,
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
    uploadedAt: '2026-08-12T09:00:00Z', stage: 'analyzed', source: 'job_board',
    screeningApproval: 'pending', interviewApproval: 'not_ready',
    extractedProfile: karanProfile, jdMatch: computeJdMatch(karanProfile, job('job_1043')),
    overallScore: computeJdMatch(karanProfile, job('job_1043')).overallScore,
    resumeSummary: karanProfile.summary,
    resumeEvidence: [
      { criterionId: 'crit_1', criterionLabel: 'Systems Design', score: 50, evidence: 'Limited backend systems design exposure.' },
      { criterionId: 'crit_2', criterionLabel: 'Coding Proficiency', score: 65, evidence: 'Solid JavaScript/Node experience, limited Go/Python.' },
    ],
    location: 'Noida, India', yearsExperience: 2, currentTitle: 'Full Stack Engineer, Loopwise',
  },
  {
    id: 'cand_10', jobId: 'job_1043', name: 'Ishaan Kapoor', email: 'ishaan.kapoor@gmail.com',
    uploadedAt: '2026-08-06T09:00:00Z', stage: 'interview_scheduled', source: 'agency',
    screeningApproval: 'approved', interviewApproval: 'approved',
    extractedProfile: ishaanProfile, jdMatch: computeJdMatch(ishaanProfile, job('job_1043')),
    overallScore: computeJdMatch(ishaanProfile, job('job_1043')).overallScore,
    resumeSummary: ishaanProfile.summary,
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
    uploadedAt: '2026-08-15T09:00:00Z', stage: 'processing', source: 'careers_site',
    screeningApproval: 'not_ready', interviewApproval: 'not_ready',
    overallScore: null,
    resumeSummary: 'Resume processing in progress.',
    resumeEvidence: [],
    location: 'Kolkata, India', yearsExperience: 4, currentTitle: 'Backend Developer, PayNest',
  },
  {
    id: 'cand_15', jobId: 'job_1043', name: 'Sanjay Rao', email: 'sanjay.rao@gmail.com', phone: '+91 98456 77321',
    uploadedAt: '2026-08-16T09:00:00Z', stage: 'screening_approved', source: 'direct_upload',
    screeningApproval: 'approved', interviewApproval: 'not_ready',
    extractedProfile: sanjayProfile, jdMatch: computeJdMatch(sanjayProfile, job('job_1043')),
    overallScore: computeJdMatch(sanjayProfile, job('job_1043')).overallScore,
    resumeSummary: sanjayProfile.summary,
    resumeEvidence: [
      { criterionId: 'crit_1', criterionLabel: 'Systems Design', score: 76, evidence: 'Migrated a monolith to microservices on AWS.' },
      { criterionId: 'crit_2', criterionLabel: 'Coding Proficiency', score: 79, evidence: 'Strong Python fundamentals with production AWS experience.' },
    ],
    location: 'Chennai, India', yearsExperience: 4, currentTitle: 'Backend Engineer, Vertex Systems',
  },
  {
    id: 'cand_17', jobId: 'job_1043', name: 'Deepak Verma', email: 'deepak.verma@gmail.com', phone: '+91 99887 12233',
    uploadedAt: '2026-08-13T09:00:00Z', stage: 'ai_screening', source: 'job_board',
    screeningApproval: 'approved', interviewApproval: 'not_ready',
    needsAttention: true, attentionReason: 'AI screening call failed to connect — retry or reschedule the call.',
    extractedProfile: deepakProfile, jdMatch: computeJdMatch(deepakProfile, job('job_1043')),
    overallScore: computeJdMatch(deepakProfile, job('job_1043')).overallScore,
    resumeSummary: deepakProfile.summary,
    resumeEvidence: [
      { criterionId: 'crit_2', criterionLabel: 'Coding Proficiency', score: 68, evidence: 'Solid Python/Django experience, limited distributed systems exposure.' },
    ],
    location: 'Pune, India', yearsExperience: 3, currentTitle: 'Backend Developer, Loopr Systems',
    interviewId: 'int_6',
  },

  // Customer Success Manager (job_1044)
  {
    id: 'cand_12', jobId: 'job_1044', name: 'Ananya Iyer', email: 'ananya.iyer@gmail.com',
    uploadedAt: '2026-08-10T09:00:00Z', stage: 'completed', source: 'referral',
    screeningApproval: 'approved', interviewApproval: 'approved',
    extractedProfile: ananyaProfile, jdMatch: computeJdMatch(ananyaProfile, job('job_1044')),
    overallScore: computeJdMatch(ananyaProfile, job('job_1044')).overallScore,
    resumeSummary: ananyaProfile.summary,
    resumeEvidence: [],
    location: 'Mumbai, India', yearsExperience: 4, currentTitle: 'Senior CSM, Growthly',
  },
  {
    id: 'cand_13', jobId: 'job_1044', name: 'Naveen Pillai', email: 'naveen.pillai@gmail.com',
    uploadedAt: '2026-08-12T09:00:00Z', stage: 'on_hold', source: 'linkedin',
    screeningApproval: 'on_hold', interviewApproval: 'not_ready',
    needsAttention: true, attentionReason: 'On hold for 5 days — budget approval pending from finance.',
    extractedProfile: naveenProfile, jdMatch: computeJdMatch(naveenProfile, job('job_1044')),
    overallScore: computeJdMatch(naveenProfile, job('job_1044')).overallScore,
    resumeSummary: naveenProfile.summary,
    resumeEvidence: [],
    location: 'Mumbai, India', yearsExperience: 3, currentTitle: 'Account Manager, Bright Retail',
  },
  {
    id: 'cand_14', jobId: 'job_1044', name: 'Tara Joseph', email: 'tara.joseph@gmail.com',
    uploadedAt: '2026-08-14T09:00:00Z', stage: 'uploaded', source: 'job_board',
    screeningApproval: 'not_ready', interviewApproval: 'not_ready',
    overallScore: null,
    resumeSummary: 'Resume uploaded — processing has not started yet.',
    resumeEvidence: [],
    location: 'Mumbai, India', yearsExperience: 2, currentTitle: 'Customer Support Lead, Quickserve',
  },
]

export function getCandidatesByJob(jobId: string) {
  return mockCandidates.filter((c) => c.jobId === jobId)
}
