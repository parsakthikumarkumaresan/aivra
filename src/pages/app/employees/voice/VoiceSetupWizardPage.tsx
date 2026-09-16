import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  Building2,
  Mic2,
  BookOpen,
  ListChecks,
  Wrench,
  ShieldAlert,
  Phone,
  FlaskConical,
  CheckCircle2,
} from 'lucide-react'
import { useSetBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { useToast } from '@/hooks/useToast'
import { PageHeader } from '@/components/ui/PageHeader'
import { Stepper } from '@/components/ui/Stepper'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Label, HelpText, Select, Textarea, Switch, Checkbox } from '@/components/ui/Field'
import { SaveStatus } from '@/components/ui/SaveStatus'
import type { SaveState } from '@/components/ui/SaveStatus'
import { Badge } from '@/components/ui/Badge'
import { ToolConfigCard } from '@/components/employees/voice/ToolConfigCard'
import { mockVoiceConfig } from '@/services/mock/data/voice/config'
import { mockKnowledgeSources } from '@/services/mock/data/knowledge'
import { VOICE_CAPABILITY_LABEL } from '@/types'
import type { VoiceCapability, VoiceEmployeeConfig } from '@/types'

const STEPS = [
  { id: 'profile', label: 'Business Profile', description: 'Who you are' },
  { id: 'voice', label: 'Voice Identity', description: 'How it sounds' },
  { id: 'knowledge', label: 'Knowledge', description: 'What it knows' },
  { id: 'capabilities', label: 'Capabilities', description: 'What it can do' },
  { id: 'tools', label: 'Tools', description: 'Business systems' },
  { id: 'escalation', label: 'Escalation', description: 'When to hand off' },
  { id: 'phone', label: 'Phone', description: 'Number & routing' },
  { id: 'test', label: 'Test & Activate', description: 'Confirm and go live' },
]

export default function VoiceSetupWizardPage() {
  useSetBreadcrumbs([{ label: 'AI Employees', href: '/app/employees' }, { label: 'Jaan', href: '/app/employees/voice' }, { label: 'Advanced Setup (Internal)' }])
  const navigate = useNavigate()
  const { show } = useToast()
  const [stepIndex, setStepIndex] = useState(0)
  const [completed, setCompleted] = useState<number[]>([])
  const [data, setData] = useState<VoiceEmployeeConfig>(() => structuredClone(mockVoiceConfig))
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

  async function activate() {
    if (allErrors.length > 0) {
      setStepIndex(0)
      return
    }
    setActivating(true)
    await new Promise((r) => setTimeout(r, 1000))
    setActivating(false)
    show({ tone: 'success', title: 'Jaan activated', description: `${data.businessName} is now live and taking calls.` })
    navigate('/app/employees/voice')
  }

  return (
    <div className="space-y-5">
      <Link to="/app/employees/voice" className="flex items-center gap-1.5 text-[13px] font-medium text-ink-500 hover:text-ink-800">
        <ArrowLeft className="size-3.5" />
        Back to Jaan
      </Link>

      <div className="flex items-center gap-2 rounded-lg border border-warning-100 bg-warning-50 px-3.5 py-2.5 text-[12.5px] font-medium text-warning-700">
        <ShieldAlert className="size-3.5 shrink-0" />
        JEXA.AI Internal Configuration — internal JEXA.AI team only. Not visible to customers.
      </div>

      <PageHeader title="Voice Employee Setup" description="Configuration-driven — the same Voice Employee UI adapts to any industry." actions={<SaveStatus state={saveState} />} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[260px_1fr]">
        <Card className="h-fit lg:sticky lg:top-6">
          <CardBody className="p-2">
            <Stepper steps={STEPS} currentIndex={stepIndex} completedIndexes={completed} onStepClick={setStepIndex} />
          </CardBody>
        </Card>

        <Card>
          <CardBody className="space-y-5">
            {stepIndex === 0 && <ProfileStep data={data} setData={setData} />}
            {stepIndex === 1 && <VoiceStep data={data} setData={setData} />}
            {stepIndex === 2 && <KnowledgeStep data={data} setData={setData} />}
            {stepIndex === 3 && <CapabilitiesStep data={data} setData={setData} />}
            {stepIndex === 4 && <ToolsStep data={data} setData={setData} />}
            {stepIndex === 5 && <EscalationStep data={data} setData={setData} />}
            {stepIndex === 6 && <PhoneStep data={data} setData={setData} />}
            {stepIndex === 7 && <TestStep data={data} errors={allErrors} onEditStep={setStepIndex} />}

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
                  Activate Jaan
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

function validateStep(index: number, data: VoiceEmployeeConfig): string[] {
  const errors: string[] = []
  if (index === 0) {
    if (!data.businessName.trim()) errors.push('Business name is required.')
    if (!data.industry.trim()) errors.push('Industry is required.')
  }
  if (index === 1 && !data.greeting.trim()) errors.push('A greeting is required so callers know they reached the right place.')
  if (index === 3 && data.capabilities.length === 0) errors.push('Select at least one capability.')
  if (index === 6 && !data.phoneNumber.trim()) errors.push('A phone number is required before activation.')
  return errors
}

interface StepProps {
  data: VoiceEmployeeConfig
  setData: React.Dispatch<React.SetStateAction<VoiceEmployeeConfig>>
}

function ProfileStep({ data, setData }: StepProps) {
  const set = (patch: Partial<VoiceEmployeeConfig>) => setData({ ...data, ...patch })
  return (
    <div className="space-y-4">
      <StepHeading icon={<Building2 className="size-4" />} title="Business Profile" description="Tell JEXA.AI about the business this employee represents." />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label required>Business name</Label>
          <Input value={data.businessName} onChange={(e) => set({ businessName: e.target.value })} />
        </div>
        <div>
          <Label required>Industry</Label>
          <Select value={data.industry} onChange={(e) => set({ industry: e.target.value })}>
            <option>Jewellery & Retail</option>
            <option>Hotels & Hospitality</option>
            <option>Restaurants</option>
            <option>Real Estate</option>
            <option>Automobile</option>
            <option>Education</option>
            <option>Healthcare</option>
            <option>Other Services</option>
          </Select>
        </div>
      </div>
      <div>
        <Label>Description</Label>
        <Textarea value={data.description} onChange={(e) => set({ description: e.target.value })} />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label>Timezone</Label>
          <Select value={data.timezone} onChange={(e) => set({ timezone: e.target.value })}>
            <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
            <option value="America/New_York">America/New_York (ET)</option>
          </Select>
        </div>
        <div>
          <Label>Working hours</Label>
          <Input value={data.workingHours} onChange={(e) => set({ workingHours: e.target.value })} />
        </div>
      </div>
    </div>
  )
}

function VoiceStep({ data, setData }: StepProps) {
  const set = (patch: Partial<VoiceEmployeeConfig>) => setData({ ...data, ...patch })
  return (
    <div className="space-y-4">
      <StepHeading icon={<Mic2 className="size-4" />} title="Voice Identity" description="Configure how Jaan sounds and speaks." />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label>Language</Label>
          <Input value={data.language} onChange={(e) => set({ language: e.target.value })} />
        </div>
        <div>
          <Label>Voice</Label>
          <Input value={data.voice} onChange={(e) => set({ voice: e.target.value })} />
        </div>
      </div>
      <div>
        <Label>Tone</Label>
        <Input value={data.tone} onChange={(e) => set({ tone: e.target.value })} />
      </div>
      <div>
        <Label required>Greeting</Label>
        <Textarea value={data.greeting} onChange={(e) => set({ greeting: e.target.value })} />
      </div>
      <div>
        <Label>Fallback message</Label>
        <Textarea value={data.fallbackMessage} onChange={(e) => set({ fallbackMessage: e.target.value })} />
        <HelpText>Used when the AI is not confident it understood the caller.</HelpText>
      </div>
    </div>
  )
}

function KnowledgeStep({ data, setData }: StepProps) {
  function toggle(id: string) {
    const set = new Set(data.knowledgeSourceIds)
    if (set.has(id)) set.delete(id)
    else set.add(id)
    setData({ ...data, knowledgeSourceIds: Array.from(set) })
  }
  return (
    <div className="space-y-4">
      <StepHeading icon={<BookOpen className="size-4" />} title="Knowledge" description="Choose which Company Brain sources this employee can access." />
      <div className="space-y-2">
        {mockKnowledgeSources.map((source) => (
          <label key={source.id} className="flex items-center justify-between rounded-lg border border-ink-200 p-3">
            <div className="flex items-center gap-2.5">
              <Checkbox checked={data.knowledgeSourceIds.includes(source.id)} onChange={() => toggle(source.id)} />
              <div>
                <p className="text-[13px] font-medium text-ink-800">{source.name}</p>
                <p className="text-xs text-ink-500">{source.documentCount} documents · {source.freshnessLabel}</p>
              </div>
            </div>
            <Badge tone={source.status === 'synced' ? 'success' : source.status === 'failed' ? 'danger' : 'warning'} dot>
              {source.status}
            </Badge>
          </label>
        ))}
      </div>
    </div>
  )
}

function CapabilitiesStep({ data, setData }: StepProps) {
  function toggle(cap: VoiceCapability) {
    const set = new Set(data.capabilities)
    if (set.has(cap)) set.delete(cap)
    else set.add(cap)
    setData({ ...data, capabilities: Array.from(set) })
  }
  return (
    <div className="space-y-4">
      <StepHeading icon={<ListChecks className="size-4" />} title="Capabilities" description="Choose which conversation types this employee should handle." />
      <div className="grid grid-cols-2 gap-2.5">
        {(Object.keys(VOICE_CAPABILITY_LABEL) as VoiceCapability[]).map((cap) => (
          <label key={cap} className="flex items-center gap-2.5 rounded-lg border border-ink-200 p-3">
            <Checkbox checked={data.capabilities.includes(cap)} onChange={() => toggle(cap)} />
            <span className="text-[13px] font-medium text-ink-800">{VOICE_CAPABILITY_LABEL[cap]}</span>
          </label>
        ))}
      </div>
    </div>
  )
}

function ToolsStep({ data, setData }: StepProps) {
  function toggleConnected(id: string, connected: boolean) {
    setData({ ...data, tools: data.tools.map((t) => (t.id === id ? { ...t, connected } : t)) })
  }
  return (
    <div className="space-y-4">
      <StepHeading icon={<Wrench className="size-4" />} title="Tools" description="Business systems this employee can call during a conversation." />
      <div className="space-y-3">
        {data.tools.map((tool) => (
          <ToolConfigCard key={tool.id} tool={tool} onToggleConnected={(v) => toggleConnected(tool.id, v)} />
        ))}
      </div>
    </div>
  )
}

function EscalationStep({ data, setData }: StepProps) {
  function toggle(trigger: string, enabled: boolean) {
    setData({ ...data, escalationRules: data.escalationRules.map((r) => (r.trigger === trigger ? { ...r, enabled } : r)) })
  }
  return (
    <div className="space-y-4">
      <StepHeading icon={<ShieldAlert className="size-4" />} title="Escalation" description="Configure when this employee should hand off to a human." />
      <div className="space-y-2.5">
        {data.escalationRules.map((rule) => (
          <div key={rule.trigger} className="flex items-center justify-between rounded-lg border border-ink-200 p-3.5">
            <div>
              <p className="text-[13px] font-medium text-ink-800">{rule.label}</p>
              <p className="text-xs text-ink-500">{rule.description}</p>
            </div>
            <Switch checked={rule.enabled} onChange={(v) => toggle(rule.trigger, v)} />
          </div>
        ))}
      </div>
    </div>
  )
}

function PhoneStep({ data, setData }: StepProps) {
  const set = (patch: Partial<VoiceEmployeeConfig>) => setData({ ...data, ...patch })
  return (
    <div className="space-y-4">
      <StepHeading icon={<Phone className="size-4" />} title="Phone" description="Configure the phone number and call routing." />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label>Provider</Label>
          <Select value={data.phoneProvider} onChange={(e) => set({ phoneProvider: e.target.value })}>
            <option>Twilio</option>
            <option>Vonage</option>
            <option>Exotel</option>
          </Select>
        </div>
        <div>
          <Label required>Phone number</Label>
          <Input value={data.phoneNumber} onChange={(e) => set({ phoneNumber: e.target.value })} />
        </div>
      </div>
      <div className="flex items-center justify-between rounded-lg border border-ink-200 p-3.5">
        <span className="text-[13px] font-medium text-ink-800">Inbound calls</span>
        <Switch checked={data.inboundEnabled} onChange={(v) => set({ inboundEnabled: v })} />
      </div>
      <div className="flex items-center justify-between rounded-lg border border-ink-200 p-3.5">
        <span className="text-[13px] font-medium text-ink-800">Outbound calls</span>
        <Switch checked={data.outboundEnabled} onChange={(v) => set({ outboundEnabled: v })} />
      </div>
    </div>
  )
}

function TestStep({ data, errors, onEditStep }: { data: VoiceEmployeeConfig; errors: string[]; onEditStep: (i: number) => void }) {
  return (
    <div className="space-y-4">
      <StepHeading icon={<FlaskConical className="size-4" />} title="Test & Activate" description="Run a simulated call before going live." />
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

      <Link to="/app/employees/voice/simulator">
        <Button variant="outline" icon={<FlaskConical className="size-4" />}>
          Open Voice Simulator
        </Button>
      </Link>

      <ReviewRow label="Business" value={`${data.businessName} · ${data.industry}`} onEdit={() => onEditStep(0)} />
      <ReviewRow label="Voice" value={`${data.voice} · ${data.tone}`} onEdit={() => onEditStep(1)} />
      <ReviewRow label="Knowledge" value={`${data.knowledgeSourceIds.length} sources connected`} onEdit={() => onEditStep(2)} />
      <ReviewRow label="Capabilities" value={`${data.capabilities.length} enabled`} onEdit={() => onEditStep(3)} />
      <ReviewRow label="Tools" value={`${data.tools.filter((t) => t.connected).length} of ${data.tools.length} connected`} onEdit={() => onEditStep(4)} />
      <ReviewRow label="Phone" value={data.phoneNumber || 'Not set'} onEdit={() => onEditStep(6)} />
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
