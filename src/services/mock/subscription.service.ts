import type { BillingCycle, EmployeeType, Invoice, Subscription } from '@/types'
import { buildScenarioSubscriptions, buildScenarioVoiceProject } from './data/subscriptions'
import { getPlanForEmployee, mockPlans } from './data/plans'
import { mockBillingAccount, mockInvoices } from './data/billing'
import { setVoiceProject } from './data/voiceProject'
import type { VoiceProject } from './data/voiceProject'
import { getMockScenario } from './scenario'
import { delay, nextId } from './utils'

let subscriptions: Subscription[] = buildScenarioSubscriptions(getMockScenario())
setVoiceProject(buildScenarioVoiceProject(getMockScenario()))

const ACTIVATION_DELAY_MS = 1600

function find(employeeType: EmployeeType) {
  return subscriptions.find((s) => s.employeeType === employeeType)
}

function addMonths(iso: string, months: number): string {
  const date = new Date(iso)
  date.setMonth(date.getMonth() + months)
  return date.toISOString()
}

export const subscriptionService = {
  listSubscriptions(): Promise<Subscription[]> {
    return delay([...subscriptions])
  },
  getSubscription(employeeType: EmployeeType): Promise<Subscription | undefined> {
    return delay(find(employeeType))
  },
  listPlans() {
    return delay(mockPlans)
  },
  getPlan(employeeType: EmployeeType) {
    return delay(getPlanForEmployee(employeeType))
  },
  getBillingAccount() {
    return delay(mockBillingAccount)
  },
  listInvoices(): Promise<Invoice[]> {
    return delay(mockInvoices)
  },

  // Step 1 of checkout — creates (or reactivates) the subscription in a
  // pending_activation state. The UI is expected to show an "Activating…"
  // screen and then call completeActivation after a short delay.
  hireEmployee(employeeType: EmployeeType, billingCycle: BillingCycle): Promise<Subscription> {
    const plan = getPlanForEmployee(employeeType)
    const existing = find(employeeType)
    const now = new Date().toISOString()
    const record: Subscription = {
      id: existing?.id ?? nextId('sub'),
      organizationId: 'org_acme',
      employeeType,
      planId: plan.id,
      billingCycle,
      status: 'pending_activation',
      paymentStatus: 'paid',
      startDate: now,
      nextBillingDate: addMonths(now, billingCycle === 'annual' ? 12 : 1),
    }
    subscriptions = [...subscriptions.filter((s) => s.employeeType !== employeeType), record]
    return delay(record, 700)
  },

  completeActivation(employeeType: EmployeeType): Promise<Subscription | undefined> {
    const sub = find(employeeType)
    if (sub) sub.status = 'active'
    return delay(sub, ACTIVATION_DELAY_MS)
  },

  // Voice has no self-service checkout — this stands in for "AIVRA's
  // solution team has started building this customer's AI Voice Employee",
  // triggered from the Developer panel to simulate the internal-admin side
  // of the lead → deploy lifecycle. See completeActivation to mark it live.
  startVoiceDeployment(project: VoiceProject): Promise<Subscription> {
    setVoiceProject(project)
    const plan = getPlanForEmployee('voice')
    const existing = find('voice')
    const now = new Date().toISOString()
    const record: Subscription = {
      id: existing?.id ?? nextId('sub'),
      organizationId: 'org_acme',
      employeeType: 'voice',
      planId: plan.id,
      billingCycle: 'monthly',
      status: 'pending_activation',
      paymentStatus: 'paid',
      startDate: now,
      nextBillingDate: addMonths(now, 1),
    }
    subscriptions = [...subscriptions.filter((s) => s.employeeType !== 'voice'), record]
    return delay(record, 700)
  },

  pauseSubscription(employeeType: EmployeeType): Promise<Subscription | undefined> {
    const sub = find(employeeType)
    if (sub) sub.status = 'paused'
    return delay(sub, 500)
  },

  resumeSubscription(employeeType: EmployeeType): Promise<Subscription | undefined> {
    const sub = find(employeeType)
    if (sub) sub.status = 'active'
    return delay(sub, 500)
  },

  cancelSubscription(employeeType: EmployeeType): Promise<Subscription | undefined> {
    const sub = find(employeeType)
    if (sub) {
      sub.status = 'cancelled'
      sub.cancelledAt = new Date().toISOString()
    }
    return delay(sub, 500)
  },

  updatePaymentMethod(employeeType: EmployeeType): Promise<Subscription | undefined> {
    const sub = find(employeeType)
    if (sub) {
      sub.status = 'active'
      sub.paymentStatus = 'paid'
    }
    return delay(sub, 700)
  },

  changeBillingCycle(employeeType: EmployeeType, billingCycle: BillingCycle): Promise<Subscription | undefined> {
    const sub = find(employeeType)
    if (sub) sub.billingCycle = billingCycle
    return delay(sub, 500)
  },
}
