import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Database, Download, Trash2 } from 'lucide-react'
import { useSetBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { useAgentTable } from '@/hooks/useJaan'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'

export default function TableDetailPage() {
  const { id = '' } = useParams()
  const table = useAgentTable(id)
  useSetBreadcrumbs([{ label: 'Jaan', href: '/app/jaan' }, { label: 'Tables', href: '/app/jaan/tables' }, { label: table.data?.name ?? '…' }])

  if (table.loading) {
    return <div className="p-6"><Skeleton className="h-64 w-full" /></div>
  }
  if (!table.data) {
    return <div className="p-6"><ErrorState title="Table not found" onRetry={table.refetch} /></div>
  }

  const t = table.data

  return (
    <div className="mx-auto max-w-[1400px] space-y-5 p-6">
      <Link to="/app/jaan/tables" className="flex w-fit items-center gap-1.5 text-[13px] font-medium text-ink-500 hover:text-ink-800">
        <ArrowLeft className="size-3.5" /> Tables
      </Link>
      <PageHeader
        title={t.name}
        description={t.description}
        actions={<><Button variant="outline" icon={<Download className="size-3.5" />}>Export</Button><Button variant="danger" icon={<Trash2 className="size-3.5" />}>Delete</Button></>}
      />
      {t.rows.length === 0 ? (
        <Card>
          <EmptyState compact icon={<Database className="size-6" />} title="No rows yet" description="Import data or add a row for Jaan to look up during a call." />
        </Card>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-max border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-ink-100 bg-ink-25">
                {t.columns.map((c) => (
                  <th key={c.id} className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-ink-500">{c.name} <span className="normal-case text-ink-400">({c.type})</span></th>
                ))}
              </tr>
            </thead>
            <tbody>
              {t.rows.map((row, i) => (
                <tr key={i} className="border-b border-ink-100 last:border-0">
                  {t.columns.map((c) => (
                    <td key={c.id} className="px-5 py-3 text-ink-700">{row[c.id] ?? '—'}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}
