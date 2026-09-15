import { Outlet } from 'react-router-dom'
import { AlertTriangle, CreditCard, Mic, PhoneCall, PlayCircle, Sparkles } from 'lucide-react'
import { useEmployeeAccess } from '@/hooks/useSubscription'
import { useSetBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { useLeadFlow } from '@/app/LeadFlowContext'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'

// Jaan is the customer-facing product wrapped around the "voice" AI
// Employee subscription — the same subscription that drives
// /app/employees/voice, so hiring/activating Jaan there flows straight
// into full console access here. No separate subscription concept.
export function JaanAccessGate() {
  useSetBreadcrumbs([{ label: 'JEXA.AI', href: '/app' }, { label: 'Jaan' }])
  const { employee, hasAccess, loading } = useEmployeeAccess('voice')
  const { openDemoRequest, openCustomizationRequest } = useLeadFlow()

  if (loading) {
    return (
      <div className="space-y-5 p-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (hasAccess) return <Outlet />

  const status = employee?.status

  if (status === 'pending_activation') {
    return (
      <JaanUpsellShell>
        <Card className="border-info-100 bg-info-50/40">
          <CardBody className="flex items-start gap-3.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-info-100 text-info-600"><PlayCircle className="size-4.5" /></span>
            <div>
              <p className="text-[14px] font-semibold text-ink-900">Jaan is being provisioned</p>
              <p className="mt-0.5 text-[13px] text-ink-600">Our team is setting up your Voice AI Workforce console. We'll notify you the moment it's ready.</p>
            </div>
          </CardBody>
        </Card>
      </JaanUpsellShell>
    )
  }

  if (status === 'past_due' || status === 'expired') {
    return (
      <JaanUpsellShell
        title="Your Jaan subscription has expired"
        description="Renew to regain access to your agents, campaigns, conversation logs and analytics — nothing has been deleted."
      >
        <Card className="border-danger-100 bg-danger-50/40">
          <CardBody className="flex flex-wrap items-center gap-3.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-danger-100 text-danger-600"><AlertTriangle className="size-4.5" /></span>
            <div className="flex-1">
              <p className="text-[14px] font-semibold text-ink-900">{status === 'past_due' ? 'Payment issue on your Jaan subscription' : 'Subscription expired'}</p>
              <p className="mt-0.5 text-[13px] text-ink-600">Update billing to restore full console access.</p>
            </div>
            <Button size="sm" variant="danger" icon={<CreditCard className="size-3.5" />}>Update Payment</Button>
          </CardBody>
        </Card>
      </JaanUpsellShell>
    )
  }

  if (status === 'paused') {
    return (
      <JaanUpsellShell title="Jaan is paused" description="Resume your subscription to bring your Voice AI Workforce back online.">
        <Button icon={<Sparkles className="size-4" />}>Resume Jaan</Button>
      </JaanUpsellShell>
    )
  }

  // not_hired / cancelled — never subscribed, or churned.
  return (
    <JaanUpsellShell>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button size="lg" icon={<Sparkles className="size-4" />} onClick={openCustomizationRequest}>
          Subscribe to Jaan
        </Button>
        <Button size="lg" variant="outline" onClick={() => openDemoRequest('voice')}>
          Book a Demo
        </Button>
      </div>
    </JaanUpsellShell>
  )
}

function JaanUpsellShell({
  title = 'Jaan',
  description = 'A Voice Agent for Your Business — that Talks. Understands. Takes Action.',
  children,
}: {
  title?: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <div className="glow-pulse pointer-events-none absolute -z-10 size-72 rounded-full bg-brand-600/10 blur-[100px]" />
      <span className="flex size-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
        <Mic className="size-7" />
      </span>
      <h1 className="mt-5 text-[28px] font-bold tracking-tight text-ink-900">{title}</h1>
      <p className="mx-auto mt-2 max-w-md text-[14.5px] leading-relaxed text-ink-500">{description}</p>
      <div className="mt-7 w-full max-w-lg">{children}</div>
      <p className="mt-8 flex items-center gap-1.5 text-[12.5px] text-ink-400">
        <PhoneCall className="size-3.5" />
        Custom-deployed and configured by JEXA.AI for your business.
      </p>
    </div>
  )
}
