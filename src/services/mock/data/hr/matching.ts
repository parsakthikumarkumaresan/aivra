import type { ExtractedResumeProfile, Job, JdMatchBreakdown, MatchLabel, SkillMatch } from '@/types'

function parseMinYears(experienceLevel: string): number {
  const match = experienceLevel.match(/(\d+)/)
  return match ? Number(match[1]) : 0
}

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim()
}

function matchLabelFor(score: number): MatchLabel {
  if (score >= 85) return 'Strong Match'
  if (score >= 70) return 'Good Match'
  if (score >= 50) return 'Moderate Match'
  return 'Weak Match'
}

/**
 * Deterministic AI-style JD matching: compares an extracted resume profile against
 * a specific Job's required skills, experience level and title. Same inputs always
 * produce the same output, so newly uploaded resumes score consistently.
 */
export function computeJdMatch(profile: ExtractedResumeProfile, job: Job): JdMatchBreakdown {
  const profileSkills = [...profile.skills, ...profile.technicalSkills].map(normalize)

  const matchedSkills: SkillMatch[] = job.requiredSkills.map((skill) => {
    const normSkill = normalize(skill)
    const hit = profileSkills.some((s) => s.includes(normSkill) || normSkill.includes(s))
    return { skill, matchPercent: hit ? 88 + (skill.length % 9) : 30 + (skill.length % 15) }
  })

  const skillsMatch = matchedSkills.length
    ? Math.round(matchedSkills.reduce((sum, m) => sum + m.matchPercent, 0) / matchedSkills.length)
    : 50

  const minYears = parseMinYears(job.experienceLevel)
  let experienceMatch: number
  if (profile.yearsExperience >= minYears + 2) experienceMatch = 95
  else if (profile.yearsExperience >= minYears) experienceMatch = 85
  else if (profile.yearsExperience >= minYears - 1.5) experienceMatch = 68
  else experienceMatch = 45

  const educationMatch = profile.education.length > 0 ? 88 : 55

  const jobTitleWords = new Set(normalize(job.title).split(/\s+/).filter((w) => w.length > 2))
  const candidateTitleWords = new Set([...profile.jobTitles, profile.currentTitle].flatMap((t) => normalize(t).split(/\s+/)))
  let overlap = 0
  jobTitleWords.forEach((w) => {
    if (candidateTitleWords.has(w)) overlap += 1
  })
  const roleRelevance = jobTitleWords.size ? Math.round(50 + (overlap / jobTitleWords.size) * 50) : 70

  const overallScore = Math.round(skillsMatch * 0.4 + experienceMatch * 0.3 + educationMatch * 0.15 + roleRelevance * 0.15)

  const strongSkills = matchedSkills.filter((m) => m.matchPercent >= 80).map((m) => m.skill)
  const weakSkills = matchedSkills.filter((m) => m.matchPercent < 60).map((m) => m.skill)

  const strengths: string[] = []
  if (profile.yearsExperience >= minYears) strengths.push(`${profile.yearsExperience}+ years of relevant experience`)
  if (strongSkills.length > 0) strengths.push(`Strong evidence of ${strongSkills.slice(0, 3).join(', ')}`)
  if (profile.previousCompanies.length > 0) strengths.push(`Previously at ${profile.previousCompanies[0]}`)
  if (strengths.length === 0) strengths.push('Resume successfully parsed and matched against this role.')

  const gaps: string[] = []
  if (weakSkills.length > 0) gaps.push(`Limited evidence of ${weakSkills.slice(0, 2).join(', ')}`)
  if (profile.yearsExperience < minYears) gaps.push(`${minYears - profile.yearsExperience} year(s) below the typical experience bar for this role`)
  if (gaps.length === 0) gaps.push('No significant gaps identified — recommend proceeding to screening.')

  return {
    overallScore,
    matchLabel: matchLabelFor(overallScore),
    skillsMatch,
    experienceMatch,
    educationMatch,
    roleRelevance,
    matchedSkills,
    strengths,
    gaps,
  }
}
