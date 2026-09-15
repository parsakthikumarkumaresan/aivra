import { LineChart, Line, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis } from 'recharts'
import { Gauge } from 'lucide-react'
import { useSetBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { useQaMetrics } from '@/hooks/useJaan'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card, CardHeader } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'

export default function MetricsPage() {
  useSetBreadcrumbs([{ label: 'Jaan', href: '/app/jaan' }, { label: 'Monitor & QA' }, { label: 'Metrics' }])
  const metrics = useQaMetrics()

  return (
    <div className="mx-auto max-w-[1500px] space-y-5 p-6">
      <PageHeader title="Metrics" description="Enterprise-level call quality, latency and reliability monitoring." />

      {metrics.loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-xl" />)}
        </div>
      ) : (metrics.data ?? []).length === 0 ? (
        <EmptyState icon={<Gauge className="size-6" />} title="No metrics yet" description="Quality and latency metrics will appear once calls start coming in." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(metrics.data ?? []).map((m) => (
            <Card key={m.id}>
              <CardHeader
                title={m.label}
                description={m.target ? `Target: ${m.target}${m.unit}` : undefined}
                actions={<span className="text-[20px] font-bold text-ink-900">{m.current}<span className="ml-0.5 text-[13px] font-medium text-ink-500">{m.unit}</span></span>}
              />
              <div className="h-24 px-2 pb-3">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={m.trend} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
                    <XAxis dataKey="date" hide />
                    <YAxis hide domain={['auto', 'auto']} />
                    <RTooltip contentStyle={{ borderRadius: 10, border: '1px solid #262626', background: '#151515', color: '#f5f5f5', fontSize: 12 }} />
                    <Line type="monotone" dataKey="value" stroke="#c1121f" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
