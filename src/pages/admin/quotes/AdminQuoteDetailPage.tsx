import { useState, useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Send,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Printer,
  Building2,
  Clock,
  FileSpreadsheet,
  Sparkles,
} from 'lucide-react'
import { useAsync } from '@/hooks/useAsync'
import { useToast } from '@/hooks/useToast'
import {
  adminOrganizationsService,
  adminService,
  quotesService,
} from '@/services/api'
import {
  PageHeader,
  Button,
  Card,
  CardHeader,
  CardBody,
  Badge,
  Skeleton,
  ErrorState,
  ConfirmationDialog,
  Modal,
} from '@/components/ui'
import { Input, Label, Textarea } from '@/components/ui/Field'
import { LogoMark } from '@/components/ui/Logo'
import { formatDate, formatDateTime, formatCurrency } from '@/utils/format'
import {
  QUOTE_STATUS_LABEL,
  QUOTE_STATUS_TONE,
  QUOTE_CATEGORY_LABEL,
} from './quoteStatusMeta'

export default function AdminQuoteDetailPage() {
  const { quoteId } = useParams<{ quoteId: string }>()
  const navigate = useNavigate()
  const { show } = useToast()

  const [activeTab, setActiveTab] = useState<'breakdown' | 'preview'>('breakdown')

  // Action Dialog States
  const [sendOpen, setSendOpen] = useState(false)
  const [recipientEmail, setRecipientEmail] = useState('')
  const [recipientName, setRecipientName] = useState('')
  const [sending, setSending] = useState(false)

  const [acceptOpen, setAcceptOpen] = useState(false)
  const [accepting, setAccepting] = useState(false)

  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [rejecting, setRejecting] = useState(false)

  const quoteAsync = useAsync(() => quotesService.get(quoteId!), [quoteId])
  const quote = quoteAsync.data

  // Fetch organization name
  const orgAsync = useAsync(
    () => (quote?.organizationId ? adminOrganizationsService.get(quote.organizationId) : Promise.resolve(null)),
    [quote?.organizationId]
  )

  // Fetch lead if linked
  const leadAsync = useAsync(
    () => (quote?.leadId ? adminService.getLead(quote.leadId) : Promise.resolve(null)),
    [quote?.leadId]
  )

  // Set default recipient email from lead or org
  useMemo(() => {
    if (leadAsync.data?.contactEmail && !recipientEmail) {
      setRecipientEmail(leadAsync.data.contactEmail)
      setRecipientName(leadAsync.data.contactName)
    }
  }, [leadAsync.data])

  if (quoteAsync.loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (quoteAsync.error || !quote) {
    return (
      <ErrorState
        title="Quote not found"
        description="The requested quotation does not exist or has been removed."
        onRetry={quoteAsync.refetch}
      />
    )
  }

  async function handleSendQuote() {
    setSending(true)
    try {
      const res = await quotesService.send(quote!.id, {
        recipientEmail: recipientEmail.trim() || undefined,
        recipientName: recipientName.trim() || undefined,
      })
      if (res.emailSent) {
        show({
          tone: 'success',
          title: 'Quote sent successfully',
          description: `Dispatched email to ${recipientEmail}`,
        })
      } else {
        show({
          tone: 'info',
          title: 'Quote status marked as Sent',
          description: res.emailError || 'Quote marked as sent (honest email reporting).',
        })
      }
      setSendOpen(false)
      quoteAsync.refetch()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not send quote'
      show({ tone: 'error', title: 'Send failed', description: msg })
    } finally {
      setSending(false)
    }
  }

  async function handleAcceptQuote() {
    setAccepting(true)
    try {
      await quotesService.transition(quote!.id, { targetStatus: 'accepted' })
      show({ tone: 'success', title: 'Quote accepted by customer' })
      setAcceptOpen(false)
      quoteAsync.refetch()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not accept quote'
      show({ tone: 'error', title: 'Action failed', description: msg })
    } finally {
      setAccepting(false)
    }
  }

  async function handleRejectQuote() {
    setRejecting(true)
    try {
      await quotesService.transition(quote!.id, {
        targetStatus: 'rejected',
        rejectionReason: rejectionReason.trim() || undefined,
      })
      show({ tone: 'info', title: 'Quote marked as rejected' })
      setRejectOpen(false)
      quoteAsync.refetch()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not reject quote'
      show({ tone: 'error', title: 'Action failed', description: msg })
    } finally {
      setRejecting(false)
    }
  }

  const customerName = orgAsync.data?.name || leadAsync.data?.companyName || quote.organizationId

  return (
    <div className="space-y-6 pb-12">
      <button
        type="button"
        onClick={() => navigate('/admin/quotes')}
        className="flex items-center gap-1.5 text-[12.5px] font-medium text-ink-500 hover:text-ink-800 transition-colors"
      >
        <ArrowLeft className="size-3.5" /> Back to Quotes
      </button>

      {/* Header with Title & State Transitions */}
      <PageHeader
        title={quote.title}
        description={`Quote Reference: ${quote.quoteNumber} · Valid until ${formatDate(quote.validUntil)}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={QUOTE_STATUS_TONE[quote.status]} dot className="text-[12px] px-2.5 py-1">
              {QUOTE_STATUS_LABEL[quote.status]}
            </Badge>

            {quote.status === 'draft' && (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Send className="size-3.5" />}
                  onClick={() => setSendOpen(true)}
                >
                  Send Quote
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  icon={<XCircle className="size-3.5" />}
                  onClick={() => setRejectOpen(true)}
                >
                  Reject
                </Button>
              </>
            )}

            {quote.status === 'sent' && (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<CheckCircle2 className="size-3.5" />}
                  onClick={() => setAcceptOpen(true)}
                >
                  Mark Accepted
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  icon={<XCircle className="size-3.5" />}
                  onClick={() => setRejectOpen(true)}
                >
                  Reject
                </Button>
              </>
            )}
          </div>
        }
      />

      {/* Context Information Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardBody className="p-4 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">
                Customer Organization
              </span>
              <Building2 className="size-4 text-ink-400" />
            </div>
            <p className="font-semibold text-ink-900">{customerName}</p>
            <Link
              to={`/admin/customers/${quote.organizationId}`}
              className="inline-flex items-center gap-1 text-[12px] font-medium text-brand-600 hover:underline"
            >
              View Customer Directory <ExternalLink className="size-3" />
            </Link>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">
                Discovery & Lead
              </span>
              <FileSpreadsheet className="size-4 text-ink-400" />
            </div>
            {quote.leadId ? (
              <>
                <p className="font-semibold text-ink-900">
                  {leadAsync.data?.contactName || quote.leadId}
                </p>
                <Link
                  to={`/admin/leads/${quote.leadId}`}
                  className="inline-flex items-center gap-1 text-[12px] font-medium text-brand-600 hover:underline"
                >
                  View Lead & VoiceProject <ExternalLink className="size-3" />
                </Link>
              </>
            ) : (
              <p className="text-[12.5px] text-ink-500">Directly created proposal</p>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">
                Lifecycle Timestamps
              </span>
              <Clock className="size-4 text-ink-400" />
            </div>
            <div className="text-[12px] text-ink-600 space-y-0.5">
              <p>Created: {formatDateTime(quote.createdAt)}</p>
              {quote.sentAt && <p>Sent: {formatDateTime(quote.sentAt)}</p>}
              {quote.acceptedAt && (
                <p className="text-emerald-600 font-medium">
                  Accepted: {formatDateTime(quote.acceptedAt)}
                </p>
              )}
              {quote.rejectedAt && (
                <p className="text-danger-600 font-medium">
                  Rejected: {formatDateTime(quote.rejectedAt)}
                  {quote.rejectionReason && ` (${quote.rejectionReason})`}
                </p>
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* View Mode Tabs */}
      <div className="flex items-center gap-2 border-b border-ink-200 pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('breakdown')}
          className={`pb-2 px-3 text-[13.5px] font-medium border-b-2 transition-colors ${
            activeTab === 'breakdown'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-ink-500 hover:text-ink-900'
          }`}
        >
          Commercial Breakdown & Overrides
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          className={`pb-2 px-3 text-[13.5px] font-medium border-b-2 transition-colors ${
            activeTab === 'preview'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-ink-500 hover:text-ink-900'
          }`}
        >
          Customer-Facing Proposal Preview
        </button>
      </div>

      {/* Tab 1: Commercial Breakdown */}
      {activeTab === 'breakdown' && (
        <div className="space-y-6">
          <Card>
            <CardHeader
              title="Deliverables & Pricing Breakdown"
              description="Itemized snapshot permanently stored on this quotation record."
            />
            <CardBody className="space-y-6">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[13px]">
                  <thead>
                    <tr className="border-b border-ink-200 text-[11px] font-semibold uppercase tracking-wider text-ink-400">
                      <th className="pb-2.5 pl-2">Category</th>
                      <th className="pb-2.5">Deliverable Description</th>
                      <th className="pb-2.5 text-right">Quantity</th>
                      <th className="pb-2.5">Unit</th>
                      <th className="pb-2.5 text-right">Unit Price</th>
                      <th className="pb-2.5 text-right pr-2">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-100">
                    {quote.lineItems.map((item) => (
                      <tr key={item.id} className="hover:bg-ink-50/50">
                        <td className="py-3 pl-2">
                          <span className="rounded bg-ink-100 px-2 py-0.5 text-[11px] font-medium text-ink-700">
                            {QUOTE_CATEGORY_LABEL[item.category] || item.category}
                          </span>
                        </td>
                        <td className="py-3 font-medium text-ink-900">
                          {item.description}
                        </td>
                        <td className="py-3 text-right text-ink-700">
                          {item.quantity}
                        </td>
                        <td className="py-3 text-ink-500">{item.unit}</td>
                        <td className="py-3 text-right text-ink-700">
                          {formatCurrency(item.unitPrice, quote.currency)}
                        </td>
                        <td className="py-3 text-right font-semibold text-ink-900 pr-2">
                          {formatCurrency(item.amount, quote.currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Commercial Totals & Comparison */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 border-t border-ink-200 pt-6">
                {/* Voice Credits & Calculator Estimate Info */}
                <div className="space-y-4">
                  <div className="rounded-xl border border-ink-200 bg-ink-50/50 p-4 space-y-2">
                    <p className="text-[12px] font-semibold uppercase tracking-wider text-ink-500">
                      Voice Minutes Allocation
                    </p>
                    <div className="flex items-center justify-between text-[13px]">
                      <span className="text-ink-600">Included Starter Minutes:</span>
                      <span className="font-bold text-ink-900">
                        {quote.includedVoiceMinutes.toLocaleString()} minutes
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[13px]">
                      <span className="text-ink-600">Additional Usage Rate:</span>
                      <span className="font-bold text-ink-900">
                        ₹{quote.additionalMinuteRate}/minute
                      </span>
                    </div>
                  </div>

                  {/* Calculator Snapshot Comparison */}
                  {quote.estimatedSetupFee !== null && (
                    <div className="rounded-xl border border-brand-600/20 bg-brand-50/10 p-4 space-y-2 text-[12.5px]">
                      <div className="flex items-center gap-1.5 text-brand-600 font-semibold">
                        <Sparkles className="size-3.5" />
                        <span>Calculator Estimate vs Final Quoted Snapshot</span>
                      </div>
                      <div className="flex justify-between text-ink-600">
                        <span>Original Estimated Setup:</span>
                        <span className="font-medium text-ink-900">
                          {formatCurrency(quote.estimatedSetupFee, quote.currency)}
                        </span>
                      </div>
                      <div className="flex justify-between text-ink-600">
                        <span>Original Estimated Recurring:</span>
                        <span className="font-medium text-ink-900">
                          {formatCurrency(quote.estimatedRecurringFee || 0, quote.currency)}/mo
                        </span>
                      </div>
                      <p className="text-[11px] text-ink-400 italic pt-1">
                        Commercial values are permanently snapshotted and unaffected by future pricing engine changes.
                      </p>
                    </div>
                  )}
                </div>

                {/* Totals Table */}
                <div className="rounded-xl bg-ink-50 p-4 border border-ink-200 space-y-2.5 text-[13px] self-start">
                  <div className="flex justify-between text-ink-600">
                    <span>Subtotal</span>
                    <span className="font-medium text-ink-900">
                      {formatCurrency(quote.subtotal, quote.currency)}
                    </span>
                  </div>

                  {quote.discount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Admin Discount</span>
                      <span>-{formatCurrency(quote.discount, quote.currency)}</span>
                    </div>
                  )}

                  {quote.taxRate > 0 && (
                    <div className="flex justify-between text-ink-600">
                      <span>Tax ({quote.taxRate}%)</span>
                      <span>{formatCurrency(quote.taxAmount, quote.currency)}</span>
                    </div>
                  )}

                  <div className="border-t border-ink-200 pt-2 flex justify-between items-baseline">
                    <span className="font-bold text-ink-900">Final Quoted Investment</span>
                    <span className="text-xl font-bold text-brand-600">
                      {formatCurrency(quote.total, quote.currency)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes & Terms */}
              {(quote.notes || quote.terms) && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 border-t border-ink-200 pt-6">
                  {quote.notes && (
                    <div>
                      <p className="text-[11.5px] font-semibold uppercase tracking-wider text-ink-400">
                        Commercial Notes
                      </p>
                      <p className="mt-1 text-[13px] text-ink-700 whitespace-pre-wrap">
                        {quote.notes}
                      </p>
                    </div>
                  )}
                  {quote.terms && (
                    <div>
                      <p className="text-[11.5px] font-semibold uppercase tracking-wider text-ink-400">
                        Commercial Terms & Conditions
                      </p>
                      <p className="mt-1 text-[13px] text-ink-700 whitespace-pre-wrap">
                        {quote.terms}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      )}

      {/* Tab 2: Customer-Facing Proposal Preview */}
      {activeTab === 'preview' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              icon={<Printer className="size-3.5" />}
              onClick={() => window.print()}
            >
              Print / Export Document
            </Button>
          </div>

          <div className="rounded-2xl border border-ink-200 bg-surface p-8 sm:p-12 shadow-elevated max-w-4xl mx-auto space-y-8 print:p-0 print:border-none print:shadow-none">
            {/* Document Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between border-b border-ink-200 pb-8 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <LogoMark size={32} />
                  <span className="text-2xl font-black tracking-tight text-ink-900">
                    JEXA<span className="text-brand-600">.AI</span>
                  </span>
                </div>
                <p className="text-[12px] text-ink-500">
                  AI Workforce Operating System · Enterprise Solutions
                </p>
              </div>

              <div className="text-left sm:text-right space-y-1">
                <p className="text-xs font-mono uppercase tracking-widest text-brand-600 font-bold">
                  COMMERCIAL PROPOSAL
                </p>
                <p className="text-xl font-mono font-bold text-ink-900">
                  {quote.quoteNumber}
                </p>
                <p className="text-[12px] text-ink-500">
                  Issue Date: {formatDate(quote.createdAt)}
                </p>
                <p className="text-[12px] text-ink-500">
                  Valid Until: {formatDate(quote.validUntil)}
                </p>
              </div>
            </div>

            {/* Client Context */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-[13px]">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">
                  PREPARED FOR:
                </p>
                <p className="text-base font-bold text-ink-900 mt-1">{customerName}</p>
                {leadAsync.data?.contactName && (
                  <p className="text-ink-600">Attn: {leadAsync.data.contactName}</p>
                )}
                {leadAsync.data?.contactEmail && (
                  <p className="text-ink-500">{leadAsync.data.contactEmail}</p>
                )}
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">
                  PROJECT SCOPE:
                </p>
                <p className="text-base font-bold text-ink-900 mt-1">{quote.title}</p>
                <p className="text-ink-600">Solution: Jaan Autonomous Voice AI Employee</p>
              </div>
            </div>

            {/* Deliverables Scope Table */}
            <div className="space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">
                PROPOSED DELIVERABLES & SERVICES
              </p>
              <div className="overflow-hidden rounded-xl border border-ink-200">
                <table className="w-full text-left text-[13px]">
                  <thead className="bg-ink-50 border-b border-ink-200 text-[11px] font-semibold text-ink-500 uppercase">
                    <tr>
                      <th className="py-2.5 pl-4">Item & Description</th>
                      <th className="py-2.5 text-center w-24">Qty</th>
                      <th className="py-2.5 text-right w-32">Unit Rate</th>
                      <th className="py-2.5 text-right pr-4 w-36">Investment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-100">
                    {quote.lineItems.map((item) => (
                      <tr key={item.id}>
                        <td className="py-3.5 pl-4">
                          <p className="font-semibold text-ink-900">{item.description}</p>
                          <span className="text-[11px] text-ink-400">
                            {QUOTE_CATEGORY_LABEL[item.category] || item.category}
                          </span>
                        </td>
                        <td className="py-3.5 text-center text-ink-700">
                          {item.quantity} {item.unit}
                        </td>
                        <td className="py-3.5 text-right text-ink-700">
                          {formatCurrency(item.unitPrice, quote.currency)}
                        </td>
                        <td className="py-3.5 text-right font-bold text-ink-900 pr-4">
                          {formatCurrency(item.amount, quote.currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Document Totals */}
            <div className="flex justify-end pt-2">
              <div className="w-full sm:w-80 rounded-xl bg-ink-50 p-4 border border-ink-200 space-y-2 text-[13px]">
                <div className="flex justify-between text-ink-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-ink-900">
                    {formatCurrency(quote.subtotal, quote.currency)}
                  </span>
                </div>
                {quote.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Discount</span>
                    <span>-{formatCurrency(quote.discount, quote.currency)}</span>
                  </div>
                )}
                {quote.taxRate > 0 && (
                  <div className="flex justify-between text-ink-600">
                    <span>GST ({quote.taxRate}%)</span>
                    <span>{formatCurrency(quote.taxAmount, quote.currency)}</span>
                  </div>
                )}
                <div className="border-t border-ink-200 pt-2 flex justify-between items-baseline">
                  <span className="font-bold text-ink-900">Total Investment</span>
                  <span className="text-xl font-bold text-brand-600">
                    {formatCurrency(quote.total, quote.currency)}
                  </span>
                </div>
              </div>
            </div>

            {/* Voice Usage Terms */}
            {quote.includedVoiceMinutes > 0 && (
              <div className="rounded-xl border border-ink-200 bg-ink-50 p-4 text-[12.5px] text-ink-700 space-y-1">
                <p className="font-semibold text-ink-900">Voice Usage Terms:</p>
                <p>
                  Includes <strong>{quote.includedVoiceMinutes.toLocaleString()} minutes</strong> of
                  autonomous conversation processing. Additional voice usage billed at{' '}
                  <strong>₹{quote.additionalMinuteRate} per minute</strong> via automatic recharge.
                </p>
              </div>
            )}

            {/* Terms & Conditions */}
            {quote.terms && (
              <div className="space-y-1.5 pt-2 border-t border-ink-200 text-[12px] text-ink-600">
                <p className="font-semibold uppercase tracking-wider text-ink-700">
                  Terms & Conditions
                </p>
                <p className="whitespace-pre-wrap leading-relaxed">{quote.terms}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Send Quote Dialog */}
      <Modal
        open={sendOpen}
        onClose={() => setSendOpen(false)}
        title="Send Quotation to Customer"
        description="This will transition the proposal to SENT and dispatch the quotation document to the prospect."
        footer={
          <>
            <Button variant="outline" onClick={() => setSendOpen(false)} disabled={sending}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSendQuote} loading={sending}>
              Send Quotation
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-left">
          <div>
            <Label htmlFor="send-email">Recipient Email *</Label>
            <Input
              id="send-email"
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="prospect@company.com"
            />
          </div>
          <div>
            <Label htmlFor="send-name">Recipient Name</Label>
            <Input
              id="send-name"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="Primary Decision Maker"
            />
          </div>
          <p className="text-[11.5px] text-ink-400">
            Note: If SMTP is unconfigured in your environment, the quotation will still be safely transitioned to Sent with honest status reporting.
          </p>
        </div>
      </Modal>

      {/* Accept Quote Dialog */}
      <ConfirmationDialog
        open={acceptOpen}
        onClose={() => setAcceptOpen(false)}
        onConfirm={handleAcceptQuote}
        title="Mark Quote as Accepted?"
        description="The commercial proposal will transition to ACCEPTED. This locks the commercial values and records acceptance timestamp."
        confirmLabel="Accept Quote"
        loading={accepting}
      />

      {/* Reject Quote Dialog */}
      <Modal
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        title="Reject this Quote?"
        description="The quotation will be marked as REJECTED. This is an authoritative backend state transition."
        footer={
          <>
            <Button variant="outline" onClick={() => setRejectOpen(false)} disabled={rejecting}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleRejectQuote} loading={rejecting}>
              Reject Quote
            </Button>
          </>
        }
      >
        <div className="text-left">
          <Label htmlFor="rej-reason">Rejection Reason</Label>
          <Textarea
            id="rej-reason"
            rows={2}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="e.g. Budget constraints, scope changes..."
          />
        </div>
      </Modal>
    </div>
  )
}
