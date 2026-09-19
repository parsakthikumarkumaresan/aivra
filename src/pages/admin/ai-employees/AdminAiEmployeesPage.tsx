import { Link } from 'react-router-dom'
import { Mic, Users, ArrowRight } from 'lucide-react'
import { useAsync } from '@/hooks/useAsync'
import { adminBusinessService } from '@/services/api'
import type { AdminAiEmployeeSummary } from '@/services/api'
import { PageHeader, Card, CardBody, ErrorState } from '@/components/ui'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatCurrency } from '@/utils/format'

const ICONS: Record<string, typeof Mic> = { voice: Mic, hr: Users }
const HREFS: Record<string, string> = { voice: '/admin/ai-employees/jaan', hr: '/admin/ai-employees/hr' }

// JEXA Admin — AI Employees landing (Admin Console business restructure).
// Represents the AI Employee PRODUCTS, not individual technical agents —
// Jaan is one AI Employee inside JEXA, not the center of the console.
export default function AdminAiEmployeesPage() {
  const landing = useAsync(() => adminBusinessService.getAiEmployeesLanding(), [])

  return (
    <div className="space-y-6">
      <PageHeader title="AI Employees" description="JEXA's AI Employee products — real, per-product business metrics." />

      {landing.loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Skeleton className="h-56 w-full" />
          <Skeleton className="h-56 w-full" />
        </div>
      ) : landing.error || !landing.data ? (
        <ErrorState description={landing.error?.message} onRetry={landing.refetch} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {landing.data.employees.map((employee) => (
            <EmployeeCard key={employee.code} employee={employee} />
          ))}
        </div>
      )}
    </div>
  )
}

function EmployeeCard({ employee }: { employee: AdminAiEmployeeSummary }) {
  const Icon = ICONS[employee.code] ?? Mic
  return (
    <Link to={HREFS[employee.code] ?? '/admin/ai-employees'}>
      <Card className="h-full transition-colors hover:border-brand-600/50">
        <CardBody className="space-y-4 p-6">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-brand-600/10 text-brand-600">
              <Icon className="size-5" />
            </div>
            <div>
              <h3 className="text-[16px] font-semibold text-ink-900">{employee.name}</h3>
              <p className="text-[12.5px] text-ink-500">{employee.tagline}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Metric label="Customers" value={employee.customerCount.toLocaleString()} />
            <Metric label="Active" value={employee.activeCustomers.toLocaleString()} />
            <Metric label={employee.revenueLabel} value={formatCurrency(employee.revenue)} />
            <Metric label={employee.usageLabel} value={employee.usageValue} />
          </div>

          <div className="flex items-center gap-1 text-[12.5px] font-medium text-brand-600">
            View business overview <ArrowRight className="size-3.5" />
          </div>
        </CardBody>
      </Card>
    </Link>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">{label}</p>
      <p className="mt-0.5 text-[15px] font-semibold text-ink-900">{value}</p>
    </div>
  )
}
