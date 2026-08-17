import { Link } from 'react-router-dom'
import { AlertTriangle, Clock, CheckCircle2, XCircle, MessageCircleQuestion, Users, Mic, ExternalLink } from 'lucide-react'
import type { Approval } from '@/types'
import { Card, CardBody } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import type { BadgeTone } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatDateTime, formatRelativeTime } from '@/utils/format'

const RISK_TONE: Record<Approval['risk'], BadgeTone> = { low: 'success', medium: 'warning', high: 'danger' }
const EMPLOYEE_ICON = { hr: Users, voice: Mic }

interface ApprovalCardProps {
  approval: Approval
  onApprove?: () => void
  onReject?: () => void
  onRequestInfo?: () => void
}

export function ApprovalCard({ approval, onApprove, onReject, onRequestInfo }: ApprovalCardProps) {
  const Icon = EMPLOYEE_ICON[approval.employeeType]
  const isPending = approval.status === 'pending'

  return (
    <Card>
      <CardBody className="space-y-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <Icon className="size-4" />
            </span>
            <div>
              <p className="text-[13.5px] font-semibold text-ink-900">{approval.requestedAction}</p>
              <Link to={approval.affectedRecordHref} className="mt-0.5 flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700">
                {approval.affectedRecordLabel}
                <ExternalLink className="size-3" />
              </Link>
            </div>
          </div>
          <Badge tone={RISK_TONE[approval.risk]} icon={approval.risk === 'high' ? <AlertTriangle className="size-3" /> : undefined}>
            {approval.risk === 'high' ? 'High Risk' : approval.risk === 'medium' ? 'Medium Risk' : 'Low Risk'}
          </Badge>
        </div>

        <p className="text-[13px] leading-relaxed text-ink-600">{approval.reason}</p>

        {approval.evidence.length > 0 && (
          <ul className="space-y-1 rounded-lg bg-ink-25 p-3">
            {approval.evidence.map((e, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-ink-600">
                <span className="mt-1 size-1 shrink-0 rounded-full bg-ink-400" />
                {e}
              </li>
            ))}
          </ul>
        )}

        <div className="flex items-center justify-between text-xs text-ink-400">
          <span className="flex items-center gap-1.5">
            <Clock className="size-3.5" />
            Requested {formatRelativeTime(approval.requestedAt)}
          </span>
          {isPending ? (
            <span>Expires {formatDateTime(approval.expiresAt)}</span>
          ) : (
            <span>
              {approval.status === 'approved' ? 'Approved' : approval.status === 'rejected' ? 'Rejected' : 'Decided'} by {approval.decidedBy}
            </span>
          )}
        </div>

        {!isPending && approval.decisionNote && (
          <div
            className={`flex items-start gap-2 rounded-lg px-3 py-2.5 text-[13px] ${
              approval.status === 'approved' ? 'bg-success-50 text-success-700' : 'bg-danger-50 text-danger-700'
            }`}
          >
            {approval.status === 'approved' ? <CheckCircle2 className="mt-0.5 size-3.5 shrink-0" /> : <XCircle className="mt-0.5 size-3.5 shrink-0" />}
            {approval.decisionNote}
          </div>
        )}

        {isPending && (
          <div className="flex flex-wrap items-center gap-2 border-t border-ink-100 pt-3.5">
            <Button size="sm" icon={<CheckCircle2 className="size-3.5" />} onClick={onApprove}>
              Approve
            </Button>
            <Button size="sm" variant="outline" icon={<XCircle className="size-3.5" />} onClick={onReject}>
              Reject
            </Button>
            <Button size="sm" variant="ghost" icon={<MessageCircleQuestion className="size-3.5" />} onClick={onRequestInfo}>
              Request More Information
            </Button>
          </div>
        )}
      </CardBody>
    </Card>
  )
}
