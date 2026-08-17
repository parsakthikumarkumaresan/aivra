import { Plus, Sparkles } from 'lucide-react'
import { useSetBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { useAppData } from '@/app/AppDataProvider'
import { useToast } from '@/hooks/useToast'
import { PageHeader } from '@/components/ui/PageHeader'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { EmployeeCard } from '@/components/employees/EmployeeCard'
import { Button } from '@/components/ui/Button'
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog'
import { useState } from 'react'
import type { AIEmployee } from '@/types'
import { employeesService } from '@/services/api'

export default function EmployeesCatalogPage() {
  useSetBreadcrumbs([{ label: 'AI Employees' }])
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
        title="AI Employees"
        description="Deploy and manage the AI Employees working across your business. AIVRA ships with two roles today — built to extend."
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

          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-ink-200 bg-white p-8 text-center">
            <div className="flex size-11 items-center justify-center rounded-xl bg-ink-100 text-ink-400">
              <Sparkles className="size-5" />
            </div>
            <h3 className="mt-3.5 text-[15px] font-semibold text-ink-800">More AI Employees are on the way</h3>
            <p className="mt-1.5 max-w-sm text-[13px] text-ink-500">
              AIVRA's workforce is designed to grow — new roles like Sales, Support and Finance employees can be added
              without changing how you manage the ones you already have.
            </p>
            <Button variant="outline" size="sm" className="mt-4" icon={<Plus className="size-3.5" />} disabled>
              Request a new employee
            </Button>
          </div>
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
