import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Mail, Phone, Building2, ExternalLink, ListChecks, Check } from 'lucide-react'
import { useAsync } from '@/hooks/useAsync'
import { useToast } from '@/hooks/useToast'
import { adminService } from '@/services/api'
import type { AdminLead, LeadStatus, LeadType, VoiceProjectStatus, AdminRequirement } from '@/services/api'
import { isApiError } from '@/services/api/errors'
import {
  PageHeader,
  Badge,
  Card,
  CardHeader,
  CardBody,
  ErrorState,
  EmptyState,
  Button,
  ConfirmationDialog,
} from '@/components/ui'
import type { BadgeTone } from '@/components/ui/Badge'
import { Input, Label, HelpText, Textarea } from '@/components/ui/Field'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatDateTime } from '@/utils/format'
import {
  VOICE_PROJECT_STATUS_LABEL,
  VOICE_PROJECT_STATUS_TONE,
  VOICE_PROJECT_NEXT_STATUSES,
  VOICE_PROJECT_FAILURE_STATUSES,
  VOICE_PROJECT_LIFECYCLE_ORDER,
} from '@/components/admin/voiceProjectMeta'

const LEAD_STATUS_LABEL: Record<LeadStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  qualified: 'Qualified',
  converted: 'Converted',
  rejected: 'Rejected',
}
const LEAD_STATUS_TONE: Record<LeadStatus, BadgeTone> = {
  new: 'info',
  contacted: 'brand',
  qualified: 'warning',
  converted: 'success',
  rejected: 'neutral',
}
const LEAD_TYPE_LABEL: Record<LeadType, string> = {
  demo_request: 'Demo Request',
  voice_customization: 'Jaan Customization',
  hr_sales_request: 'HR Sales Request',
}

// Mirrors app/leads/models/lead.py LEAD_TRANSITIONS — UX-only (which
// buttons to show); the backend state machine is the real authority and
// rejects anything else with 409 INVALID_STATE_TRANSITION.
const LEAD_NEXT_STATUSES: Record<LeadStatus, LeadStatus[]> = {
  new: ['contacted', 'rejected'],
  contacted: ['qualified', 'rejected'],
  qualified: ['rejected'],
  converted: [],
  rejected: [],
}

// Presentation-only grouping of a VoiceProject's free-form Requirement
// key/value rows (spec: "Group requirements clearly") — no new backend
// fields, just categorizing real data by its key.
const REQUIREMENT_GROUPS: { title: string; match: RegExp }[] = [
  { title: 'Business', match: /industry|business|hours|volume/i },
  { title: 'Voice', match: /language|voice|tone|personality/i },
  { title: 'Use Case', match: /use_case|usecase|capabilit/i },
  { title: 'Integrations', match: /system|api|crm|telephony|provider|integration/i },
  { title: 'Knowledge', match: /knowledge|source/i },
]

function groupRequirements(requirements: AdminRequirement[]) {
  const groups: Record<string, AdminRequirement[]> = {}
  for (const req of requirements) {
    const group = REQUIREMENT_GROUPS.find((g) => g.match.test(req.key))
    const title = group?.title ?? 'Special Requirements'
    groups[title] = groups[title] ?? []
    groups[title].push(req)
  }
  return groups
}

export default function AdminLeadDetailPage() {
  const { leadId } = useParams<{ leadId: string }>()
  const navigate = useNavigate()
  const lead = useAsync(() => adminService.getLead(leadId!), [leadId])

  if (lead.loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }
  if (lead.error || !lead.data) {
    return <ErrorState title="Lead not found" onRetry={lead.refetch} />
  }

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/admin/leads')} className="flex items-center gap-1.5 text-[12.5px] font-medium text-ink-500 hover:text-ink-800">
        <ArrowLeft className="size-3.5" /> Back to Leads
      </button>

      <PageHeader
        title={lead.data.companyName ?? lead.data.contactName}
        description={LEAD_TYPE_LABEL[lead.data.type]}
        actions={<Badge tone={LEAD_STATUS_TONE[lead.data.status]} dot>{LEAD_STATUS_LABEL[lead.data.status]}</Badge>}
      />

      <LeadInfoCard lead={lead.data} onChanged={lead.refetch} />

      {lead.data.voiceProject && <VoiceProjectSection projectId={lead.data.voiceProject.id} />}
    </div>
  )
}

function LeadInfoCard({ lead, onChanged }: { lead: AdminLead; onChanged: () => void }) {
  const { show } = useToast()
  const [orgId, setOrgId] = useState('')
  const [converting, setConverting] = useState(false)
  const [convertError, setConvertError] = useState<string | null>(null)
  const [pendingTransition, setPendingTransition] = useState<LeadStatus | null>(null)
  const [transitioning, setTransitioning] = useState(false)

  async function handleTransition(target: LeadStatus) {
    setTransitioning(true)
    try {
      await adminService.transitionLead(lead.id, target)
      show({ tone: 'success', title: 'Lead stage updated', description: LEAD_STATUS_LABEL[target] })
      onChanged()
    } catch (err) {
      show({ tone: 'error', title: 'Could not update stage', description: isApiError(err) ? err.message : undefined })
    } finally {
      setTransitioning(false)
      setPendingTransition(null)
    }
  }

  async function handleConvert() {
    if (!orgId.trim()) {
      setConvertError('Enter the organization ID this lead should be linked to.')
      return
    }
    setConverting(true)
    setConvertError(null)
    try {
      await adminService.convertLead(lead.id, orgId.trim())
      show({ tone: 'success', title: 'Lead converted' })
      onChanged()
    } catch (err) {
      setConvertError(isApiError(err) ? err.message : 'Could not convert this lead.')
    } finally {
      setConverting(false)
    }
  }

  const nextStatuses = LEAD_NEXT_STATUSES[lead.status]

  return (
    <Card>
      <CardHeader title="Lead Information" description="Real data submitted by the prospect — no fields are fabricated." />
      <CardBody className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <p className="flex items-center gap-2 text-[13.5px] text-ink-700"><Building2 className="size-3.5 text-ink-400" /> {lead.companyName ?? 'Not available'}</p>
          <p className="flex items-center gap-2 text-[13.5px] text-ink-700">{lead.contactName}</p>
          <p className="flex items-center gap-2 text-[13.5px] text-ink-700"><Mail className="size-3.5 text-ink-400" /> {lead.contactEmail}</p>
          <p className="flex items-center gap-2 text-[13.5px] text-ink-700"><Phone className="size-3.5 text-ink-400" /> {lead.phone ?? 'Not available'}</p>
        </div>

        {lead.message && (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">Message</p>
            <p className="mt-1 text-[13.5px] text-ink-700">{lead.message}</p>
          </div>
        )}

        <p className="text-[12px] text-ink-400">Submitted {formatDateTime(lead.createdAt)}</p>

        <div className="border-t border-ink-100 pt-4">
          {lead.organizationId ? (
            <Link to={`/admin/customers/${lead.organizationId}`} className="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-brand-600 hover:text-brand-700">
              View Customer <ExternalLink className="size-3.5" />
            </Link>
          ) : lead.status === 'qualified' ? (
            <div className="max-w-sm">
              <Label htmlFor="convert-org">Convert to customer organization</Label>
              <Input id="convert-org" placeholder="Existing organization ID" value={orgId} onChange={(e) => setOrgId(e.target.value)} error={Boolean(convertError)} />
              {convertError && <HelpText error>{convertError}</HelpText>}
              <Button className="mt-2" size="sm" loading={converting} onClick={handleConvert}>
                Convert Lead
              </Button>
            </div>
          ) : (
            <p className="text-[13px] text-ink-500">Customer not created</p>
          )}
        </div>

        {nextStatuses.length > 0 && (
          <div className="border-t border-ink-100 pt-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">Move to next stage</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {nextStatuses.map((target) => (
                <Button
                  key={target}
                  size="sm"
                  variant={target === 'rejected' ? 'danger' : 'secondary'}
                  loading={transitioning}
                  onClick={() => (target === 'rejected' ? setPendingTransition(target) : handleTransition(target))}
                >
                  {target === 'rejected' ? 'Reject' : `Mark ${LEAD_STATUS_LABEL[target]}`}
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardBody>

      <ConfirmationDialog
        open={pendingTransition !== null}
        onClose={() => setPendingTransition(null)}
        onConfirm={() => pendingTransition && handleTransition(pendingTransition)}
        title="Reject this lead?"
        description="This lead will move to Rejected. This is a real backend state change."
        confirmLabel="Reject Lead"
        destructive
        loading={transitioning}
      />
    </Card>
  )
}

function VoiceProjectSection({ projectId }: { projectId: string }) {
  const project = useAsync(() => adminService.getVoiceProject(projectId), [projectId])
  const requirements = useAsync(() => adminService.listRequirements(projectId), [projectId])
  const { show } = useToast()
  const [orgInput, setOrgInput] = useState('')
  const [engineerInput, setEngineerInput] = useState('')
  const [pendingTarget, setPendingTarget] = useState<VoiceProjectStatus | null>(null)
  const [failureReason, setFailureReason] = useState('')
  const [busy, setBusy] = useState(false)

  async function runAction(action: () => Promise<unknown>, successMessage: string) {
    setBusy(true)
    try {
      await action()
      show({ tone: 'success', title: successMessage })
      project.refetch()
    } catch (err) {
      show({ tone: 'error', title: 'Action failed', description: isApiError(err) ? err.message : undefined })
    } finally {
      setBusy(false)
    }
  }

  async function handleTransition(target: VoiceProjectStatus) {
    if (VOICE_PROJECT_FAILURE_STATUSES.includes(target) && pendingTarget !== target) {
      setPendingTarget(target)
      return
    }
    await runAction(
      () => adminService.transitionVoiceProject(projectId, target, VOICE_PROJECT_FAILURE_STATUSES.includes(target) ? failureReason : undefined),
      `Status updated to ${VOICE_PROJECT_STATUS_LABEL[target]}`,
    )
    setPendingTarget(null)
    setFailureReason('')
  }

  const groupedRequirements = useMemo(() => groupRequirements(requirements.data ?? []), [requirements.data])

  if (project.loading) return <Skeleton className="h-40 w-full" />
  if (project.error || !project.data) return <ErrorState title="Voice project not found" onRetry={project.refetch} compact />

  const p = project.data
  const nextStatuses = VOICE_PROJECT_NEXT_STATUSES[p.status]
  const currentIndex = VOICE_PROJECT_LIFECYCLE_ORDER.indexOf(p.status)

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader
          title="Jaan Voice Project"
          description={`ID ${p.id}`}
          actions={<Badge tone={VOICE_PROJECT_STATUS_TONE[p.status]} dot>{VOICE_PROJECT_STATUS_LABEL[p.status]}</Badge>}
        />
        <CardBody className="space-y-5">
          {currentIndex >= 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {VOICE_PROJECT_LIFECYCLE_ORDER.map((stage, i) => (
                <div key={stage} className="flex items-center gap-1.5">
                  <span
                    className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                      i < currentIndex
                        ? 'bg-success-100 text-success-700'
                        : i === currentIndex
                          ? 'bg-brand-600 text-white'
                          : 'bg-ink-100 text-ink-400'
                    }`}
                  >
                    {i < currentIndex && <Check className="size-3" />}
                    {VOICE_PROJECT_STATUS_LABEL[stage]}
                  </span>
                  {i < VOICE_PROJECT_LIFECYCLE_ORDER.length - 1 && <span className="text-ink-300">→</span>}
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 text-[13px] sm:grid-cols-2">
            <p><span className="text-ink-500">Organization:</span> {p.organizationId ? (
              <Link to={`/admin/customers/${p.organizationId}`} className="ml-1 font-medium text-brand-600 hover:text-brand-700">
                {p.organizationId} <ExternalLink className="inline size-3" />
              </Link>
            ) : <span className="ml-1 text-ink-400">Not linked</span>}</p>
            <p><span className="text-ink-500">Assigned Engineer:</span> <span className="ml-1 text-ink-800">{p.assignedEngineerUserId ?? 'Not available'}</span></p>
            {p.failureReason && <p className="sm:col-span-2"><span className="text-ink-500">Failure reason:</span> <span className="ml-1 text-danger-600">{p.failureReason}</span></p>}
          </div>

          <div className="border-t border-ink-100 pt-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="vp-org">Assign organization</Label>
                <div className="flex gap-2">
                  <Input id="vp-org" placeholder="Organization ID" value={orgInput} onChange={(e) => setOrgInput(e.target.value)} />
                  <Button variant="outline" size="sm" disabled={!orgInput.trim()} loading={busy} onClick={() => runAction(() => adminService.assignOrganization(projectId, orgInput.trim()), 'Organization assigned').then(() => setOrgInput(''))}>
                    Assign
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="vp-engineer">Assign engineer (user ID)</Label>
                <div className="flex gap-2">
                  <Input id="vp-engineer" placeholder="AIVRA engineer user ID" value={engineerInput} onChange={(e) => setEngineerInput(e.target.value)} />
                  <Button variant="outline" size="sm" disabled={!engineerInput.trim()} loading={busy} onClick={() => runAction(() => adminService.assignEngineer(projectId, engineerInput.trim()), 'Engineer assigned').then(() => setEngineerInput(''))}>
                    Assign
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {nextStatuses.length > 0 && (
            <div className="border-t border-ink-100 pt-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">Advance status</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {nextStatuses.map((target) => (
                  <Button key={target} size="sm" variant={VOICE_PROJECT_FAILURE_STATUSES.includes(target) ? 'danger' : 'secondary'} onClick={() => handleTransition(target)}>
                    {VOICE_PROJECT_STATUS_LABEL[target]}
                  </Button>
                ))}
              </div>
              {pendingTarget && (
                <div className="mt-3 max-w-sm">
                  <Label htmlFor="failure-reason">Failure reason</Label>
                  <Textarea id="failure-reason" value={failureReason} onChange={(e) => setFailureReason(e.target.value)} rows={2} />
                  <Button className="mt-2" size="sm" variant="danger" loading={busy} onClick={() => handleTransition(pendingTarget)}>
                    Confirm {VOICE_PROJECT_STATUS_LABEL[pendingTarget]}
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Requirements" description="Discovery notes collected for this project, grouped for clarity." />
        {requirements.loading ? (
          <CardBody><Skeleton className="h-16 w-full" /></CardBody>
        ) : (requirements.data ?? []).length === 0 ? (
          <CardBody>
            <EmptyState compact icon={<ListChecks className="size-5" />} title="No requirements recorded yet" />
          </CardBody>
        ) : (
          <CardBody className="space-y-5">
            {Object.entries(groupedRequirements).map(([title, items]) => (
              <div key={title}>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">{title}</p>
                <dl className="mt-2 space-y-1.5">
                  {items.map((r) => (
                    <div key={r.id} className="flex gap-2 text-[13px]">
                      <dt className="w-40 shrink-0 text-ink-500">{r.key}</dt>
                      <dd className="text-ink-800">{r.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </CardBody>
        )}
      </Card>
    </div>
  )
}
