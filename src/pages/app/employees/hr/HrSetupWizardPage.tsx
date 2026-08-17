import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Briefcase,
  Scale,
  MessagesSquare,
  Mic,
  CalendarClock,
  ShieldCheck,
} from 'lucide-react'
import { useSetBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { useToast } from '@/hooks/useToast'
import { PageHeader } from '@/components/ui/PageHeader'
import { Stepper } from '@/components/ui/Stepper'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Label, HelpText, Select, Textarea, Switch } from '@/components/ui/Field'
import { SaveStatus } from '@/components/ui/SaveStatus'
import type { SaveState } from '@/components/ui/SaveStatus'
import { Badge } from '@/components/ui/Badge'
import type { EmploymentType, EvaluationCriterion } from '@/types'
import { defaultRubricTemplate } from '@/services/mock/data/hr/rubric'
import { nextId } from '@/services/mock/utils'

const STEPS = [
  { id: 'profile', label: 'HR Profile', description: 'Company & hiring team' },
  { id: 'job', label: 'Create Job', description: 'Title, location & JD' },
  { id: 'rubric', label: 'Evaluation Rubric', description: 'Scoring criteria' },
  { id: 'screening', label: 'Screening', description: 'Intake questions' },
  { id: 'interview', label: 'AI Interview', description: 'Structure & duration' },
  { id: 'scheduling', label: 'Scheduling', description: 'Calendar & availability' },
  { id: 'review', label: 'Review & Activate', description: 'Confirm and go live' },
]

interface WizardData {
  profile: { companyName: string; timezone: string; hiringTeam: string }
  job: { title: string; department: string; location: string; employmentType: EmploymentType; experienceLevel: string; description: string }
  rubric: EvaluationCriterion[]
  screening: { questions: string[]; voiceScreeningEnabled: boolean }
  interview: { template: string; durationMinutes: number; language: string; intro: string; categories: string[] }
  scheduling: { calendarProvider: string; workingHours: string; bufferMinutes: number; meetingDuration: number }
}

const initialData: WizardData = {
  profile: { companyName: 'Acme Corporation', timezone: 'Asia/Kolkata', hiringTeam: 'priya@acmecorp.com, rohan@acmecorp.com' },
  job: { title: '', department: '', location: '', employmentType: 'full_time', experienceLevel: '', description: '' },
  rubric: defaultRubricTemplate.map((c) => ({ ...c, id: nextId('crit') })),
  screening: { questions: ['Are you legally authorized to work in this location?', 'What is your notice period?'], voiceScreeningEnabled: false },
  interview: { template: 'Structured Interview v3', durationMinutes: 30, language: 'English (India)', intro: '', categories: ['Role Expertise', 'Problem Solving', 'Collaboration'] },
  scheduling: { calendarProvider: 'google_calendar', workingHours: '9:00 AM – 6:00 PM', bufferMinutes: 15, meetingDuration: 45 },
}

export default function HrSetupWizardPage() {
  useSetBreadcrumbs([{ label: 'AI Employees', href: '/app/employees' }, { label: 'AI HR Employee', href: '/app/employees/hr' }, { label: 'Setup' }])
  const navigate = useNavigate()
  const { show } = useToast()
  const [stepIndex, setStepIndex] = useState(0)
  const [completed, setCompleted] = useState<number[]>([])
  const [data, setData] = useState<WizardData>(initialData)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [activating, setActivating] = useState(false)

  useEffect(() => {
    setSaveState('saving')
    const t = window.setTimeout(() => setSaveState('saved'), 650)
    return () => window.clearTimeout(t)
  }, [data])

  const errors = useMemo(() => validateStep(stepIndex, data), [stepIndex, data])
  const allErrors = useMemo(() => STEPS.map((_, i) => validateStep(i, data)).flat(), [data])

  function goNext() {
    if (errors.length > 0) return
    setCompleted((prev) => Array.from(new Set([...prev, stepIndex])))
    setStepIndex((i) => Math.min(STEPS.length - 1, i + 1))
  }
  function goBack() {
    setStepIndex((i) => Math.max(0, i - 1))
  }
  function goToStep(i: number) {
    setStepIndex(i)
  }

  async function activate() {
    if (allErrors.length > 0) {
      setStepIndex(0)
      return
    }
    setActivating(true)
    await new Promise((r) => setTimeout(r, 1000))
    setActivating(false)
    show({ tone: 'success', title: 'AI HR Employee activated', description: `${data.job.title || 'Your job'} is now live and accepting candidates.` })
    navigate('/app/employees/hr')
  }

  return (
    <div className="space-y-5">
      <Link to="/app/employees/hr" className="flex items-center gap-1.5 text-[13px] font-medium text-ink-500 hover:text-ink-800">
        <ArrowLeft className="size-3.5" />
        Back to AI HR Employee
      </Link>

      <PageHeader title="HR Employee Setup" description="Configure your AI HR Employee before activating it for candidates." actions={<SaveStatus state={saveState} />} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[260px_1fr]">
        <Card className="h-fit lg:sticky lg:top-6">
          <CardBody className="p-2">
            <Stepper steps={STEPS} currentIndex={stepIndex} completedIndexes={completed} onStepClick={goToStep} />
          </CardBody>
        </Card>

        <Card>
          <CardBody className="space-y-5">
            {stepIndex === 0 && <ProfileStep data={data} setData={setData} />}
            {stepIndex === 1 && <JobStep data={data} setData={setData} />}
            {stepIndex === 2 && <RubricStep data={data} setData={setData} />}
            {stepIndex === 3 && <ScreeningStep data={data} setData={setData} />}
            {stepIndex === 4 && <InterviewStep data={data} setData={setData} />}
            {stepIndex === 5 && <SchedulingStep data={data} setData={setData} />}
            {stepIndex === 6 && <ReviewStep data={data} errors={allErrors} onEditStep={goToStep} />}

            {errors.length > 0 && (
              <div className="space-y-1.5 rounded-lg border border-warning-100 bg-warning-50 p-3">
                {errors.map((e) => (
                  <p key={e} className="flex items-center gap-2 text-[12.5px] text-warning-700">
                    <AlertTriangle className="size-3.5 shrink-0" />
                    {e}
                  </p>
                ))}
              </div>
            )}
          </CardBody>
          <div className="flex items-center justify-between border-t border-ink-100 px-5 py-4">
            <Button variant="outline" onClick={goBack} disabled={stepIndex === 0}>
              Back
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => show({ tone: 'info', title: 'Draft saved', description: 'You can resume this setup anytime.' })}>
                Save Draft
              </Button>
              {stepIndex < STEPS.length - 1 ? (
                <Button onClick={goNext} iconRight={<ArrowRight className="size-4" />}>
                  Next
                </Button>
              ) : (
                <Button onClick={activate} loading={activating} icon={<Sparkles className="size-4" />} disabled={allErrors.length > 0}>
                  Activate AI HR Employee
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

function validateStep(index: number, data: WizardData): string[] {
  const errors: string[] = []
  if (index === 0 && !data.profile.companyName.trim()) errors.push('Company name is required.')
  if (index === 1) {
    if (!data.job.title.trim()) errors.push('Job title is required.')
    if (!data.job.department.trim()) errors.push('Department is required.')
  }
  if (index === 2) {
    const total = data.rubric.reduce((sum, c) => sum + c.weight, 0)
    if (total !== 100) errors.push(`Criteria weights must total 100% (currently ${total}%).`)
    if (data.rubric.length === 0) errors.push('Add at least one evaluation criterion.')
  }
  if (index === 3 && data.screening.questions.filter((q) => q.trim()).length === 0) errors.push('Add at least one screening question.')
  if (index === 4 && data.interview.durationMinutes <= 0) errors.push('Interview duration must be greater than 0 minutes.')
  if (index === 5 && data.scheduling.meetingDuration <= 0) errors.push('Meeting duration must be greater than 0 minutes.')
  return errors
}

interface StepProps {
  data: WizardData
  setData: React.Dispatch<React.SetStateAction<WizardData>>
}

function ProfileStep({ data, setData }: StepProps) {
  return (
    <div className="space-y-4">
      <StepHeading icon={<Building2 className="size-4" />} title="HR Profile" description="Tell AIVRA about your company and hiring team." />
      <div>
        <Label required>Company name</Label>
        <Input value={data.profile.companyName} onChange={(e) => setData({ ...data, profile: { ...data.profile, companyName: e.target.value } })} />
      </div>
      <div>
        <Label>Timezone</Label>
        <Select value={data.profile.timezone} onChange={(e) => setData({ ...data, profile: { ...data.profile, timezone: e.target.value } })}>
          <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
          <option value="America/New_York">America/New_York (ET)</option>
          <option value="Europe/London">Europe/London (GMT)</option>
        </Select>
      </div>
      <div>
        <Label>Hiring team emails</Label>
        <Textarea value={data.profile.hiringTeam} onChange={(e) => setData({ ...data, profile: { ...data.profile, hiringTeam: e.target.value } })} />
        <HelpText>Comma-separated. These people will receive approval and scheduling notifications.</HelpText>
      </div>
    </div>
  )
}

function JobStep({ data, setData }: StepProps) {
  const job = data.job
  const set = (patch: Partial<WizardData['job']>) => setData({ ...data, job: { ...job, ...patch } })
  return (
    <div className="space-y-4">
      <StepHeading icon={<Briefcase className="size-4" />} title="Create Job" description="AIVRA will generate a draft rubric from this job description." />
      <div>
        <Label required>Job title</Label>
        <Input value={job.title} onChange={(e) => set({ title: e.target.value })} placeholder="e.g. Senior Product Designer" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label required>Department</Label>
          <Input value={job.department} onChange={(e) => set({ department: e.target.value })} placeholder="Design" />
        </div>
        <div>
          <Label>Location</Label>
          <Input value={job.location} onChange={(e) => set({ location: e.target.value })} placeholder="Bengaluru, India" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label>Employment type</Label>
          <Select value={job.employmentType} onChange={(e) => set({ employmentType: e.target.value as EmploymentType })}>
            <option value="full_time">Full-time</option>
            <option value="part_time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="internship">Internship</option>
          </Select>
        </div>
        <div>
          <Label>Experience level</Label>
          <Input value={job.experienceLevel} onChange={(e) => set({ experienceLevel: e.target.value })} placeholder="3-6 years" />
        </div>
      </div>
      <div>
        <Label>Job description</Label>
        <Textarea value={job.description} onChange={(e) => set({ description: e.target.value })} className="min-h-32" placeholder="Paste or write the job description…" />
      </div>
    </div>
  )
}

function RubricStep({ data, setData }: StepProps) {
  const total = data.rubric.reduce((sum, c) => sum + c.weight, 0)
  function update(id: string, patch: Partial<EvaluationCriterion>) {
    setData({ ...data, rubric: data.rubric.map((c) => (c.id === id ? { ...c, ...patch } : c)) })
  }
  function remove(id: string) {
    setData({ ...data, rubric: data.rubric.filter((c) => c.id !== id) })
  }
  function add() {
    setData({ ...data, rubric: [...data.rubric, { id: nextId('crit'), label: 'New Criterion', description: '', weight: 0, evidenceHint: '' }] })
  }

  return (
    <div className="space-y-4">
      <StepHeading icon={<Scale className="size-4" />} title="Evaluation Rubric" description="AI-generated criteria — review and edit before candidates are scored against them." />
      <div className="flex items-center gap-2 rounded-lg bg-brand-50 px-3.5 py-2.5 text-[13px] text-brand-700">
        <Sparkles className="size-3.5 shrink-0" />
        Generated from the job description. Adjust weights and evidence hints to match how your team evaluates candidates.
      </div>
      <div className="space-y-3">
        {data.rubric.map((c) => (
          <div key={c.id} className="rounded-xl border border-ink-200 p-4">
            <div className="flex items-start gap-3">
              <div className="flex-1 space-y-2.5">
                <Input value={c.label} onChange={(e) => update(c.id, { label: e.target.value })} placeholder="Criterion name" />
                <Textarea value={c.evidenceHint} onChange={(e) => update(c.id, { evidenceHint: e.target.value })} className="min-h-16" placeholder="What evidence should the AI look for?" />
              </div>
              <div className="w-24 shrink-0">
                <Label>Weight %</Label>
                <Input type="number" value={c.weight} onChange={(e) => update(c.id, { weight: Number(e.target.value) })} />
              </div>
              <button onClick={() => remove(c.id)} className="mt-6 text-ink-400 hover:text-danger-600" aria-label="Remove criterion">
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" icon={<Plus className="size-3.5" />} onClick={add}>
          Add criterion
        </Button>
        <span className={`text-[13px] font-semibold ${total === 100 ? 'text-success-600' : 'text-warning-600'}`}>Total weight: {total}%</span>
      </div>
    </div>
  )
}

function ScreeningStep({ data, setData }: StepProps) {
  const screening = data.screening
  function updateQuestion(i: number, value: string) {
    const questions = [...screening.questions]
    questions[i] = value
    setData({ ...data, screening: { ...screening, questions } })
  }
  function removeQuestion(i: number) {
    setData({ ...data, screening: { ...screening, questions: screening.questions.filter((_, idx) => idx !== i) } })
  }
  function addQuestion() {
    setData({ ...data, screening: { ...screening, questions: [...screening.questions, ''] } })
  }

  return (
    <div className="space-y-4">
      <StepHeading icon={<MessagesSquare className="size-4" />} title="Screening" description="Initial questions candidates answer before AI resume screening." />
      <div className="space-y-2.5">
        {screening.questions.map((q, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input value={q} onChange={(e) => updateQuestion(i, e.target.value)} placeholder={`Screening question ${i + 1}`} />
            <button onClick={() => removeQuestion(i)} className="shrink-0 text-ink-400 hover:text-danger-600" aria-label="Remove question">
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
      </div>
      <Button variant="outline" size="sm" icon={<Plus className="size-3.5" />} onClick={addQuestion}>
        Add question
      </Button>
      <div className="flex items-center justify-between rounded-lg border border-ink-200 p-3.5">
        <div>
          <p className="text-[13px] font-medium text-ink-800">Enable voice screening</p>
          <p className="text-xs text-ink-500">Candidates can complete initial screening by phone via the AI Voice Employee.</p>
        </div>
        <Switch checked={screening.voiceScreeningEnabled} onChange={(v) => setData({ ...data, screening: { ...screening, voiceScreeningEnabled: v } })} />
      </div>
    </div>
  )
}

function InterviewStep({ data, setData }: StepProps) {
  const interview = data.interview
  const set = (patch: Partial<WizardData['interview']>) => setData({ ...data, interview: { ...interview, ...patch } })
  return (
    <div className="space-y-4">
      <StepHeading icon={<Mic className="size-4" />} title="AI Interview" description="Configure how the structured AI interview is conducted." />
      <div>
        <Label>Interview template</Label>
        <Input value={interview.template} onChange={(e) => set({ template: e.target.value })} />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label>Duration (minutes)</Label>
          <Input type="number" value={interview.durationMinutes} onChange={(e) => set({ durationMinutes: Number(e.target.value) })} />
        </div>
        <div>
          <Label>Language</Label>
          <Select value={interview.language} onChange={(e) => set({ language: e.target.value })}>
            <option>English (India)</option>
            <option>English (US)</option>
            <option>Hindi</option>
          </Select>
        </div>
      </div>
      <div>
        <Label>Question categories</Label>
        <div className="flex flex-wrap gap-1.5">
          {interview.categories.map((c) => (
            <Badge key={c} tone="brand">{c}</Badge>
          ))}
        </div>
      </div>
      <div>
        <Label>Interview intro (optional)</Label>
        <Textarea value={interview.intro} onChange={(e) => set({ intro: e.target.value })} placeholder="Custom greeting the AI interviewer will use to open the interview…" />
      </div>
    </div>
  )
}

function SchedulingStep({ data, setData }: StepProps) {
  const scheduling = data.scheduling
  const set = (patch: Partial<WizardData['scheduling']>) => setData({ ...data, scheduling: { ...scheduling, ...patch } })
  return (
    <div className="space-y-4">
      <StepHeading icon={<CalendarClock className="size-4" />} title="Scheduling" description="Configure calendar and interviewer availability for human interviews." />
      <div>
        <Label>Calendar provider</Label>
        <Select value={scheduling.calendarProvider} onChange={(e) => set({ calendarProvider: e.target.value })}>
          <option value="google_calendar">Google Calendar</option>
          <option value="outlook">Outlook Calendar</option>
        </Select>
      </div>
      <div>
        <Label>Interviewer working hours</Label>
        <Input value={scheduling.workingHours} onChange={(e) => set({ workingHours: e.target.value })} />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label>Buffer between interviews (minutes)</Label>
          <Input type="number" value={scheduling.bufferMinutes} onChange={(e) => set({ bufferMinutes: Number(e.target.value) })} />
        </div>
        <div>
          <Label>Meeting duration (minutes)</Label>
          <Input type="number" value={scheduling.meetingDuration} onChange={(e) => set({ meetingDuration: Number(e.target.value) })} />
        </div>
      </div>
    </div>
  )
}

function ReviewStep({ data, errors, onEditStep }: { data: WizardData; errors: string[]; onEditStep: (i: number) => void }) {
  const total = data.rubric.reduce((sum, c) => sum + c.weight, 0)
  return (
    <div className="space-y-4">
      <StepHeading icon={<ShieldCheck className="size-4" />} title="Review & Activate" description="Confirm your configuration before the AI HR Employee goes live." />

      {errors.length > 0 ? (
        <div className="space-y-1.5 rounded-lg border border-danger-100 bg-danger-50 p-3.5">
          <p className="text-[13px] font-semibold text-danger-700">Fix these before activating:</p>
          {errors.map((e) => (
            <p key={e} className="flex items-center gap-2 text-[12.5px] text-danger-700">
              <AlertTriangle className="size-3.5 shrink-0" />
              {e}
            </p>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-lg border border-success-100 bg-success-50 px-3.5 py-2.5 text-[13px] text-success-700">
          <CheckCircle2 className="size-3.5 shrink-0" />
          Everything looks good — ready to activate.
        </div>
      )}

      <ReviewRow label="Company" value={data.profile.companyName} onEdit={() => onEditStep(0)} />
      <ReviewRow label="Job" value={data.job.title ? `${data.job.title} · ${data.job.department}` : 'Not set'} onEdit={() => onEditStep(1)} />
      <ReviewRow label="Rubric" value={`${data.rubric.length} criteria · ${total}% total weight`} onEdit={() => onEditStep(2)} />
      <ReviewRow label="Screening" value={`${data.screening.questions.filter((q) => q.trim()).length} questions${data.screening.voiceScreeningEnabled ? ' · Voice enabled' : ''}`} onEdit={() => onEditStep(3)} />
      <ReviewRow label="AI Interview" value={`${data.interview.template} · ${data.interview.durationMinutes} min`} onEdit={() => onEditStep(4)} />
      <ReviewRow label="Scheduling" value={`${data.scheduling.calendarProvider === 'google_calendar' ? 'Google Calendar' : 'Outlook'} · ${data.scheduling.meetingDuration} min meetings`} onEdit={() => onEditStep(5)} />

      <div className="flex items-start gap-2.5 rounded-lg bg-ink-25 p-3.5 text-[12.5px] text-ink-600">
        <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-ink-400" />
        AI provides job-related evidence and recommendations. Final employment decisions remain with authorized humans.
      </div>
    </div>
  )
}

function ReviewRow({ label, value, onEdit }: { label: string; value: string; onEdit: () => void }) {
  return (
    <div className="flex items-center justify-between border-b border-ink-100 py-2.5 last:border-0">
      <div>
        <p className="text-xs text-ink-500">{label}</p>
        <p className="text-[13px] font-medium text-ink-900">{value}</p>
      </div>
      <button onClick={onEdit} className="text-[12.5px] font-medium text-brand-600 hover:text-brand-700">
        Edit
      </button>
    </div>
  )
}

function StepHeading({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">{icon}</span>
      <div>
        <h2 className="text-[15px] font-semibold text-ink-900">{title}</h2>
        <p className="text-[13px] text-ink-500">{description}</p>
      </div>
    </div>
  )
}
