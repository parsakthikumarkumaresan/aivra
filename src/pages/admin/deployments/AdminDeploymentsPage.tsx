import { useState } from 'react'
import { Rocket } from 'lucide-react'
import { useAsync } from '@/hooks/useAsync'
import { useToast } from '@/hooks/useToast'
import { adminService } from '@/services/api'
import type { AdminVoiceProject, VoiceProjectStatus } from '@/services/api'
import { isApiError } from '@/services/api/errors'
import { PageHeader, Badge, DataTable, ErrorState, Drawer, Button } from '@/components/ui'
import { Input, Label, HelpText, Textarea } from '@/components/ui/Field'
import {
  VOICE_PROJECT_STATUS_LABEL as STATUS_LABEL,
  VOICE_PROJECT_STATUS_TONE as STATUS_TONE,
  VOICE_PROJECT_NEXT_STATUSES as NEXT_STATUSES,
  VOICE_PROJECT_FAILURE_STATUSES as FAILURE_STATUSES,
} from '@/components/admin/voiceProjectMeta'

export default function AdminDeploymentsPage() {
  const projects = useAsync(() => adminService.listVoiceProjects(), [])
  const [selected, setSelected] = useState<AdminVoiceProject | null>(null)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Deployments"
        description="Custom Jaan deployment lifecycle (app.leads.VoiceProject — real backend, platform-role gated): lead → discovery → configuration → integration → testing → approval → deployment → active."
      />

      {projects.error ? (
        <ErrorState description={projects.error.message} onRetry={projects.refetch} />
      ) : (
        <DataTable
          columns={[
            { key: 'name', header: 'Project', render: (row: AdminVoiceProject) => <span className="font-medium text-ink-900">{row.name}</span> },
            {
              key: 'status',
              header: 'Status',
              render: (row: AdminVoiceProject) => (
                <Badge tone={STATUS_TONE[row.status]} dot>
                  {STATUS_LABEL[row.status]}
                </Badge>
              ),
            },
            { key: 'org', header: 'Organization', render: (row: AdminVoiceProject) => row.organizationId ?? '— not linked —' },
            { key: 'engineer', header: 'Assigned Engineer', render: (row: AdminVoiceProject) => row.assignedEngineerUserId ?? '— unassigned —' },
          ]}
          data={projects.data ?? []}
          keyExtractor={(row) => row.id}
          loading={projects.loading}
          onRowClick={setSelected}
          emptyState={
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                <Rocket className="size-5" />
              </div>
              <h3 className="text-[15px] font-semibold text-ink-900">No deployments yet</h3>
              <p className="mt-1.5 max-w-md text-sm text-ink-500">
                Converting a "Jaan Customization" lead creates a deployment project here automatically.
              </p>
            </div>
          }
        />
      )}

      <DeploymentDetailDrawer project={selected} onClose={() => setSelected(null)} onChanged={projects.refetch} />
    </div>
  )
}

function DeploymentDetailDrawer({
  project,
  onClose,
  onChanged,
}: {
  project: AdminVoiceProject | null
  onClose: () => void
  onChanged: () => void
}) {
  const { show } = useToast()
  const [orgInput, setOrgInput] = useState('')
  const [engineerInput, setEngineerInput] = useState('')
  const [failureReason, setFailureReason] = useState('')
  const [pendingTarget, setPendingTarget] = useState<VoiceProjectStatus | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function runAction(action: () => Promise<unknown>) {
    setBusy(true)
    setError(null)
    try {
      await action()
      onChanged()
    } catch (err) {
      setError(isApiError(err) ? err.message : 'That action failed.')
    } finally {
      setBusy(false)
    }
  }

  async function handleTransition(target: VoiceProjectStatus) {
    if (!project) return
    if (FAILURE_STATUSES.includes(target) && pendingTarget !== target) {
      setPendingTarget(target)
      return
    }
    await runAction(() =>
      adminService.transitionVoiceProject(project.id, target, FAILURE_STATUSES.includes(target) ? failureReason : undefined),
    )
    setPendingTarget(null)
    setFailureReason('')
    show({ tone: 'success', title: 'Status updated', description: STATUS_LABEL[target] })
  }

  if (!project) return null

  const nextStatuses = NEXT_STATUSES[project.status]

  return (
    <Drawer open={Boolean(project)} onClose={onClose} title={project.name} description={STATUS_LABEL[project.status]}>
      <div className="space-y-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">Lead</p>
          <p className="mt-1 text-[13.5px] text-ink-700">{project.leadId}</p>
        </div>

        <div className="border-t border-ink-100 pt-4">
          <Label htmlFor="assign-org">Organization</Label>
          <div className="flex gap-2">
            <Input
              id="assign-org"
              placeholder={project.organizationId ?? 'Organization ID'}
              value={orgInput}
              onChange={(e) => setOrgInput(e.target.value)}
            />
            <Button
              variant="outline"
              disabled={!orgInput.trim()}
              loading={busy}
              onClick={() => runAction(() => adminService.assignOrganization(project.id, orgInput.trim())).then(() => setOrgInput(''))}
            >
              Assign
            </Button>
          </div>
        </div>

        <div>
          <Label htmlFor="assign-engineer">Assigned Engineer (user ID)</Label>
          <div className="flex gap-2">
            <Input
              id="assign-engineer"
              placeholder={project.assignedEngineerUserId ?? 'AIVRA engineer user ID'}
              value={engineerInput}
              onChange={(e) => setEngineerInput(e.target.value)}
            />
            <Button
              variant="outline"
              disabled={!engineerInput.trim()}
              loading={busy}
              onClick={() => runAction(() => adminService.assignEngineer(project.id, engineerInput.trim())).then(() => setEngineerInput(''))}
            >
              Assign
            </Button>
          </div>
        </div>

        <div className="border-t border-ink-100 pt-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">Advance status</p>
          {nextStatuses.length === 0 ? (
            <p className="mt-2 text-[13px] text-ink-500">This deployment is active — no further transitions.</p>
          ) : (
            <div className="mt-2 flex flex-wrap gap-2">
              {nextStatuses.map((target) => (
                <Button
                  key={target}
                  size="sm"
                  variant={FAILURE_STATUSES.includes(target) ? 'danger' : 'secondary'}
                  onClick={() => handleTransition(target)}
                >
                  {STATUS_LABEL[target]}
                </Button>
              ))}
            </div>
          )}

          {pendingTarget && (
            <div className="mt-3">
              <Label htmlFor="failure-reason">Failure reason</Label>
              <Textarea id="failure-reason" value={failureReason} onChange={(e) => setFailureReason(e.target.value)} rows={2} />
              <Button className="mt-2" size="sm" variant="danger" loading={busy} onClick={() => handleTransition(pendingTarget)}>
                Confirm {STATUS_LABEL[pendingTarget]}
              </Button>
            </div>
          )}

          {error && <HelpText error>{error}</HelpText>}
        </div>
      </div>
    </Drawer>
  )
}
