import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, ArrowRight, CreditCard, Lock, PhoneCall, PlayCircle, ShieldAlert, Sparkles } from 'lucide-react'
import type { EmployeeType } from '@/types'
import { useEmployeeByType } from '@/hooks/useEmployees'
import { usePlan } from '@/hooks/useSubscription'
import { useHireFlow } from '@/app/HireFlowContext'
import { useLeadFlow } from '@/app/LeadFlowContext'
import { useAppData } from '@/app/AppDataProvider'
import { useToast } from '@/hooks/useToast'
import { subscriptionService } from '@/services/api'
import { getCatalogContent } from '@/services/mock/data/catalogContent'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmployeeStatusBadge } from '@/components/ui/StatusBadge'
import { EmployeeProductContent } from '@/components/employees/EmployeeProductContent'

const REQUIRED_COPY: Record<EmployeeType, { title: string; body: string }> = {
  hr: { title: 'Jexa HR Required', body: 'You need to enable Jexa HR to access candidate screening, AI interviews and recruitment automation.' },
  voice: { title: 'Jaan Not Yet Provisioned', body: "You don't have Jaan yet. It's customized and deployed by JEXA.AI for your business — request a demo or tell us what you need." },
}

function AccessBanner({ type, status }: { type: EmployeeType; status: string }) {
  const { openHireFlow } = useHireFlow()
  const { openDemoRequest, openCustomizationRequest } = useLeadFlow()
  const { title, body } = REQUIRED_COPY[type]

  if (status === 'pending_activation') {
    return (
      <Card className="border-info-100 bg-info-50/50">
        <CardBody className="flex items-start gap-3.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-info-100 text-info-600"><PlayCircle className="size-4.5" /></span>
          <div>
            {type === 'voice' ? (
              <>
                <p className="text-[14px] font-semibold text-ink-900">Your Jaan is being configured by JEXA.AI</p>
                <p className="mt-0.5 text-[13px] text-ink-600">Our solution team is setting up your custom deployment. We'll notify you the moment it goes live.</p>
              </>
            ) : (
              <>
                <p className="text-[14px] font-semibold text-ink-900">Activating Jexa HR</p>
                <p className="mt-0.5 text-[13px] text-ink-600">Setup is finishing up — this usually takes a moment. Refresh in a bit.</p>
              </>
            )}
          </div>
        </CardBody>
      </Card>
    )
  }
  if (status === 'paused') {
    return (
      <Card className="border-ink-200 bg-ink-25">
        <CardBody className="flex flex-wrap items-center gap-3.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-ink-200 text-ink-600"><Lock className="size-4.5" /></span>
          <div className="flex-1">
            <p className="text-[14px] font-semibold text-ink-900">This AI Employee is paused</p>
            <p className="mt-0.5 text-[13px] text-ink-600">Resume the subscription to regain access to its operational screens.</p>
          </div>
          <ResumeAction type={type} />
        </CardBody>
      </Card>
    )
  }
  if (status === 'past_due') {
    return (
      <Card className="border-danger-100 bg-danger-50/50">
        <CardBody className="flex flex-wrap items-center gap-3.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-danger-100 text-danger-600"><ShieldAlert className="size-4.5" /></span>
          <div className="flex-1">
            <p className="text-[14px] font-semibold text-ink-900">Payment issue on this subscription</p>
            <p className="mt-0.5 text-[13px] text-ink-600">Update your payment method to restore access to this AI Employee.</p>
          </div>
          <UpdatePaymentAction type={type} />
        </CardBody>
      </Card>
    )
  }
  return (
    <Card className="border-warning-100 bg-warning-50/50">
      <CardBody className="flex flex-wrap items-center gap-3.5">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-warning-100 text-warning-600"><AlertTriangle className="size-4.5" /></span>
        <div className="flex-1">
          <p className="text-[14px] font-semibold text-ink-900">{title}</p>
          <p className="mt-0.5 text-[13px] text-ink-600">{body}</p>
        </div>
        {type === 'hr' ? (
          <Button size="sm" icon={<Sparkles className="size-3.5" />} onClick={() => openHireFlow('hr')}>
            {status === 'cancelled' || status === 'expired' ? 'Rehire AI Employee' : 'Hire AI Employee'}
          </Button>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => openDemoRequest('voice')}>Request Demo</Button>
            <Button size="sm" icon={<PhoneCall className="size-3.5" />} onClick={openCustomizationRequest}>Contact JEXA.AI for Customization</Button>
          </div>
        )}
      </CardBody>
    </Card>
  )
}

function ResumeAction({ type }: { type: EmployeeType }) {
  const [busy, setBusy] = useState(false)
  const { refetchEmployees } = useAppData()
  const { show } = useToast()
  async function resume() {
    setBusy(true)
    await subscriptionService.resumeSubscription(type)
    setBusy(false)
    refetchEmployees()
    show({ tone: 'success', title: 'Subscription resumed', description: 'This AI Employee is active again.' })
  }
  return <Button size="sm" loading={busy} onClick={resume}>Resume Employee</Button>
}

function UpdatePaymentAction({ type }: { type: EmployeeType }) {
  const [busy, setBusy] = useState(false)
  const { refetchEmployees } = useAppData()
  const { show } = useToast()
  async function updatePayment() {
    setBusy(true)
    await subscriptionService.updatePaymentMethod(type)
    setBusy(false)
    refetchEmployees()
    show({ tone: 'success', title: 'Payment method updated', description: 'Your subscription is active again.' })
  }
  return <Button size="sm" variant="danger" loading={busy} icon={<CreditCard className="size-3.5" />} onClick={updatePayment}>Update Payment</Button>
}

export function EmployeeDetailPage({ type }: { type: EmployeeType }) {
  const employee = useEmployeeByType(type)
  const plan = usePlan(type)
  const { openHireFlow } = useHireFlow()
  const { openDemoRequest, openCustomizationRequest } = useLeadFlow()
  const content = getCatalogContent(type)

  if (employee.loading || !employee.data || !plan.data) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  const data = employee.data
  const isOwned = data.status !== 'not_hired'
  const showCta = ['not_hired', 'cancelled', 'expired'].includes(data.status)

  return (
    <div className="space-y-5">
      <PageHeader
        icon={<Avatar name={data.name} color={data.avatarColor} size="lg" />}
        title={
          <span className="flex items-center gap-2.5">
            {data.name}
            {isOwned && <EmployeeStatusBadge status={data.status} />}
          </span>
        }
        description={data.tagline}
      />

      {data.status !== 'active' && <AccessBanner type={type} status={data.status} />}

      <EmployeeProductContent
        description={data.description}
        content={content}
        plan={plan.data}
        pricingMode={type === 'hr' ? 'fixed' : 'custom'}
        pricingCta={
          !showCta ? (
            <Link to={type === 'hr' ? '/app/employees/hr' : '/app/employees/voice'}>
              <Button size="lg" variant="outline" iconRight={<ArrowRight className="size-4" />}>Go to Overview</Button>
            </Link>
          ) : type === 'hr' ? (
            <Button size="lg" icon={<Sparkles className="size-4" />} onClick={() => openHireFlow('hr')}>
              {data.status === 'cancelled' || data.status === 'expired' ? 'Rehire AI Employee' : 'Hire AI Employee'}
            </Button>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <Button size="lg" variant="outline" onClick={() => openDemoRequest('voice')}>Request Demo</Button>
              <Button size="lg" icon={<PhoneCall className="size-4" />} onClick={openCustomizationRequest}>Contact JEXA.AI for Customization</Button>
            </div>
          )
        }
        bottomCta={
          showCta ? (
            type === 'hr' ? (
              <Button size="lg" icon={<Sparkles className="size-4" />} onClick={() => openHireFlow('hr')}>
                {data.status === 'cancelled' || data.status === 'expired' ? 'Rehire AI Employee' : 'Hire AI Employee'}
              </Button>
            ) : (
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Button size="lg" variant="outline" onClick={() => openDemoRequest('voice')}>Request Demo</Button>
                <Button size="lg" icon={<PhoneCall className="size-4" />} onClick={openCustomizationRequest}>Contact JEXA.AI for Customization</Button>
              </div>
            )
          ) : undefined
        }
      />
    </div>
  )
}
