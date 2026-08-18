import { Link } from 'react-router-dom'
import { Sparkles, Users } from 'lucide-react'
import { MarketingHeader } from '@/components/marketing/MarketingHeader'
import { MarketingFooter } from '@/components/marketing/MarketingFooter'
import { EmployeeProductContent } from '@/components/employees/EmployeeProductContent'
import { useEmployeeByType } from '@/hooks/useEmployees'
import { usePlan } from '@/hooks/useSubscription'
import { useHireFlow } from '@/app/HireFlowContext'
import { useLeadFlow } from '@/app/LeadFlowContext'
import { getCatalogContent } from '@/services/mock/data/catalogContent'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'

export default function HrEmployeePage() {
  const employee = useEmployeeByType('hr')
  const plan = usePlan('hr')
  const { openHireFlow } = useHireFlow()
  const { openDemoRequest } = useLeadFlow()
  const content = getCatalogContent('hr')

  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] bg-gradient-to-b from-brand-50/70 via-white to-white" />
        <div className="mx-auto max-w-4xl px-6 pb-14 pt-16 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-600">
            <Users className="size-6" />
          </div>
          <Badge tone="brand" className="mt-5 uppercase tracking-wide">Self-Service AI Employee</Badge>
          <h1 className="mt-4 text-[36px] font-bold leading-[1.1] tracking-tight text-ink-900 sm:text-[44px]">AI HR Employee</h1>
          <p className="mt-2 text-[17px] font-medium text-brand-600">Recruiting & Interview Copilot</p>
          <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-ink-600">
            Your AI HR team member for candidate screening, AI interviews and interview scheduling. Purchase it, configure
            your hiring team and jobs, and start screening candidates today.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" variant="outline" onClick={() => openDemoRequest('hr')}>
              Request Demo
            </Button>
            <Button size="lg" icon={<Sparkles className="size-4" />} onClick={() => openHireFlow('hr')}>
              Purchase
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 pb-20">
        {!employee.data || !plan.data ? (
          <div className="space-y-5">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        ) : (
          <EmployeeProductContent
            description={employee.data.description}
            content={content}
            plan={plan.data}
            pricingMode="fixed"
            pricingCta={
              <Button size="lg" icon={<Sparkles className="size-4" />} onClick={() => openHireFlow('hr')}>
                Purchase
              </Button>
            }
            bottomCta={
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button size="lg" variant="outline" onClick={() => openDemoRequest('hr')}>Request Demo</Button>
                <Button size="lg" icon={<Sparkles className="size-4" />} onClick={() => openHireFlow('hr')}>Purchase</Button>
              </div>
            }
          />
        )}

        <p className="mt-6 text-center text-[13px] text-ink-400">
          Already purchased? <Link to="/login" className="font-medium text-brand-600 hover:text-brand-700">Sign in</Link> to configure your AI HR Employee.
        </p>
      </section>

      <MarketingFooter />
    </div>
  )
}
