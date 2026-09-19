import { Link } from 'react-router-dom'
import { PhoneCall, Info } from 'lucide-react'
import { useAsync } from '@/hooks/useAsync'
import { adminCallsService } from '@/services/api'
import { PageHeader, Badge, DataTable, ErrorState, EmptyState, Card, CardHeader, CardBody } from '@/components/ui'
import { formatDateTime } from '@/utils/format'

const PAGE_SIZE = 50

// JEXA Admin — Support (no dedicated phase number; see spec addendum).
//
// There is no ticketing backend anywhere in the platform — no model, no
// API. Per the "do not invent a ticketing backend just to remove Coming
// Soon" instruction, this page does not fabricate one. Instead it surfaces
// the one real, genuinely support-relevant signal that already exists:
// calls Jaan escalated to a human across every customer, with the real
// escalation reason. That's the honest "support overview" available from
// current data.
export default function AdminSupportPage() {
  const escalated = useAsync(
    () => adminCallsService.list({ escalated: true, page: 1, pageSize: PAGE_SIZE }),
    [],
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Support"
        description="Real escalated-call signal across every customer. There is no ticketing system yet — see the note below."
      />

      <Card>
        <CardHeader title="Escalated Calls" description="Calls Jaan handed off to a human, most recent first." />
        {escalated.error ? (
          <CardBody><ErrorState description={escalated.error.message} onRetry={escalated.refetch} /></CardBody>
        ) : (
          <DataTable
            columns={[
              {
                key: 'call',
                header: 'Call',
                render: (call) => (
                  <div>
                    <p className="font-mono text-[12.5px] text-ink-900">{call.id}</p>
                    <p className="text-xs text-ink-500">{call.callerNumber ?? 'Unknown number'}</p>
                  </div>
                ),
              },
              {
                key: 'customer',
                header: 'Customer',
                render: (call) => (
                  <div>
                    <p className="text-ink-700">{call.organizationName}</p>
                    <p className="text-xs text-ink-500">{call.agentName}</p>
                  </div>
                ),
              },
              {
                key: 'reason',
                header: 'Escalation Reason',
                render: (call) => <span className="text-ink-700">{call.escalationReason ?? 'No reason recorded'}</span>,
              },
              {
                key: 'status',
                header: 'Call Status',
                render: (call) => <Badge tone={call.status === 'failed' ? 'danger' : 'neutral'} dot>{call.status.replace('_', ' ')}</Badge>,
              },
              { key: 'startedAt', header: 'Started', render: (call) => formatDateTime(call.startedAt) },
              {
                key: 'action',
                header: '',
                render: (call) => (
                  <Link to={`/admin/calls/${call.id}`} className="text-[12.5px] font-medium text-brand-600 hover:text-brand-700">
                    View call →
                  </Link>
                ),
              },
            ]}
            data={escalated.data?.items ?? []}
            keyExtractor={(call) => call.id}
            loading={escalated.loading}
            emptyState={
              <EmptyState icon={<PhoneCall className="size-5" />} title="No escalated calls" description="Calls where Jaan handed off to a human will appear here." />
            }
          />
        )}
      </Card>

      <Card>
        <CardHeader title="What's not here" />
        <CardBody className="flex items-start gap-3">
          <Info className="mt-0.5 size-4 shrink-0 text-ink-400" />
          <p className="text-[13px] leading-relaxed text-ink-500">
            There is no support ticketing model or API anywhere in the backend — no ticket creation,
            assignment, status, or SLA tracking exists. Building that is a new product capability, not
            an admin view over existing data, so it isn't faked here. If ticketing becomes a real
            requirement, it needs its own backend model and workflow before an admin page can honestly
            represent it.
          </p>
        </CardBody>
      </Card>
    </div>
  )
}
