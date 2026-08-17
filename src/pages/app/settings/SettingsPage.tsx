import { useState } from 'react'
import {
  Settings as SettingsIcon,
  Building2,
  Users,
  Bell,
  Globe2,
  Palette,
  ShieldCheck,
  Sparkles,
  ChevronDown,
  Plus,
  Mail,
} from 'lucide-react'
import { useSetBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { useAppData } from '@/app/AppDataProvider'
import { useUsers } from '@/hooks/useOrganization'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Input, Label, Select, Switch } from '@/components/ui/Field'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import type { BadgeTone } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { LogoMark } from '@/components/ui/Logo'
import { useToast } from '@/hooks/useToast'
import { cn } from '@/utils/cn'
import type { UserRole } from '@/types'

const SECTIONS = [
  { id: 'organization', label: 'Organization', icon: Building2 },
  { id: 'users', label: 'Users & Roles', icon: Users },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'timezone', label: 'Timezone', icon: Globe2 },
  { id: 'branding', label: 'Branding', icon: Palette },
  { id: 'security', label: 'Security', icon: ShieldCheck },
  { id: 'ai', label: 'AI Preferences', icon: Sparkles },
] as const

type SectionId = (typeof SECTIONS)[number]['id']

const ROLE_TONE: Record<UserRole, BadgeTone> = { owner: 'brand', admin: 'info', manager: 'neutral', member: 'neutral', viewer: 'neutral' }

function Collapsible({ title, description, children, defaultOpen = false }: { title: string; description?: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="rounded-lg border border-ink-200">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between px-4 py-3 text-left">
        <div>
          <p className="text-[13px] font-semibold text-ink-800">{title}</p>
          {description && <p className="mt-0.5 text-xs text-ink-500">{description}</p>}
        </div>
        <ChevronDown className={cn('size-4 shrink-0 text-ink-400 transition-transform duration-150', open && 'rotate-180')} />
      </button>
      {open && <div className="space-y-3 border-t border-ink-100 px-4 py-4">{children}</div>}
    </div>
  )
}

export default function SettingsPage() {
  useSetBreadcrumbs([{ label: 'Settings' }])
  const { organization } = useAppData()
  const users = useUsers()
  const { show } = useToast()
  const [section, setSection] = useState<SectionId>('organization')

  const [notifications, setNotifications] = useState({
    escalations: true,
    approvals: true,
    dailyDigest: false,
    integrationFailures: true,
  })
  const [aiPrefs, setAiPrefs] = useState({
    requireHumanReview: true,
    autoEscalateLowConfidence: true,
    confidenceThreshold: 70,
  })

  function saveToast(label: string) {
    show({ tone: 'success', title: `${label} saved` })
  }

  return (
    <div className="space-y-6">
      <PageHeader icon={<SettingsIcon className="size-5" />} title="Settings" description="Manage your organization, team and AI Employee preferences." />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[220px_1fr]">
        <nav className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              className={cn(
                'flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[13.5px] font-medium transition-colors duration-150',
                section === s.id ? 'bg-brand-50 text-brand-700' : 'text-ink-600 hover:bg-ink-100',
              )}
            >
              <s.icon className="size-4" />
              {s.label}
            </button>
          ))}
        </nav>

        <div className="space-y-5">
          {section === 'organization' && (
            <Card>
              <CardHeader title="Organization Profile" description="Basic information about your organization" />
              <CardBody className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Organization name</Label>
                    <Input defaultValue={organization?.name} />
                  </div>
                  <div>
                    <Label>Slug</Label>
                    <Input defaultValue={organization?.slug} />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Industry</Label>
                    <Input defaultValue={organization?.industry} />
                  </div>
                  <div>
                    <Label>Plan</Label>
                    <div className="flex h-9 items-center">
                      <Badge tone="brand" className="capitalize">{organization?.plan} plan</Badge>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => saveToast('Organization profile')}>Save Changes</Button>
                </div>
              </CardBody>
            </Card>
          )}

          {section === 'users' && (
            <Card>
              <CardHeader
                title="Users & Roles"
                description="Manage who has access to your AI workforce"
                actions={
                  <Button size="sm" icon={<Plus className="size-3.5" />} onClick={() => show({ tone: 'info', title: 'Invite sent', description: 'An invitation email would be sent here.' })}>
                    Invite User
                  </Button>
                }
              />
              {users.loading ? (
                <CardBody>
                  <Skeleton className="h-40 w-full" />
                </CardBody>
              ) : (
                <div className="divide-y divide-ink-100">
                  {users.data?.map((u) => (
                    <div key={u.id} className="flex items-center gap-3 px-5 py-3.5">
                      <Avatar name={u.name} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13.5px] font-medium text-ink-800">{u.name}</p>
                        <p className="truncate text-xs text-ink-500">{u.email}</p>
                      </div>
                      <Badge tone={ROLE_TONE[u.role]} className="capitalize">{u.role}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {section === 'notifications' && (
            <Card>
              <CardHeader title="Notifications" description="Choose what your team gets notified about" />
              <CardBody className="space-y-3">
                <NotificationRow icon={<Bell className="size-4" />} label="Escalations" description="When an AI Employee hands off to a human" checked={notifications.escalations} onChange={(v) => setNotifications({ ...notifications, escalations: v })} />
                <NotificationRow icon={<ShieldCheck className="size-4" />} label="Approvals" description="When a new approval is requested" checked={notifications.approvals} onChange={(v) => setNotifications({ ...notifications, approvals: v })} />
                <NotificationRow icon={<Mail className="size-4" />} label="Daily digest" description="A summary email each morning" checked={notifications.dailyDigest} onChange={(v) => setNotifications({ ...notifications, dailyDigest: v })} />
                <NotificationRow icon={<Globe2 className="size-4" />} label="Integration failures" description="When a connected system stops syncing" checked={notifications.integrationFailures} onChange={(v) => setNotifications({ ...notifications, integrationFailures: v })} />
                <div className="flex justify-end pt-1">
                  <Button onClick={() => saveToast('Notification preferences')}>Save Changes</Button>
                </div>
              </CardBody>
            </Card>
          )}

          {section === 'timezone' && (
            <Card>
              <CardHeader title="Timezone" description="Used for scheduling, reporting and activity timestamps" />
              <CardBody className="space-y-4">
                <div>
                  <Label>Default timezone</Label>
                  <Select defaultValue={organization?.timezone}>
                    <option value="Asia/Kolkata">Asia/Kolkata (IST, UTC+5:30)</option>
                    <option value="America/New_York">America/New_York (ET)</option>
                    <option value="Europe/London">Europe/London (GMT)</option>
                  </Select>
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => saveToast('Timezone')}>Save Changes</Button>
                </div>
              </CardBody>
            </Card>
          )}

          {section === 'branding' && (
            <Card>
              <CardHeader title="Branding" description="How AIVRA appears to your team and customers" />
              <CardBody className="space-y-4">
                <div className="flex items-center gap-4">
                  <LogoMark size={48} />
                  <div>
                    <p className="text-[13px] font-medium text-ink-800">AIVRA Logo</p>
                    <p className="text-xs text-ink-500">Used across the app shell and public homepage.</p>
                  </div>
                </div>
                <div>
                  <Label>Primary accent color</Label>
                  <div className="flex items-center gap-2.5">
                    <span className="size-8 rounded-lg bg-brand-600" />
                    <span className="text-[13px] text-ink-600">#6D3EF2 — AIVRA Purple</span>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {section === 'security' && (
            <Card>
              <CardHeader title="Security" description="Protect access to your AI workforce" />
              <CardBody className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border border-ink-200 p-3.5">
                  <div>
                    <p className="text-[13px] font-medium text-ink-800">Require two-factor authentication</p>
                    <p className="text-xs text-ink-500">Applies to all organization members.</p>
                  </div>
                  <Switch checked onChange={() => saveToast('Security')} />
                </div>
                <Collapsible title="Advanced" description="Single sign-on, session policy and API keys">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-ink-700">Single Sign-On (SSO)</span>
                    <Badge tone="neutral">Not configured</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-ink-700">Session timeout</span>
                    <Select className="w-40" defaultValue="8h">
                      <option value="1h">1 hour</option>
                      <option value="8h">8 hours</option>
                      <option value="24h">24 hours</option>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-ink-700">API keys</span>
                    <Button size="sm" variant="outline">Manage keys</Button>
                  </div>
                </Collapsible>
              </CardBody>
            </Card>
          )}

          {section === 'ai' && (
            <Card>
              <CardHeader title="AI Preferences" description="Governance defaults applied across AI Employees" />
              <CardBody className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border border-ink-200 p-3.5 opacity-70">
                  <div>
                    <p className="text-[13px] font-medium text-ink-800">Require human review for hiring interviews</p>
                    <p className="text-xs text-ink-500">Always on — this cannot be disabled.</p>
                  </div>
                  <Switch checked disabled onChange={() => {}} />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-ink-200 p-3.5">
                  <div>
                    <p className="text-[13px] font-medium text-ink-800">Auto-escalate on low confidence</p>
                    <p className="text-xs text-ink-500">AI Employees hand off when uncertain.</p>
                  </div>
                  <Switch checked={aiPrefs.autoEscalateLowConfidence} onChange={(v) => setAiPrefs({ ...aiPrefs, autoEscalateLowConfidence: v })} />
                </div>
                <Collapsible title="Advanced" description="Confidence thresholds and model behavior">
                  <div>
                    <Label>Escalation confidence threshold: {aiPrefs.confidenceThreshold}%</Label>
                    <input
                      type="range"
                      min={40}
                      max={95}
                      value={aiPrefs.confidenceThreshold}
                      onChange={(e) => setAiPrefs({ ...aiPrefs, confidenceThreshold: Number(e.target.value) })}
                      className="w-full accent-brand-600"
                    />
                    <p className="mt-1 text-xs text-ink-500">Below this confidence, AI Employees escalate rather than guess.</p>
                  </div>
                </Collapsible>
                <div className="flex justify-end pt-1">
                  <Button onClick={() => saveToast('AI preferences')}>Save Changes</Button>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

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
