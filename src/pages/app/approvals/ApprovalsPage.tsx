import { useState } from 'react'
import { CheckSquare, Inbox } from 'lucide-react'
import { useSetBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { useApprovals } from '@/hooks/useApprovals'
import { useToast } from '@/hooks/useToast'
import { approvalsService } from '@/services/api'
import { PageHeader } from '@/components/ui/PageHeader'
import { PillTabs } from '@/components/ui/Tabs'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Field'
import { ApprovalCard } from '@/components/approvals/ApprovalCard'
import type { Approval } from '@/types'

export default function ApprovalsPage() {
  useSetBreadcrumbs([{ label: 'Approvals' }])
  const approvals = useApprovals()
  const { show } = useToast()
  const [view, setView] = useState<'pending' | 'history'>('pending')

  const [confirmTarget, setConfirmTarget] = useState<{ approval: Approval; action: 'approved' | 'rejected' } | null>(null)
  const [infoTarget, setInfoTarget] = useState<Approval | null>(null)
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)

  const pending = (approvals.data ?? []).filter((a) => a.status === 'pending')
  const history = (approvals.data ?? []).filter((a) => a.status !== 'pending')

  async function confirmDecision() {
    if (!confirmTarget) return
    setBusy(true)
    await approvalsService.decide(
      confirmTarget.approval.id,
      confirmTarget.action,
      confirmTarget.action === 'approved' ? 'Approved by reviewer.' : 'Rejected by reviewer.',
    )
    setBusy(false)
    setConfirmTarget(null)
    show({ tone: confirmTarget.action === 'approved' ? 'success' : 'info', title: confirmTarget.action === 'approved' ? 'Approved' : 'Rejected' })
    approvals.refetch()
  }

  async function submitInfoRequest() {
    if (!infoTarget) return
    setBusy(true)
    await approvalsService.decide(infoTarget.id, 'info_requested', note || 'More information requested.')
    setBusy(false)
    setInfoTarget(null)
    setNote('')
    show({ tone: 'info', title: 'Information requested', description: `${infoTarget.employeeName} has been notified.` })
    approvals.refetch()
  }

  return (
    <div className="space-y-5">
      <PageHeader
        icon={<CheckSquare className="size-5" />}
        title="Approvals"
        description="Consequential actions from your AI Employees, waiting on a human decision."
      />

      <PillTabs
        items={[
          { value: 'pending', label: `Pending (${pending.length})` },
          { value: 'history', label: 'History' },
        ]}
        value={view}
        onChange={(v) => setView(v as 'pending' | 'history')}
      />

      {approvals.loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      ) : view === 'pending' ? (
        pending.length === 0 ? (
          <EmptyState icon={<Inbox className="size-6" />} title="No approvals pending" description="You're all caught up — new requests will appear here." />
        ) : (
          <div className="space-y-4">
            {pending.map((a) => (
              <ApprovalCard
                key={a.id}
                approval={a}
                onApprove={() => setConfirmTarget({ approval: a, action: 'approved' })}
                onReject={() => setConfirmTarget({ approval: a, action: 'rejected' })}
                onRequestInfo={() => setInfoTarget(a)}
              />
            ))}
          </div>
        )
      ) : history.length === 0 ? (
        <EmptyState icon={<Inbox className="size-6" />} title="No approval history yet" />
      ) : (
        <div className="space-y-4">
          {history.map((a) => (
            <ApprovalCard key={a.id} approval={a} />
          ))}
        </div>
      )}

      <ConfirmationDialog
        open={Boolean(confirmTarget)}
        onClose={() => setConfirmTarget(null)}
        onConfirm={confirmDecision}
        loading={busy}
        destructive={confirmTarget?.action === 'rejected' || confirmTarget?.approval.risk === 'high'}
        title={confirmTarget?.action === 'approved' ? 'Approve this action?' : 'Reject this action?'}
        description={
          confirmTarget?.approval.risk === 'high'
            ? `This is a high-risk action: "${confirmTarget.approval.requestedAction}". Once approved, ${confirmTarget.approval.employeeName} will execute it immediately.`
            : `${confirmTarget?.approval.employeeName} requested: "${confirmTarget?.approval.requestedAction}".`
        }
        confirmLabel={confirmTarget?.action === 'approved' ? 'Approve' : 'Reject'}
      />

      <Modal
        open={Boolean(infoTarget)}
        onClose={() => setInfoTarget(null)}
        title="Request more information"
        description={infoTarget ? `Ask ${infoTarget.employeeName} for clarification before deciding.` : undefined}
        footer={
          <>
            <Button variant="outline" onClick={() => setInfoTarget(null)} disabled={busy}>
              Cancel
            </Button>
            <Button onClick={submitInfoRequest} loading={busy} disabled={!note.trim()}>
              Send Request
            </Button>
          </>
        }
      >
        <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="What additional information do you need?" />
      </Modal>
    </div>
  )
}
