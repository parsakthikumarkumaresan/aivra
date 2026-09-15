import { Link } from 'react-router-dom'
import { Settings2, FlaskConical, ChevronRight, SlidersHorizontal } from 'lucide-react'
import { useSetBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { useHrConfig } from '@/hooks/useHr'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { HrSubNav } from '@/components/employees/hr/HrSubNav'

export default function ConfigurationPage() {
  useSetBreadcrumbs([{ label: 'AI Employees', href: '/app/employees' }, { label: 'Jexa HR', href: '/app/employees/hr' }, { label: 'Configuration' }])
  const config = useHrConfig()

  return (
    <div className="space-y-5">
      <PageHeader icon={<SlidersHorizontal className="size-5" />} title="Configuration" description="Administrator setup and testing tools for Jexa HR." />
      <HrSubNav />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Link to="/app/employees/hr/setup">
          <Card className="h-full transition-colors duration-150 hover:border-brand-300">
            <CardBody className="flex items-start gap-3.5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <Settings2 className="size-5" />
              </span>
              <div className="flex-1">
                <p className="text-[14px] font-semibold text-ink-900">Setup Wizard</p>
                <p className="mt-1 text-[13px] text-ink-500">Configure the hiring team, evaluation rubric, screening, AI interview structure and scheduling.</p>
              </div>
              <ChevronRight className="mt-1 size-4 shrink-0 text-ink-300" />
            </CardBody>
          </Card>
        </Link>

        <Link to="/app/employees/hr/configuration/testing">
          <Card className="h-full transition-colors duration-150 hover:border-brand-300">
            <CardBody className="flex items-start gap-3.5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-info-100 text-info-600">
                <FlaskConical className="size-5" />
              </span>
              <div className="flex-1">
                <p className="text-[14px] font-semibold text-ink-900">Testing & Preview</p>
                <p className="mt-1 text-[13px] text-ink-500">Try resume parsing, candidate matching and a sample AI screening call before going live.</p>
              </div>
              <ChevronRight className="mt-1 size-4 shrink-0 text-ink-300" />
            </CardBody>
          </Card>
        </Link>
      </div>

      <Card>
        <CardHeader title="Current Configuration" description="Summary of active settings" />
        <CardBody className="space-y-3">
          {config.loading ? (
            <Skeleton className="h-32 w-full" />
          ) : (
            <>
              <ConfigRow label="Rubric version" value={config.data?.rubricVersion ?? '—'} />
              <ConfigRow label="Interview template" value={config.data?.interviewTemplate ?? '—'} />
              <ConfigRow label="Calendar" value={config.data?.calendarConnected ? 'Connected' : 'Not connected'} tone={config.data?.calendarConnected ? 'success' : 'warning'} />
              <ConfigRow label="Notifications" value={config.data?.notificationsEnabled ? 'Enabled' : 'Disabled'} />
            </>
          )}
        </CardBody>
      </Card>
    </div>
  )
}

function ConfigRow({ label, value, tone }: { label: string; value: string; tone?: 'success' | 'warning' }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[13px] text-ink-500">{label}</span>
      {tone ? (
        <Badge tone={tone} dot>
          {value}
        </Badge>
      ) : (
        <span className="text-[13px] font-medium text-ink-800">{value}</span>
      )}
    </div>
  )
}
