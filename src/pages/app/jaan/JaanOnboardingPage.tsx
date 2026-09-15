import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bot, Languages, Mic2, BookOpen, Wrench, PhoneCall, FlaskConical, Rocket, Sparkles, ArrowRight } from 'lucide-react'
import { useSetBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { StepperHorizontal } from '@/components/ui/Stepper'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

const STEPS = [
  { id: 'agent', label: 'Create Agent', icon: Bot, description: 'Give your first Jaan agent a name and pick what it does — receptionist, sales, appointments or support.' },
  { id: 'voice', label: 'Choose Voice', icon: Mic2, description: 'Pick a provider and voice that matches your brand — preview it before you commit.' },
  { id: 'language', label: 'Configure Language', icon: Languages, description: 'Choose the languages Jaan should understand, and whether it should switch languages mid-call.' },
  { id: 'knowledge', label: 'Add Knowledge', icon: BookOpen, description: 'Upload documents or connect a source so Jaan can answer business-specific questions.' },
  { id: 'tools', label: 'Add Tools', icon: Wrench, description: 'Give Jaan the ability to take action — book appointments, look up orders, update your CRM.' },
  { id: 'number', label: 'Connect Phone Number', icon: PhoneCall, description: 'Assign a phone number so customers can actually reach Jaan.' },
  { id: 'test', label: 'Test Agent', icon: FlaskConical, description: 'Run a simulated call to make sure Jaan responds the way you expect.' },
  { id: 'publish', label: 'Publish', icon: Rocket, description: 'Go live — Jaan starts handling real calls.' },
]

export default function JaanOnboardingPage() {
  useSetBreadcrumbs([{ label: 'Jaan', href: '/app/jaan' }, { label: 'Onboarding' }])
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [completed, setCompleted] = useState<number[]>([])

  const current = STEPS[step]
  const Icon = current.icon
  const isLast = step === STEPS.length - 1

  function next() {
    setCompleted((prev) => (prev.includes(step) ? prev : [...prev, step]))
    if (isLast) {
      navigate('/app/jaan/agents')
      return
    }
    setStep((s) => s + 1)
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 p-6 py-10">
      <div className="text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
          <Sparkles className="size-6" />
        </span>
        <h1 className="mt-4 text-[26px] font-bold tracking-tight text-ink-900">Welcome to Jaan</h1>
        <p className="mt-1.5 text-[14.5px] text-ink-500">Your Voice AI Employee is ready. Let's get your first agent live in 8 steps.</p>
      </div>

      <StepperHorizontal steps={STEPS.map((s) => ({ id: s.id, label: s.label }))} currentIndex={step} completedIndexes={completed} />

      <Card>
        <CardBody className="flex flex-col items-center gap-4 py-10 text-center">
          <span className="flex size-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <Icon className="size-6" />
          </span>
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-wide text-brand-600">Step {step + 1} of {STEPS.length}</p>
            <h2 className="mt-1 text-[19px] font-bold text-ink-900">{current.label}</h2>
            <p className="mx-auto mt-1.5 max-w-md text-[13.5px] leading-relaxed text-ink-500">{current.description}</p>
          </div>
          <div className="mt-2 flex items-center gap-3">
            {step > 0 && <Button variant="outline" onClick={() => setStep((s) => s - 1)}>Back</Button>}
            <Button iconRight={<ArrowRight className="size-4" />} onClick={next}>{isLast ? 'Go to Agents' : 'Continue'}</Button>
          </div>
        </CardBody>
      </Card>

      <div className="text-center">
        <button onClick={() => navigate('/app/jaan/agents')} className="text-[12.5px] font-medium text-ink-400 hover:text-ink-600">
          Skip onboarding
        </button>
      </div>
    </div>
  )
}
