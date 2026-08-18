import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarClock, Check, CheckCircle2, CreditCard, Loader2, Sparkles } from 'lucide-react'
import type { BillingCycle, EmployeeType } from '@/types'
import { useEmployeeByType } from '@/hooks/useEmployees'
import { usePlan, useHireEmployee } from '@/hooks/useSubscription'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Input, Label } from '@/components/ui/Field'
import { StepperHorizontal } from '@/components/ui/Stepper'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatCurrency } from '@/utils/format'
import { useToast } from '@/hooks/useToast'

const CONFIGURE_HREF: Record<EmployeeType, string> = {
  hr: '/app/employees/hr/configuration',
  voice: '/app/employees/voice/setup',
}

const CHECKOUT_STEPS = [
  { id: 'plan', label: 'Plan' },
  { id: 'payment', label: 'Payment' },
  { id: 'confirm', label: 'Confirmation' },
]

interface HireEmployeeModalProps {
  employeeType: EmployeeType | null
  onClose: () => void
}

export function HireEmployeeModal({ employeeType, onClose }: HireEmployeeModalProps) {
  const [flowStep, setFlowStep] = useState<'plan' | 'payment'>('plan')
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly')
  const { show } = useToast()
  const navigate = useNavigate()

  const employee = useEmployeeByType(employeeType ?? 'hr')
  const plan = usePlan(employeeType ?? 'hr')
  const { stage, hire, reset } = useHireEmployee()

  const open = Boolean(employeeType)

  useEffect(() => {
    if (open) {
      setFlowStep('plan')
      setBillingCycle('monthly')
    } else {
      reset()
    }
  }, [open, employeeType]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleClose() {
    if (stage === 'creating' || stage === 'activating') return // don't let the user dismiss mid-checkout
    onClose()
  }

  async function handlePay() {
    if (!employeeType) return
    await hire(employeeType, billingCycle)
    show({ tone: 'success', title: `${employee.data?.name ?? 'AI Employee'} hired successfully`, description: 'Your AI Employee is now active and ready to configure.' })
  }

  function handleConfigure() {
    if (!employeeType) return
    onClose()
    navigate(CONFIGURE_HREF[employeeType])
  }

  const price = plan.data ? (billingCycle === 'monthly' ? plan.data.monthlyPrice : plan.data.annualPrice) : 0
  const monthlyEquivalent = plan.data ? Math.round(plan.data.annualPrice / 12) : 0
  const savingsPct = plan.data ? Math.round((1 - monthlyEquivalent / plan.data.monthlyPrice) * 100) : 0

  const stepIndex = stage === 'idle' ? (flowStep === 'plan' ? 0 : 1) : 2
  const employeeData = employee.data?.type === employeeType ? employee.data : undefined

  return (
    <Modal
      open={open}
      onClose={handleClose}
      size="lg"
      title={stage === 'idle' ? `Hire ${employeeData?.name ?? 'AI Employee'}` : undefined}
      description={stage === 'idle' ? 'Set up your AI Employee subscription in a few steps.' : undefined}
    >
      {!employee.data || !plan.data || employee.data.type !== employeeType || plan.data.employeeType !== employeeType ? (
        <Skeleton className="h-64 w-full" />
      ) : stage === 'idle' ? (
        <div className="space-y-5">
          <StepperHorizontal steps={CHECKOUT_STEPS} currentIndex={stepIndex} completedIndexes={stepIndex > 0 ? [0] : []} />

          <div className="flex items-center gap-3 rounded-lg border border-ink-200 bg-ink-25 p-3.5">
            <Avatar name={employee.data.name} color={employee.data.avatarColor} size="md" />
            <div>
              <p className="text-[14px] font-semibold text-ink-900">{employee.data.name}</p>
              <p className="text-[12.5px] text-ink-500">{employee.data.tagline}</p>
            </div>
          </div>

          {flowStep === 'plan' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setBillingCycle('monthly')}
                  className={`rounded-xl border p-4 text-left transition-colors duration-150 ${billingCycle === 'monthly' ? 'border-brand-500 bg-brand-50/60' : 'border-ink-200 hover:border-ink-300'}`}
                >
                  <p className="text-[13px] font-semibold text-ink-800">Monthly</p>
                  <p className="mt-1 text-[20px] font-bold text-ink-900">{formatCurrency(plan.data.monthlyPrice, plan.data.currency)}<span className="text-[13px] font-normal text-ink-500">/mo</span></p>
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle('annual')}
                  className={`relative rounded-xl border p-4 text-left transition-colors duration-150 ${billingCycle === 'annual' ? 'border-brand-500 bg-brand-50/60' : 'border-ink-200 hover:border-ink-300'}`}
                >
                  <span className="absolute -top-2.5 right-3 rounded-full bg-success-100 px-2 py-0.5 text-[10.5px] font-semibold text-success-700">Save {savingsPct}%</span>
                  <p className="text-[13px] font-semibold text-ink-800">Annual</p>
                  <p className="mt-1 text-[20px] font-bold text-ink-900">{formatCurrency(monthlyEquivalent, plan.data.currency)}<span className="text-[13px] font-normal text-ink-500">/mo</span></p>
                  <p className="text-[11.5px] text-ink-500">Billed {formatCurrency(plan.data.annualPrice, plan.data.currency)} yearly</p>
                </button>
              </div>

              <div>
                <p className="mb-2 text-[13px] font-semibold text-ink-800">What's included</p>
                <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                  {plan.data.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-[12.5px] text-ink-600">
                      <Check className="mt-0.5 size-3.5 shrink-0 text-success-600" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-lg border border-ink-200 p-3.5">
                <p className="mb-2 text-[13px] font-semibold text-ink-800">Usage & limits</p>
                <dl className="grid grid-cols-2 gap-2.5 text-[12.5px]">
                  {plan.data.limits.map((l) => (
                    <div key={l.label} className="flex items-center justify-between gap-2 rounded-md bg-ink-25 px-2.5 py-1.5">
                      <dt className="text-ink-500">{l.label}</dt>
                      <dd className="font-medium text-ink-800">{l.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setFlowStep('payment')}>Continue to Payment</Button>
              </div>
            </div>
          )}

          {flowStep === 'payment' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-ink-200 p-3.5">
                <div>
                  <p className="text-[13px] font-medium text-ink-800">{employee.data.name} — {billingCycle === 'monthly' ? 'Monthly' : 'Annual'} plan</p>
                  <p className="text-xs text-ink-500">Charged {billingCycle === 'monthly' ? 'every month' : 'once a year'}</p>
                </div>
                <p className="text-[17px] font-bold text-ink-900">{formatCurrency(price, plan.data.currency)}</p>
              </div>

              <div className="rounded-lg border border-ink-200 p-4">
                <div className="mb-3 flex items-center gap-2 text-[13px] font-semibold text-ink-800">
                  <CreditCard className="size-4 text-ink-500" />
                  Payment details
                  <Badge tone="neutral" className="ml-auto">Mock checkout</Badge>
                </div>
                <div className="space-y-3">
                  <div>
                    <Label>Card number</Label>
                    <Input defaultValue="4242 4242 4242 4242" readOnly />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Expiry</Label>
                      <Input defaultValue="08/28" readOnly />
                    </div>
                    <div>
                      <Label>CVC</Label>
                      <Input defaultValue="123" readOnly />
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-[11.5px] text-ink-400">This is a simulated payment for the AIVRA prototype — no real charge is made.</p>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setFlowStep('plan')}>Back</Button>
                <Button onClick={handlePay} icon={<Sparkles className="size-4" />}>Pay {formatCurrency(price, plan.data.currency)}</Button>
              </div>
            </div>
          )}
        </div>
      ) : stage === 'creating' || stage === 'activating' ? (
        <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
          <Loader2 className="size-8 animate-spin text-brand-600" />
          <p className="text-[15px] font-semibold text-ink-900">
            {stage === 'creating' ? 'Confirming payment…' : `Activating ${employee.data.name}…`}
          </p>
          <p className="max-w-sm text-[13px] text-ink-500">
            {stage === 'creating' ? 'Setting up your subscription.' : 'Your AI Employee is being provisioned and configured. This only takes a moment.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-success-100 text-success-600">
            <CheckCircle2 className="size-7" />
          </div>
          <p className="text-[17px] font-semibold text-ink-900">✓ {employee.data.name} hired successfully</p>
          <p className="max-w-sm text-[13px] text-ink-500">Your {employee.data.name} is now active. Configure it to start putting it to work.</p>
          <div className="mt-1 flex items-center gap-1.5 text-[12px] text-ink-400">
            <CalendarClock className="size-3.5" />
            Next billing on {plan.data && new Date(new Date().setMonth(new Date().getMonth() + (billingCycle === 'monthly' ? 1 : 12))).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
          <div className="mt-4 flex items-center gap-2">
            <Button variant="outline" onClick={onClose}>Close</Button>
            <Button onClick={handleConfigure}>Configure {employee.data.name}</Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
