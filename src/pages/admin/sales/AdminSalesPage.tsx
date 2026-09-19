import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Target, FileSpreadsheet, Send, CheckCircle2, ArrowRight } from 'lucide-react'
import { useAsync } from '@/hooks/useAsync'
import { adminService, quotesService } from '@/services/api'
import { PageHeader, KpiCard, Card, CardBody, ErrorState } from '@/components/ui'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatCurrency } from '@/utils/format'

// JEXA Admin — Sales (Admin Console business restructure). Groups Leads +
// Quotes under one business-pipeline view: Lead → Qualified → Quote →
// Accepted → Customer. Reuses the existing real Lead/Quote backends —
// no new pipeline model, no fabricated conversion data.
export default function AdminSalesPage() {
  const leads = useAsync(() => adminService.listLeads({ pageSize: 100 }), [])
  const quotes = useAsync(() => quotesService.list({ pageSize: 100 }), [])

  const metrics = useMemo(() => {
    const leadItems = leads.data?.items ?? []
    const quoteItems = quotes.data?.items ?? []
    const newLeads = leadItems.filter((l) => l.status === 'new').length
    const qualifiedLeads = leadItems.filter((l) => l.status === 'qualified').length
    const sentQuotes = quoteItems.filter((q) => q.status === 'sent').length
    const acceptedQuotes = quoteItems.filter((q) => q.status === 'accepted')
    const pipelineValue = quoteItems
      .filter((q) => q.status === 'draft' || q.status === 'sent')
      .reduce((sum, q) => sum + q.total, 0)
    return {
      newLeads,
      qualifiedLeads,
      sentQuotes,
      acceptedCount: acceptedQuotes.length,
      acceptedValue: acceptedQuotes.reduce((sum, q) => sum + q.total, 0),
      pipelineValue,
    }
  }, [leads.data, quotes.data])

  const loading = leads.loading || quotes.loading
  const error = leads.error || quotes.error

  return (
    <div className="space-y-6">
      <PageHeader title="Sales" description="Lead → Quote → Customer pipeline — real data from the Leads and Quotes systems." />

      {error ? (
        <ErrorState description={error.message} onRetry={() => { leads.refetch(); quotes.refetch() }} />
      ) : loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <KpiCard label="New Leads" value={String(metrics.newLeads)} icon={<Target className="size-4" />} />
          <KpiCard label="Qualified" value={String(metrics.qualifiedLeads)} icon={<Target className="size-4" />} />
          <KpiCard label="Quotes Sent" value={String(metrics.sentQuotes)} icon={<Send className="size-4" />} />
          <KpiCard label="Quotes Accepted" value={String(metrics.acceptedCount)} icon={<CheckCircle2 className="size-4" />} />
          <KpiCard label="Accepted Value" value={formatCurrency(metrics.acceptedValue)} icon={<FileSpreadsheet className="size-4" />} />
          <KpiCard label="Open Pipeline" value={formatCurrency(metrics.pipelineValue)} icon={<FileSpreadsheet className="size-4" />} tooltip="Draft + sent quotes not yet accepted or rejected." />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link to="/admin/leads">
          <Card className="h-full transition-colors hover:border-brand-600/50">
            <CardBody className="flex items-center justify-between p-6">
              <div>
                <h3 className="text-[15px] font-semibold text-ink-900">Leads</h3>
                <p className="mt-1 text-[13px] text-ink-500">Demo requests and Jaan customization inquiries.</p>
              </div>
              <ArrowRight className="size-4 text-ink-400" />
            </CardBody>
          </Card>
        </Link>
        <Link to="/admin/quotes">
          <Card className="h-full transition-colors hover:border-brand-600/50">
            <CardBody className="flex items-center justify-between p-6">
              <div>
                <h3 className="text-[15px] font-semibold text-ink-900">Quotes</h3>
                <p className="mt-1 text-[13px] text-ink-500">Commercial proposals and the quote calculator.</p>
              </div>
              <ArrowRight className="size-4 text-ink-400" />
            </CardBody>
          </Card>
        </Link>
      </div>
    </div>
  )
}
