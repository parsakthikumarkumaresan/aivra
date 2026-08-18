import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowDownCircle,
  ArrowUpCircle,
  CalendarClock,
  Check,
  CreditCard,
  Pause,
  Play,
  Receipt,
  Sparkles,
  Wallet,
  XCircle,
} from 'lucide-react'
import { useAppData } from '@/app/AppDataProvider'
import { useHireFlow } from '@/app/HireFlowContext'
import { useLeadFlow } from '@/app/LeadFlowContext'
import { useToast } from '@/hooks/useToast'
import { useBillingAccount, useInvoices, usePlan } from '@/hooks/useSubscription'
import { subscriptionService } from '@/services/api'
import type { AIEmployee } from '@/types'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { EmployeeStatusBadge } from '@/components/ui/StatusBadge'
import { Avatar } from '@/components/ui/Avatar'
import { PillTabs } from '@/components/ui/Tabs'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { DataTable } from '@/components/ui/DataTable'
import { Drawer } from '@/components/ui/Drawer'
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog'
import { formatCurrency, formatDate } from '@/utils/format'

const BILLING_TABS = [
  { value: 'overview', label: 'Overview' },
  { value: 'active', label: 'Active AI Employees' },
  { value: 'plans', label: 'Plans' },
  { value: 'payment', label: 'Payment Method' },
  { value: 'invoices', label: 'Invoices' },
  { value: 'usage', label: 'Usage' },
  { value: 'history', label: 'Billing History' },
]

function priceFor(employee: AIEmployee) {
  return employee.billingCycle === 'annual' ? employee.annualPrice : employee.monthlyPrice
}

export function BillingSection() {
  const { employees, loading, refetchEmployees } = useAppData()
  const { openHireFlow } = useHireFlow()
  const { openCustomizationRequest } = useLeadFlow()
  const invoices = useInvoices()
  const billingAccount = useBillingAccount()
  const [tab, setTab] = useState('overview')
  const [manageTarget, setManageTarget] = useState<AIEmployee | null>(null)
  const { show } = useToast()

  const billable = employees.filter((e) => ['active', 'paused', 'past_due'].includes(e.status))
  const activeEmployees = employees.filter((e) => e.status === 'active')
  const totalMonthly = billable.reduce((sum, e) => sum + (e.billingCycle === 'annual' ? Math.round(e.annualPrice / 12) : e.monthlyPrice), 0)
  const nextBilling = billable
    .map((e) => e.nextBillingDate)
    .filter((d): d is string => Boolean(d))
    .sort()[0]

  async function quickToggle(employee: AIEmployee) {
    if (employee.status === 'paused') {
      await subscriptionService.resumeSubscription(employee.type)
      show({ tone: 'success', title: `${employee.name} resumed` })
    } else {
      await subscriptionService.pauseSubscription(employee.type)
      show({ tone: 'success', title: `${employee.name} paused` })
    }
    refetchEmployees()
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardBody className="p-0">
          <PillTabs items={BILLING_TABS} value={tab} onChange={setTab} className="m-4 flex-wrap" />
        </CardBody>
      </Card>

      {tab === 'overview' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card className="p-5">
              <p className="text-[13px] font-medium text-ink-500">AI Employees hired</p>
              <p className="mt-2 text-[26px] font-bold text-ink-900">{billable.length}</p>
              <p className="mt-1 text-xs text-ink-400">{activeEmployees.length} currently active</p>
            </Card>
            <Card className="p-5">
              <p className="text-[13px] font-medium text-ink-500">Total AIVRA subscription</p>
              <p className="mt-2 text-[26px] font-bold text-ink-900">{formatCurrency(totalMonthly)}<span className="text-[13px] font-normal text-ink-500">/mo</span></p>
              <p className="mt-1 text-xs text-ink-400">Across all hired AI Employees</p>
            </Card>
            <Card className="p-5">
              <p className="text-[13px] font-medium text-ink-500">Next billing date</p>
              <p className="mt-2 text-[26px] font-bold text-ink-900">{nextBilling ? formatDate(nextBilling, 'MMM d, yyyy') : '—'}</p>
              <p className="mt-1 text-xs text-ink-400">Earliest upcoming charge</p>
            </Card>
          </div>

          {billable.length === 0 ? (
            <EmptyState
              icon={<Sparkles className="size-6" />}
              title="No active AI Employee subscriptions"
              description="Hire an AI Employee to see billing details here."
              action={<Link to="/"><Button icon={<Sparkles className="size-4" />}>Explore AI Employees</Button></Link>}
            />
          ) : (
            <Card>
              <CardHeader title="Current AI Workforce" />
              <div className="divide-y divide-ink-100">
                {billable.map((employee) => (
                  <div key={employee.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                    <Avatar name={employee.name} color={employee.avatarColor} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-[13.5px] font-semibold text-ink-800">{employee.name}</p>
                        <EmployeeStatusBadge status={employee.status} />
                      </div>
                      <p className="text-xs text-ink-500">{formatCurrency(priceFor(employee))} / {employee.billingCycle === 'annual' ? 'year' : 'month'}</p>
                    </div>
                    {employee.nextBillingDate && (
                      <div className="text-right text-xs text-ink-500">
                        <p className="text-ink-400">Next billing</p>
                        <p className="font-medium text-ink-700">{formatDate(employee.nextBillingDate, 'd MMM yyyy')}</p>
                      </div>
                    )}
                    <Button size="sm" variant="outline" onClick={() => setManageTarget(employee)}>Manage</Button>
                  </div>
                ))}
                <div className="flex items-center justify-between px-5 py-4">
                  <p className="text-[13.5px] font-semibold text-ink-800">Total</p>
                  <p className="text-[15px] font-bold text-ink-900">{formatCurrency(totalMonthly)} / month</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {tab === 'active' && (
        <Card>
          <CardHeader title="Active AI Employees" description="Every AI Employee currently on a paid subscription" />
          {loading ? (
            <CardBody><Skeleton className="h-32 w-full" /></CardBody>
          ) : billable.length === 0 ? (
            <CardBody><p className="text-[13px] text-ink-500">No AI Employees are currently subscribed.</p></CardBody>
          ) : (
            <div className="divide-y divide-ink-100">
              {billable.map((employee) => (
                <div key={employee.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                  <Avatar name={employee.name} color={employee.avatarColor} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13.5px] font-semibold text-ink-800">{employee.name}</p>
                    <p className="text-xs text-ink-500 capitalize">{employee.billingCycle} billing</p>
                  </div>
                  <EmployeeStatusBadge status={employee.status} />
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" icon={employee.status === 'paused' ? <Play className="size-3.5" /> : <Pause className="size-3.5" />} onClick={() => quickToggle(employee)}>
                      {employee.status === 'paused' ? 'Resume' : 'Pause'}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setManageTarget(employee)}>Manage</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {tab === 'plans' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {employees.map((employee) => (
            <PlanCard
              key={employee.id}
              employee={employee}
              onAcquire={employee.type === 'hr' ? () => openHireFlow('hr') : openCustomizationRequest}
            />
          ))}
        </div>
      )}

      {tab === 'payment' && (
        <Card>
          <CardHeader title="Payment Method" description="Used for all AI Employee subscriptions" />
          <CardBody>
            {billingAccount.loading ? (
              <Skeleton className="h-16 w-full" />
            ) : (
              <div className="flex items-center justify-between rounded-lg border border-ink-200 p-4">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-lg bg-ink-100 text-ink-600"><Wallet className="size-4.5" /></span>
                  <div>
                    <p className="text-[13.5px] font-medium text-ink-800">{billingAccount.data?.paymentMethod.brand} •••• {billingAccount.data?.paymentMethod.last4}</p>
                    <p className="text-xs text-ink-500">Expires {billingAccount.data?.paymentMethod.expiry}</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" icon={<CreditCard className="size-3.5" />} onClick={() => show({ tone: 'info', title: 'Mock checkout', description: 'A real payment provider will be connected here later.' })}>
                  Update
                </Button>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {tab === 'invoices' && (
        <Card>
          <CardHeader title="Invoices" description="Billing line items per AI Employee" />
          <DataTable
            loading={invoices.loading}
            data={invoices.data ?? []}
            keyExtractor={(row) => row.id}
            emptyState={<div className="p-8 text-center text-[13px] text-ink-500">No invoices yet.</div>}
            columns={[
              { key: 'id', header: 'Invoice', render: (row) => <span className="font-medium text-ink-800">{row.id.toUpperCase()}</span> },
              { key: 'employee', header: 'AI Employee', render: (row) => <span className="capitalize">{row.employeeType === 'hr' ? 'AI HR Employee' : 'AI Voice Employee'}</span> },
              { key: 'period', header: 'Period', render: (row) => row.periodLabel },
              { key: 'amount', header: 'Amount', render: (row) => formatCurrency(row.amount, row.currency) },
              { key: 'status', header: 'Status', render: (row) => <Badge tone={row.status === 'paid' ? 'success' : row.status === 'failed' ? 'danger' : 'warning'} dot className="capitalize">{row.status}</Badge> },
              { key: 'date', header: 'Issued', render: (row) => formatDate(row.issuedAt, 'MMM d, yyyy') },
            ]}
          />
        </Card>
      )}

      {tab === 'usage' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {billable.map((employee) => <UsageCard key={employee.id} employee={employee} />)}
          {billable.length === 0 && <p className="text-[13px] text-ink-500">Hire an AI Employee to see usage against plan limits.</p>}
        </div>
      )}

      {tab === 'history' && (
        <Card>
          <CardHeader title="Billing History" description="Subscription lifecycle events for your organization" />
          <CardBody>
            <ol className="space-y-4">
              {billable.map((e) => (
                <li key={e.id} className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-600"><Receipt className="size-4" /></span>
                  <div>
                    <p className="text-[13.5px] font-medium text-ink-800">{e.name} hired</p>
                    <p className="text-xs text-ink-500">{formatDate(e.createdAt, 'MMM d, yyyy')} · {formatCurrency(priceFor(e))}/{e.billingCycle === 'annual' ? 'yr' : 'mo'}</p>
                  </div>
                </li>
              ))}
              {billable.length === 0 && <p className="text-[13px] text-ink-500">No billing events yet.</p>}
            </ol>
          </CardBody>
        </Card>
      )}

      <ManageSubscriptionDrawer employee={manageTarget} onClose={() => setManageTarget(null)} onChanged={refetchEmployees} />
    </div>
  )
}

function PlanCard({ employee, onAcquire }: { employee: AIEmployee; onAcquire: () => void }) {
  const plan = usePlan(employee.type)
  const isVoice = employee.type === 'voice'
  if (!plan.data) return <Skeleton className="h-48 w-full" />
  return (
    <Card>
      <CardHeader
        title={employee.name}
        description={isVoice ? 'Custom AIVRA deployment' : plan.data.name + ' plan'}
        actions={<EmployeeStatusBadge status={employee.status} />}
      />
      <CardBody className="space-y-3">
        {isVoice ? (
          <p className="text-[13px] text-ink-600">Custom pricing — depends on your requirements. AIVRA provides a proposal after discovery.</p>
        ) : (
          <p className="text-[22px] font-bold text-ink-900">{formatCurrency(plan.data.monthlyPrice, plan.data.currency)}<span className="text-[13px] font-normal text-ink-500">/mo</span></p>
        )}
        <ul className="space-y-1.5">
          {plan.data.features.slice(0, 4).map((f) => (
            <li key={f} className="flex items-start gap-2 text-[12.5px] text-ink-600">
              <Check className="mt-0.5 size-3.5 shrink-0 text-success-600" />
              {f}
            </li>
          ))}
        </ul>
        {employee.status === 'not_hired' && (
          <Button size="sm" className="w-full" icon={<Sparkles className="size-3.5" />} onClick={onAcquire}>
            {isVoice ? 'Contact AIVRA for Customization' : 'Hire AI Employee'}
          </Button>
        )}
      </CardBody>
    </Card>
  )
}

function UsageCard({ employee }: { employee: AIEmployee }) {
  const plan = usePlan(employee.type)
  if (!plan.data) return <Skeleton className="h-40 w-full" />
  return (
    <Card>
      <CardHeader title={employee.name} description="Usage against current plan limits" />
      <CardBody className="space-y-2.5">
        {plan.data.limits.map((l) => (
          <div key={l.label} className="flex items-center justify-between rounded-lg bg-ink-25 px-3 py-2 text-[12.5px]">
            <span className="text-ink-500">{l.label}</span>
            <span className="font-medium text-ink-800">{l.value}</span>
          </div>
        ))}
      </CardBody>
    </Card>
  )
}

function ManageSubscriptionDrawer({ employee, onClose, onChanged }: { employee: AIEmployee | null; onClose: () => void; onChanged: () => void }) {
  const plan = usePlan(employee?.type ?? 'hr')
  const { show } = useToast()
  const [busy, setBusy] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(false)

  if (!employee) return null

  async function run(action: () => Promise<unknown>, successTitle: string) {
    setBusy(true)
    await action()
    setBusy(false)
    onChanged()
    show({ tone: 'success', title: successTitle })
  }

  return (
    <>
      <Drawer
        open={Boolean(employee) && !confirmCancel}
        onClose={onClose}
        title={employee.name}
        description="Manage subscription"
        footer={
          <Button variant="outline" onClick={onClose}>Close</Button>
        }
      >
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <Avatar name={employee.name} color={employee.avatarColor} size="md" />
            <div>
              <p className="text-[14px] font-semibold text-ink-900">{employee.name}</p>
              <EmployeeStatusBadge status={employee.status} />
            </div>
          </div>

          <dl className="space-y-2.5 rounded-lg border border-ink-200 p-4 text-[13px]">
            <div className="flex justify-between"><dt className="text-ink-500">Plan</dt><dd className="font-medium text-ink-800">{plan.data?.name ?? '—'}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-500">Price</dt><dd className="font-medium text-ink-800">{formatCurrency(priceFor(employee))} / {employee.billingCycle === 'annual' ? 'year' : 'month'}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-500">Next billing</dt><dd className="font-medium text-ink-800">{employee.nextBillingDate ? formatDate(employee.nextBillingDate, 'MMM d, yyyy') : '—'}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-500">Payment method</dt><dd className="font-medium text-ink-800">Visa •••• 4242</dd></div>
            <div className="flex justify-between"><dt className="text-ink-500">Status</dt><dd><EmployeeStatusBadge status={employee.status} /></dd></div>
          </dl>

          {plan.data && (
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-[13px] font-semibold text-ink-800"><CalendarClock className="size-3.5" /> Usage</p>
              <div className="space-y-1.5">
                {plan.data.limits.map((l) => (
                  <div key={l.label} className="flex justify-between text-[12.5px] text-ink-600">
                    <span>{l.label}</span>
                    <span className="font-medium text-ink-800">{l.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2 border-t border-ink-100 pt-4">
            <p className="text-[13px] font-semibold text-ink-800">Actions</p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                size="sm"
                variant="outline"
                icon={<ArrowUpCircle className="size-3.5" />}
                disabled={busy || employee.billingCycle === 'annual'}
                onClick={() => run(() => subscriptionService.changeBillingCycle(employee.type, 'annual'), 'Upgraded to annual billing')}
              >
                Upgrade to Annual
              </Button>
              <Button
                size="sm"
                variant="outline"
                icon={<ArrowDownCircle className="size-3.5" />}
                disabled={busy || employee.billingCycle === 'monthly'}
                onClick={() => run(() => subscriptionService.changeBillingCycle(employee.type, 'monthly'), 'Downgraded to monthly billing')}
              >
                Downgrade to Monthly
              </Button>
              {employee.status === 'paused' ? (
                <Button size="sm" variant="outline" icon={<Play className="size-3.5" />} disabled={busy} onClick={() => run(() => subscriptionService.resumeSubscription(employee.type), `${employee.name} resumed`)}>
                  Resume
                </Button>
              ) : (
                <Button size="sm" variant="outline" icon={<Pause className="size-3.5" />} disabled={busy} onClick={() => run(() => subscriptionService.pauseSubscription(employee.type), `${employee.name} paused`)}>
                  Pause
                </Button>
              )}
              <Button size="sm" variant="danger" icon={<XCircle className="size-3.5" />} disabled={busy} onClick={() => setConfirmCancel(true)}>
                Cancel Subscription
              </Button>
            </div>
          </div>
        </div>
      </Drawer>

      <ConfirmationDialog
        open={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        onConfirm={async () => {
          setBusy(true)
          await subscriptionService.cancelSubscription(employee.type)
          setBusy(false)
          setConfirmCancel(false)
          onChanged()
          show({ tone: 'success', title: `${employee.name} cancelled`, description: 'You can hire it again anytime from AI Employees.' })
          onClose()
        }}
        loading={busy}
        destructive
        title={`Are you sure you want to stop your ${employee.name}?`}
        description={`Cancelling will immediately revoke access to ${employee.type === 'hr' ? 'candidate screening, AI interviews and scheduling' : 'call handling, configuration and support automation'}. You can hire it again anytime.`}
        confirmLabel="Cancel Subscription"
      />
    </>
  )
}
