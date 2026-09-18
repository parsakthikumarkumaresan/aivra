import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, FileSpreadsheet, CheckCircle2, Send, Clock, Eye } from 'lucide-react'
import { useAsync } from '@/hooks/useAsync'
import { quotesService } from '@/services/api'
import type { Quote, QuoteStatus } from '@/services/api'
import {
  PageHeader,
  Button,
  Card,
  CardBody,
  Badge,
  SearchInput,
  Skeleton,
  EmptyState,
  ErrorState,
} from '@/components/ui'
import { formatDate, formatCurrency } from '@/utils/format'
import { QUOTE_STATUS_LABEL, QUOTE_STATUS_TONE } from './quoteStatusMeta'

export default function AdminQuotesPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<QuoteStatus | 'all'>('all')

  const quotesAsync = useAsync(
    () =>
      quotesService.list({
        search: search || undefined,
        status: selectedStatus === 'all' ? undefined : selectedStatus,
        pageSize: 50,
      }),
    [search, selectedStatus]
  )

  const items: Quote[] = quotesAsync.data?.items ?? []

  // Derived metrics from quotes
  const metrics = useMemo(() => {
    const total = items.length
    const drafts = items.filter((q) => q.status === 'draft').length
    const sent = items.filter((q) => q.status === 'sent').length
    const accepted = items.filter((q) => q.status === 'accepted')
    const acceptedTotal = accepted.reduce((sum, q) => sum + q.total, 0)
    return { total, drafts, sent, acceptedCount: accepted.length, acceptedTotal }
  }, [items])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quote Management"
        description="Internal quotation system, commercial proposal tracking, and quote calculator."
        actions={
          <Button
            variant="primary"
            icon={<Plus className="size-4" />}
            onClick={() => navigate('/admin/quotes/new')}
          >
            Create Quote
          </Button>
        }
      />

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardBody className="flex items-center gap-3 p-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-ink-100 text-ink-600">
              <FileSpreadsheet className="size-5" />
            </div>
            <div>
              <p className="text-[11.5px] font-medium text-ink-500">Total Quotes</p>
              <p className="text-xl font-bold text-ink-900">{metrics.total}</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex items-center gap-3 p-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
              <Clock className="size-5" />
            </div>
            <div>
              <p className="text-[11.5px] font-medium text-ink-500">Draft Proposals</p>
              <p className="text-xl font-bold text-ink-900">{metrics.drafts}</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex items-center gap-3 p-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
              <Send className="size-5" />
            </div>
            <div>
              <p className="text-[11.5px] font-medium text-ink-500">Sent / Pending</p>
              <p className="text-xl font-bold text-ink-900">{metrics.sent}</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex items-center gap-3 p-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="size-5" />
            </div>
            <div>
              <p className="text-[11.5px] font-medium text-ink-500">Accepted Pipeline</p>
              <p className="text-xl font-bold text-ink-900">
                {formatCurrency(metrics.acceptedTotal, 'INR')}
              </p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Filter & Search Bar */}
      <Card>
        <CardBody className="p-4 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-1.5">
              {(['all', 'draft', 'sent', 'accepted', 'rejected'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setSelectedStatus(st)}
                  className={`rounded-md px-3 py-1.5 text-[12.5px] font-medium transition-colors ${
                    selectedStatus === st
                      ? 'bg-brand-600 text-white'
                      : 'bg-ink-100 text-ink-600 hover:bg-ink-200 hover:text-ink-900'
                  }`}
                >
                  {st === 'all' ? 'All Quotes' : QUOTE_STATUS_LABEL[st]}
                </button>
              ))}
            </div>

            <div className="w-full sm:w-72">
              <SearchInput
                placeholder="Search quote number, title…"
                value={search}
                onChange={setSearch}
              />
            </div>
          </div>

          {/* Quotes Table */}
          {quotesAsync.loading ? (
            <div className="space-y-3 py-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : quotesAsync.error ? (
            <ErrorState title="Failed to load quotes" onRetry={quotesAsync.refetch} />
          ) : items.length === 0 ? (
            <EmptyState
              icon={<FileSpreadsheet className="size-8" />}
              title="No quotes found"
              description={
                search || selectedStatus !== 'all'
                  ? 'Try adjusting your filters or search terms.'
                  : 'Get started by creating the first quotation.'
              }
              action={
                <Button
                  size="sm"
                  variant="primary"
                  icon={<Plus className="size-3.5" />}
                  onClick={() => navigate('/admin/quotes/new')}
                >
                  Create Quote
                </Button>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead>
                  <tr className="border-b border-ink-200 text-[11.5px] font-semibold uppercase tracking-wider text-ink-400">
                    <th className="pb-2.5 pl-2">Quote</th>
                    <th className="pb-2.5">Scope / Title</th>
                    <th className="pb-2.5 text-right">Setup Fee</th>
                    <th className="pb-2.5 text-right">Recurring Fee</th>
                    <th className="pb-2.5">Voice Minutes</th>
                    <th className="pb-2.5">Status</th>
                    <th className="pb-2.5">Valid Until</th>
                    <th className="pb-2.5 text-right pr-2">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {items.map((quote) => {
                    const setupFee = quote.lineItems
                      .filter((i) => i.category === 'implementation' || i.category === 'integrations' || i.category === 'development')
                      .reduce((sum, i) => sum + i.amount, 0)

                    const recurringFee = quote.lineItems
                      .filter((i) => i.category === 'platform')
                      .reduce((sum, i) => sum + i.amount, 0)

                    return (
                      <tr
                        key={quote.id}
                        className="group hover:bg-ink-50 transition-colors"
                      >
                        <td className="py-3.5 pl-2 font-mono font-medium text-brand-600">
                          <Link
                            to={`/admin/quotes/${quote.id}`}
                            className="hover:underline flex items-center gap-1"
                          >
                            {quote.quoteNumber}
                          </Link>
                        </td>
                        <td className="py-3.5">
                          <p className="font-semibold text-ink-900">{quote.title}</p>
                          <p className="text-[11.5px] text-ink-400">
                            Org: {quote.organizationId}
                          </p>
                        </td>
                        <td className="py-3.5 text-right font-medium text-ink-900">
                          {formatCurrency(setupFee, quote.currency)}
                        </td>
                        <td className="py-3.5 text-right text-ink-700">
                          {recurringFee > 0
                            ? `${formatCurrency(recurringFee, quote.currency)}/mo`
                            : '—'}
                        </td>
                        <td className="py-3.5 text-ink-600">
                          {quote.includedVoiceMinutes > 0 ? (
                            <div>
                              <span>{quote.includedVoiceMinutes.toLocaleString()} mins</span>
                              {quote.additionalMinuteRate > 0 && (
                                <span className="block text-[11px] text-ink-400">
                                  +₹{quote.additionalMinuteRate}/min overage
                                </span>
                              )}
                            </div>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="py-3.5">
                          <Badge tone={QUOTE_STATUS_TONE[quote.status]} dot>
                            {QUOTE_STATUS_LABEL[quote.status]}
                          </Badge>
                        </td>
                        <td className="py-3.5 text-ink-500">
                          {formatDate(quote.validUntil)}
                        </td>
                        <td className="py-3.5 text-right pr-2">
                          <Link to={`/admin/quotes/${quote.id}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-80 group-hover:opacity-100"
                              icon={<Eye className="size-3.5" />}
                            >
                              View
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
