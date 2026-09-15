import { Link } from 'react-router-dom'
import { Mic, PhoneCall, Wand2 } from 'lucide-react'
import { MarketingHeader } from '@/components/marketing/MarketingHeader'
import { MarketingFooter } from '@/components/marketing/MarketingFooter'
import { EmployeeProductContent } from '@/components/employees/EmployeeProductContent'
import { useEmployeeByType } from '@/hooks/useEmployees'
import { usePlan } from '@/hooks/useSubscription'
import { useLeadFlow } from '@/app/LeadFlowContext'
import { getCatalogContent } from '@/services/mock/data/catalogContent'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardBody } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'

export default function VoiceEmployeePage() {
  const employee = useEmployeeByType('voice')
  const plan = usePlan('voice')
  const { openDemoRequest, openCustomizationRequest } = useLeadFlow()
  const content = getCatalogContent('voice')

  return (
    <div className="min-h-screen bg-ink-25">
      <MarketingHeader />

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] bg-gradient-to-b from-info-50/80 via-ink-25 to-ink-25" />
        <div className="mx-auto max-w-4xl px-6 pb-14 pt-16 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-info-100 text-info-600">
            <Mic className="size-6" />
          </div>
          <Badge tone="info" className="mt-5 uppercase tracking-wide">Custom JEXA.AI Deployment</Badge>
          <h1 className="mt-4 text-[36px] font-bold leading-[1.1] tracking-tight text-ink-900 sm:text-[44px]">Jaan</h1>
          <p className="mt-2 text-[17px] font-medium text-info-600">A Voice Agent for Your Business — that Talks. Understands. Takes Action.</p>
          <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-ink-600">
            Handles customer calls, enquiries, bookings, support and lead qualification — 24/7. Every Jaan deployment is
            customized, configured and deployed by JEXA.AI's solution team for your specific business.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" variant="outline" onClick={() => openDemoRequest('voice')}>
              Request Demo
            </Button>
            <Button size="lg" icon={<PhoneCall className="size-4" />} onClick={openCustomizationRequest}>
              Contact JEXA.AI for Customization
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 pb-20">
        <Card className="mb-6 border-info-100 bg-info-50/40">
          <CardBody className="flex items-start gap-3">
            <Wand2 className="mt-0.5 size-4 shrink-0 text-info-600" />
            <p className="text-[13px] leading-relaxed text-ink-700">
              This AI Employee is <span className="font-semibold">customized and deployed by JEXA.AI</span> — not a
              self-service product. There's no fixed checkout; our team designs, configures and deploys it with you.
            </p>
          </CardBody>
        </Card>

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
            pricingMode="custom"
            pricingCta={
              <Button size="lg" icon={<PhoneCall className="size-4" />} onClick={openCustomizationRequest}>
                Contact JEXA.AI for Customization
              </Button>
            }
            bottomCta={
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button size="lg" variant="outline" onClick={() => openDemoRequest('voice')}>Request Demo</Button>
                <Button size="lg" icon={<PhoneCall className="size-4" />} onClick={openCustomizationRequest}>Contact JEXA.AI for Customization</Button>
              </div>
            }
          />
        )}

        <p className="mt-6 text-center text-[13px] text-ink-400">
          Already using Jaan? <Link to="/login" className="font-medium text-brand-600 hover:text-brand-700">Sign in</Link> to manage it.
        </p>
      </section>

      <MarketingFooter />
    </div>
  )
}
