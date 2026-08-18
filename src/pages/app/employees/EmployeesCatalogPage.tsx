import { Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useSetBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { useAppData } from '@/app/AppDataProvider'
import { useToast } from '@/hooks/useToast'
import { PageHeader } from '@/components/ui/PageHeader'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { EmployeeCard } from '@/components/employees/EmployeeCard'
import { Button } from '@/components/ui/Button'
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog'
import { useState } from 'react'
import type { AIEmployee } from '@/types'
import { employeesService } from '@/services/api'

export default function EmployeesCatalogPage() {
  useSetBreadcrumbs([{ label: 'My AI Workforce' }])
  const { employees, loading, refetchEmployees } = useAppData()
  const { show } = useToast()
  const [pauseTarget, setPauseTarget] = useState<AIEmployee | null>(null)
  const [busy, setBusy] = useState(false)

  // Only employees actually provisioned to this customer's account — the
  // dashboard is a workforce workspace, not a marketplace. Discovery and
  // purchase/customization happen on the public AIVRA website.
  const workforce = employees.filter((e) => !['not_hired', 'cancelled', 'expired'].includes(e.status))

  async function confirmToggle() {
    if (!pauseTarget) return
    setBusy(true)
    const nextStatus = pauseTarget.status === 'paused' ? 'active' : 'paused'
    await employeesService.setEmployeeStatus(pauseTarget.id, nextStatus)
    setBusy(false)
    setPauseTarget(null)
    show({
      tone: 'success',
      title: nextStatus === 'paused' ? `${pauseTarget.name} paused` : `${pauseTarget.name} resumed`,
      description: nextStatus === 'paused' ? 'It will stop taking new work immediately.' : 'It is now active again.',
    })
    refetchEmployees()
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My AI Workforce"
        description="The AI Employees provisioned to your organization."
      />

      {loading ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <SkeletonCard />
        </div>
      ) : workforce.length === 0 ? (
        <EmptyState
          icon={<Sparkles className="size-6" />}
          title="You haven't hired an AI Employee yet."
          description="Build your AI workforce by hiring your first AI Employee."
          action={
            <Link to="/">
              <Button icon={<Sparkles className="size-4" />}>Explore AI Employees</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {workforce.map((employee) => (
            <EmployeeCard key={employee.id} employee={employee} onTogglePause={setPauseTarget} />
          ))}
        </div>
      )}

      <ConfirmationDialog
        open={Boolean(pauseTarget)}
        onClose={() => setPauseTarget(null)}
        onConfirm={confirmToggle}
        loading={busy}
        destructive={pauseTarget?.status !== 'paused'}
        title={pauseTarget?.status === 'paused' ? `Resume ${pauseTarget?.name}?` : `Pause ${pauseTarget?.name}?`}
        description={
          pauseTarget?.status === 'paused'
            ? 'It will immediately start picking up new work again.'
            : 'It will stop taking new work immediately. In-progress conversations will finish gracefully.'
        }
        confirmLabel={pauseTarget?.status === 'paused' ? 'Resume' : 'Pause employee'}
      />
    </div>
  )
}
