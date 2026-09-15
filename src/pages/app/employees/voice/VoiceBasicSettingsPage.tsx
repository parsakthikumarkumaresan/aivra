import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Bell, Building2, Info, Mic2, PhoneMissed, ShieldAlert, Sparkles } from 'lucide-react'
import { useSetBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { useToast } from '@/hooks/useToast'
import { useVoiceConfig } from '@/hooks/useVoice'
import { voiceService } from '@/services/api'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Label, Select, Textarea, Switch } from '@/components/ui/Field'
import { Skeleton } from '@/components/ui/Skeleton'
import { KnowledgeSourceCard } from '@/components/knowledge/KnowledgeSourceCard'
import { mockKnowledgeSources } from '@/services/mock/data/knowledge'
import type { VoiceBasicEscalationPreferences, VoiceNotificationPreferences } from '@/types'

const VOICE_OPTIONS = ['Aria — Warm, Professional (Female)', 'Kai — Calm, Neutral (Male)', 'Nova — Energetic, Friendly (Female)']

function NotificationRow({ icon, label, description, checked, onChange }: { icon: React.ReactNode; label: string; description: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-ink-200 p-3.5">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-ink-100 text-ink-500">{icon}</span>
        <div>
          <p className="text-[13px] font-medium text-ink-800">{label}</p>
          <p className="text-xs text-ink-500">{description}</p>
        </div>
      </div>
      <Switch checked={checked} onChange={onChange} />
    </div>
  )
}

export default function VoiceBasicSettingsPage() {
  useSetBreadcrumbs([{ label: 'AI Employees', href: '/app/employees' }, { label: 'Jaan', href: '/app/employees/voice' }, { label: 'Basic Settings' }])
  const { show } = useToast()
  const config = useVoiceConfig()

  const [employeeName, setEmployeeName] = useState('')
  const [voice, setVoice] = useState('')
  const [language, setLanguage] = useState('')
  const [speakingStyle, setSpeakingStyle] = useState('')
  const [workingHours, setWorkingHours] = useState('')
  const [greeting, setGreeting] = useState('')
  const [notifications, setNotifications] = useState<VoiceNotificationPreferences>({ escalations: true, dailySummary: false, missedCalls: true })
  const [escalation, setEscalation] = useState<VoiceBasicEscalationPreferences>({ upsetCaller: true, refundsOrCancellations: true })
  const [saving, setSaving] = useState(false)

  // Seed local editable state from the mock store once it loads — mirrors
  // the read -> local-form -> save -> refetch pattern used in Settings.
  // Guarded to seed exactly once: the fetch resolves asynchronously after
  // mount, and without the guard, a user editing before it resolves would
  // have their edit silently overwritten the moment it lands.
  const seeded = useRef(false)
  useEffect(() => {
    if (!config.data || seeded.current) return
    seeded.current = true
    setEmployeeName(config.data.employeeName)
    setVoice(config.data.voice)
    setLanguage(config.data.language)
    setSpeakingStyle(config.data.speakingStyle)
    setWorkingHours(config.data.workingHours)
    setGreeting(config.data.greeting)
    setNotifications(config.data.notificationPreferences)
    setEscalation(config.data.basicEscalationPreferences)
  }, [config.data])

  const voiceSources = mockKnowledgeSources.filter((s) => s.employeeAccess.includes('voice'))

  async function save() {
    setSaving(true)
    await voiceService.saveConfig({
      employeeName,
      voice,
      language,
      speakingStyle,
      workingHours,
      greeting,
      notificationPreferences: notifications,
      basicEscalationPreferences: escalation,
    })
    setSaving(false)
    config.refetch()
    show({ tone: 'success', title: 'Settings saved' })
  }

  return (
    <div className="space-y-5">
      <Link to="/app/employees/voice" className="flex items-center gap-1.5 text-[13px] font-medium text-ink-500 hover:text-ink-800">
        <ArrowLeft className="size-3.5" />
        Back to Jaan
      </Link>

      <PageHeader title="Basic Settings" description="Everyday controls for your Jaan." />

      <Card className="border-info-100 bg-info-50/50">
        <CardBody className="flex items-start gap-3">
          <Info className="mt-0.5 size-4 shrink-0 text-info-600" />
          <p className="text-[13px] leading-relaxed text-ink-700">
            JEXA.AI configures and maintains the underlying AI system for your Voice Employee — knowledge indexing, tools,
            guardrails and telephony. The settings below are safe controls you can adjust anytime.
          </p>
        </CardBody>
      </Card>

      {config.loading || !config.data ? (
        <div className="space-y-5">
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      ) : (
        <>
          <Card>
            <CardHeader title="AI Employee Identity" description="How your Jaan sounds and introduces itself" />
            <CardBody className="space-y-4">
              <div>
                <Label>AI Employee Name</Label>
                <Input value={employeeName} onChange={(e) => setEmployeeName(e.target.value)} />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label>Voice</Label>
                  <Select value={voice} onChange={(e) => setVoice(e.target.value)}>
                    {VOICE_OPTIONS.map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label>Language</Label>
                  <Input value={language} onChange={(e) => setLanguage(e.target.value)} />
                </div>
              </div>
              <div>
                <Label>Speaking Style</Label>
                <Input value={speakingStyle} onChange={(e) => setSpeakingStyle(e.target.value)} />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title={<span className="flex items-center gap-2"><Mic2 className="size-4 text-ink-500" /> Business Hours & Greeting</span>} />
            <CardBody className="space-y-4">
              <div>
                <Label>Business Hours</Label>
                <Input value={workingHours} onChange={(e) => setWorkingHours(e.target.value)} />
              </div>
              <div>
                <Label>Basic Greeting</Label>
                <Textarea value={greeting} onChange={(e) => setGreeting(e.target.value)} />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title={<span className="flex items-center gap-2"><Building2 className="size-4 text-ink-500" /> Business Information</span>}
              description="Provide the business information your AI Employee should know. Jexa's team configures and maintains the underlying AI knowledge system."
            />
            <CardBody className="space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {voiceSources.map((source) => (
                  <KnowledgeSourceCard key={source.id} source={source} />
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                icon={<Sparkles className="size-3.5" />}
                onClick={() => show({ tone: 'info', title: 'Suggestion sent', description: "Jexa's team will review and add this to your AI Employee's knowledge." })}
              >
                Suggest a Source
              </Button>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Notification Preferences" />
            <CardBody className="space-y-3">
              <NotificationRow icon={<PhoneMissed className="size-4" />} label="Escalations" description="When a call hands off to a human" checked={notifications.escalations} onChange={(v) => setNotifications({ ...notifications, escalations: v })} />
              <NotificationRow icon={<Bell className="size-4" />} label="Daily call summary" description="A summary email each morning" checked={notifications.dailySummary} onChange={(v) => setNotifications({ ...notifications, dailySummary: v })} />
              <NotificationRow icon={<PhoneMissed className="size-4" />} label="Missed calls" description="When a call couldn't be handled" checked={notifications.missedCalls} onChange={(v) => setNotifications({ ...notifications, missedCalls: v })} />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title={<span className="flex items-center gap-2"><ShieldAlert className="size-4 text-ink-500" /> Basic Escalation Preferences</span>} description="Deeper routing logic is configured by JEXA.AI" />
            <CardBody className="space-y-3">
              <NotificationRow icon={<ShieldAlert className="size-4" />} label="Escalate when the caller seems upset" description="Hands off to a human on detected frustration" checked={escalation.upsetCaller} onChange={(v) => setEscalation({ ...escalation, upsetCaller: v })} />
              <NotificationRow icon={<ShieldAlert className="size-4" />} label="Escalate for cancellations or refunds" description="Always route these requests to a human" checked={escalation.refundsOrCancellations} onChange={(v) => setEscalation({ ...escalation, refundsOrCancellations: v })} />
            </CardBody>
          </Card>

          <div className="flex justify-end">
            <Button onClick={save} loading={saving}>Save Changes</Button>
          </div>
        </>
      )}
    </div>
  )
}
