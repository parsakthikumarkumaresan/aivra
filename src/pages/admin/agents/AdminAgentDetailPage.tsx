import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Bot, Pause, Play, PhoneCall } from 'lucide-react'
import { useAsync } from '@/hooks/useAsync'
import { useToast } from '@/hooks/useToast'
import { adminAgentsService } from '@/services/api'
import { isApiError } from '@/services/api/errors'
import { PageHeader, Badge, Card, CardHeader, CardBody, ErrorState, EmptyState, Button } from '@/components/ui'
import type { BadgeTone } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatDateTime } from '@/utils/format'

const STATUS_TONE: Record<string, BadgeTone> = {
  draft: 'neutral',
  testing: 'info',
  live: 'success',
  paused: 'warning',
}

const VERSION_TONE: Record<string, BadgeTone> = {
  draft: 'neutral',
  test: 'info',
  approved: 'info',
  published: 'success',
  archived: 'neutral',
}

// Agent detail (Phase 8) — real deployment state (every AgentVersion row,
// which one is live), a voice config summary read off the displayed
// version's config (never fabricated), and the agent's real recent calls.
// Pause/resume delegate straight to the same VoiceAgentService state
// machine the customer-facing builder uses.
export default function AdminAgentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const toast = useToast()
  const detail = useAsync(() => adminAgentsService.get(id!), [id])

  async function handlePause() {
    try {
      await adminAgentsService.pause(id!)
      toast.show({ title: 'Agent paused', tone: 'success' })
      detail.refetch()
    } catch (err) {
      toast.show({
        title: 'Failed to pause agent',
        description: isApiError(err) ? err.message : undefined,
        tone: 'error',
      })
    }
  }

  async function handleResume() {
    try {
      await adminAgentsService.resume(id!)
      toast.show({ title: 'Agent resumed', tone: 'success' })
      detail.refetch()
    } catch (err) {
      toast.show({
        title: 'Failed to resume agent',
        description: isApiError(err) ? err.message : undefined,
        tone: 'error',
      })
    }
  }

  if (detail.loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }
  if (detail.error || !detail.data) {
    return <ErrorState title="Agent not found" onRetry={detail.refetch} />
  }

  const agent = detail.data

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/admin/agents')}
        className="flex items-center gap-1.5 text-[12.5px] font-medium text-ink-500 hover:text-ink-800"
      >
        <ArrowLeft className="size-3.5" /> Back to Agents
      </button>

      <PageHeader
        title={agent.name}
        description={`${agent.organizationName} · ${agent.industry ?? 'No industry set'} · ${agent.environment}`}
        actions={
          <div className="flex items-center gap-2">
            <Badge tone={STATUS_TONE[agent.status] ?? 'neutral'} dot>
              {agent.status}
            </Badge>
            {agent.status === 'paused' ? (
              <Button variant="outline" size="sm" icon={<Play className="size-3.5" />} onClick={handleResume}>
                Resume
              </Button>
            ) : (
              agent.status === 'live' && (
                <Button variant="outline" size="sm" icon={<Pause className="size-3.5" />} onClick={handlePause}>
                  Pause
                </Button>
              )
            )}
          </div>
        }
      />

      <Card>
        <CardHeader
          title="Deployment"
          description="Every real AgentVersion row for this agent (app.ai_employees.voice AgentVersion) — which one is live, never inferred."
        />
        <CardBody>
          {agent.versions.length === 0 ? (
            <EmptyState compact icon={<Bot className="size-5" />} title="No versions yet" />
          ) : (
            <div className="divide-y divide-ink-100">
              {agent.versions.map((v) => (
                <div key={v.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[13px] text-ink-800">v{v.versionNumber}</span>
                    <Badge tone={VERSION_TONE[v.status] ?? 'neutral'}>{v.status}</Badge>
                    {v.isActive && <Badge tone="success">Active</Badge>}
                  </div>
                  <span className="text-xs text-ink-500">
                    {v.publishedAt ? `Published ${formatDateTime(v.publishedAt)}` : 'Not published'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Voice Configuration"
          description="Read from the live (or latest) version's config. Fields not set on this agent show as unset, never guessed."
        />
        <CardBody className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <ConfigField label="Mode" value={agent.voiceMode} />
          <ConfigField label="Provider" value={agent.voiceProvider} />
          <ConfigField label="Model" value={agent.voiceModel} />
          <ConfigField label="Language" value={agent.voiceLanguage} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Recent Calls"
          description={`${agent.callCount} total call${agent.callCount === 1 ? '' : 's'} for this agent.`}
        />
        {agent.recentCalls.length === 0 ? (
          <CardBody>
            <EmptyState compact icon={<PhoneCall className="size-5" />} title="No calls yet" />
          </CardBody>
        ) : (
          <div className="divide-y divide-ink-100">
            {agent.recentCalls.map((call) => (
              <div key={call.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-[13px] font-medium text-ink-800 capitalize">
                    {call.direction} · {call.status.replace('_', ' ')}
                  </p>
                  <p className="text-xs text-ink-500">{formatDateTime(call.startedAt)}</p>
                </div>
                <div className="text-right text-xs text-ink-500">
                  <p>{Math.round(call.durationSeconds / 60)} min</p>
                  {call.outcome && <p className="capitalize">{call.outcome.replace('_', ' ')}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

function ConfigField({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">{label}</p>
      <p className="mt-1 text-[13px] text-ink-800">{value ?? <span className="text-ink-400">Not set</span>}</p>
    </div>
  )
}
