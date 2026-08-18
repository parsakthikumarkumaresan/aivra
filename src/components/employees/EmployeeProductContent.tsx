import type { ReactNode } from 'react'
import { useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import type { EmployeeCatalogContent, EmployeePlan } from '@/types'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { StepperHorizontal } from '@/components/ui/Stepper'
import { formatCurrency } from '@/utils/format'
import { cn } from '@/utils/cn'

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-ink-100 last:border-0">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between gap-4 py-3.5 text-left">
        <span className="text-[13.5px] font-medium text-ink-800">{question}</span>
        <ChevronDown className={cn('size-4 shrink-0 text-ink-400 transition-transform duration-150', open && 'rotate-180')} />
      </button>
      {open && <p className="pb-3.5 text-[13px] leading-relaxed text-ink-500">{answer}</p>}
    </div>
  )
}

interface EmployeeProductContentProps {
  description: string
  content: EmployeeCatalogContent
  plan: EmployeePlan
  /** 'fixed' shows monthly/annual numbers (HR); 'custom' shows a contact-for-pricing panel (Voice). */
  pricingMode: 'fixed' | 'custom'
  pricingCta: ReactNode
  bottomCta?: ReactNode
}

export function EmployeeProductContent({ description, content, plan, pricingMode, pricingCta, bottomCta }: EmployeeProductContentProps) {
  return (
    <div className="space-y-5">
      <Card>
        <CardBody>
          <p className="text-[14px] leading-relaxed text-ink-700">"{description}"</p>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="What it does" />
        <CardBody>
          <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {content.whatItDoes.map((item) => (
              <li key={item} className="flex items-start gap-2 text-[13.5px] text-ink-700">
                <Check className="mt-0.5 size-4 shrink-0 text-success-600" />
                {item}
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="How it works" />
        <CardBody className="overflow-x-auto">
          <StepperHorizontal steps={content.howItWorks.map((label, i) => ({ id: String(i), label }))} currentIndex={-1} completedIndexes={content.howItWorks.map((_, i) => i)} />
        </CardBody>
      </Card>

      <Card className="border-brand-200">
        <CardHeader title="Pricing" description={pricingMode === 'fixed' ? 'Simple per-employee subscription — cancel or pause anytime.' : 'Every AI Voice Employee is custom-built for its business.'} />
        <CardBody className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          {pricingMode === 'fixed' ? (
            <div className="flex flex-wrap items-end gap-6">
              <div>
                <p className="text-[26px] font-bold text-ink-900">{formatCurrency(plan.monthlyPrice, plan.currency)}<span className="text-[14px] font-normal text-ink-500">/month</span></p>
                <p className="text-xs text-ink-500">Billed monthly</p>
              </div>
              <div>
                <p className="text-[18px] font-semibold text-ink-700">{formatCurrency(plan.annualPrice, plan.currency)}<span className="text-[13px] font-normal text-ink-500">/year</span></p>
                <p className="text-xs text-ink-500">Billed annually — 2 months free</p>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-[17px] font-semibold text-ink-900">Custom pricing</p>
              <p className="mt-1 max-w-md text-[13px] text-ink-500">
                Final pricing depends on your requirements — setup, configuration and monthly subscription. Our team will provide a proposal after discovery.
              </p>
            </div>
          )}
          {pricingCta}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Includes" />
        <CardBody>
          <div className="flex flex-wrap gap-2">
            {content.includes.map((item) => (
              <Badge key={item} tone="brand">{item}</Badge>
            ))}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="FAQ" />
        <CardBody className="py-1">
          {content.faq.map((f) => (
            <FaqItem key={f.question} question={f.question} answer={f.answer} />
          ))}
        </CardBody>
      </Card>

      {bottomCta && <div className="flex justify-center pb-2">{bottomCta}</div>}
    </div>
  )
}
