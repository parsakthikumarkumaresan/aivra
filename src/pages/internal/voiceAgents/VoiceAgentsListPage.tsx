import { Link } from 'react-router-dom'
import { Mic, PhoneCall } from 'lucide-react'
import { useVoiceAgents } from '@/hooks/useVoiceAgentBuilder'
import { PageHeader } from '@/components/ui/PageHeader'
import { DataTable } from '@/components/ui/DataTable'
import type { DataTableColumn } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import type { BadgeTone } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { EmptyState } from '@/components/ui/EmptyState'
import type { VoiceAgent, VoiceAgentStatus } from '@/types'
import { VOICE_AGENT_STATUS_LABEL } from '@/types'
import { formatDateTime } from '@/utils/format'

const STATUS_TONE: Record<VoiceAgentStatus, BadgeTone> = { draft: 'neutral', testing: 'info', live: 'success', paused: 'warning' }

export default function VoiceAgentsListPage() {
  const agents = useVoiceAgents()

  const columns: DataTableColumn<VoiceAgent>[] = [
    {
      key: 'name',
      header: 'Agent',
      render: (a) => (
        <Link to={`/internal/voice-agents/${a.id}`} className="flex items-center gap-2.5">
          <Avatar name={a.name} size="sm" />
          <span className="min-w-0">
            <span className="block font-medium text-ink-900">{a.name}</span>
            <span className="block text-xs text-ink-500">{a.industry}</span>
          </span>
        </Link>
      ),
    },
    { key: 'status', header: 'Status', render: (a) => <Badge tone={STATUS_TONE[a.status]} dot>{VOICE_AGENT_STATUS_LABEL[a.status]}</Badge> },
    { key: 'environment', header: 'Environment', render: (a) => <span className="capitalize text-[13px] text-ink-600">{a.environment}</span> },
    { key: 'version', header: 'Version', render: (a) => <span className="text-[13px] text-ink-600">v{a.version}</span> },
    { key: 'updated', header: 'Updated', render: (a) => <span className="text-[13px] text-ink-500">{formatDateTime(a.lastUpdatedAt)}</span> },
  ]

  return (
    <div className="mx-auto max-w-[1200px] space-y-6 p-6">
      <PageHeader
        icon={<Mic className="size-5" />}
        title="Voice Agent Builder"
        description="JEXA.AI-internal — configure and operate every customer's Jaan."
      />
      <DataTable
        columns={columns}
        data={agents.data ?? []}
        keyExtractor={(a) => a.id}
        loading={agents.loading}
        emptyState={<EmptyState icon={<PhoneCall className="size-6" />} title="No voice agents yet" description="Provision one from Settings → Developer → JEXA.AI Provisioning." />}
      />
    </div>
  )
}
