import { useSetBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { useAppData } from '@/app/AppDataProvider'
import { useToast } from '@/hooks/useToast'
import { PageHeader } from '@/components/ui/PageHeader'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { EmployeeCard } from '@/components/employees/EmployeeCard'
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog'
import { useState } from 'react'
import type { AIEmployee } from '@/types'
import { employeesService } from '@/services/api'

// The customer's AI Employee catalog — every AI Employee JEXA.AI offers,
// each showing its real subscription state (Subscribe vs Active/Open). This
// is the one place both "browse what's available" and "manage what you have"
// live; the global Dashboard only ever surfaces already-active employees.
export default function EmployeesCatalogPage() {
  useSetBreadcrumbs([{ label: 'My Workforce' }])
  const { employees, loading, refetchEmployees } = useAppData()
  const { show } = useToast()
  const [pauseTarget, setPauseTarget] = useState<AIEmployee | null>(null)
  const [busy, setBusy] = useState(false)

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
        title="My Workforce"
        description="Manage the AI Employees powering your business."
      />

      {loading ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {employees.map((employee) => (
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
