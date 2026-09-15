import type { AIEmployee, EmployeeStatus, EmployeeType } from '@/types'
import { employeeCatalog, employeeKpis, employeeLastActivity } from './data/employees'
import { getPlanForEmployee } from './data/plans'
import { getVoiceProject } from './data/voiceProject'
import { subscriptionService } from './subscription.service'
import { delay } from './utils'

async function toAIEmployee(catalogEntry: (typeof employeeCatalog)[number]): Promise<AIEmployee> {
  const plan = getPlanForEmployee(catalogEntry.type)
  const subscription = await subscriptionService.getSubscription(catalogEntry.type)
  const status: EmployeeStatus = subscription?.status ?? 'not_hired'
  const isActive = status === 'active'

  // Voice is JEXA.AI-customized per customer — once a deployment exists
  // (pending or active), show what it's configured for as a secondary
  // label. The employee's name/tagline stay "Jaan" everywhere: Jaan is the
  // product identity on every catalog/dashboard card, regardless of
  // subscription state — the customer's specific agent names (e.g. "Acme
  // Jewellery AI Customer Assistant") live one level down, inside the Jaan
  // console's own Agents list.
  const voiceProject = catalogEntry.type === 'voice' && subscription ? getVoiceProject() : null
  const branding = voiceProject ? { configuredLabel: voiceProject.industry } : {}

  return {
    ...catalogEntry,
    ...branding,
    status,
    kpis: isActive ? (employeeKpis[catalogEntry.type] ?? []) : [],
    lastActivityAt: isActive ? (employeeLastActivity[catalogEntry.type] ?? catalogEntry.createdAt) : (subscription?.startDate ?? catalogEntry.createdAt),
    monthlyPrice: plan.monthlyPrice,
    annualPrice: plan.annualPrice,
    currency: plan.currency,
    planId: subscription?.planId,
    billingCycle: subscription?.billingCycle,
    nextBillingDate: subscription?.nextBillingDate,
  }
}

export const employeesService = {
  async listEmployees(): Promise<AIEmployee[]> {
    const employees = await Promise.all(employeeCatalog.map(toAIEmployee))
    return delay(employees, 350)
  },
  async getEmployee(id: string): Promise<AIEmployee | undefined> {
    const entry = employeeCatalog.find((e) => e.id === id)
    if (!entry) return delay(undefined)
    return delay(await toAIEmployee(entry))
  },
  async getEmployeeByType(type: EmployeeType): Promise<AIEmployee | undefined> {
    const entry = employeeCatalog.find((e) => e.type === type)
    if (!entry) return delay(undefined)
    return delay(await toAIEmployee(entry))
  },
  // Legacy pause/resume toggle used by the catalog page — routes through the
  // subscription layer so status stays consistent everywhere.
  async setEmployeeStatus(id: string, status: EmployeeStatus): Promise<AIEmployee | undefined> {
    const entry = employeeCatalog.find((e) => e.id === id)
    if (!entry) return undefined
    if (status === 'paused') await subscriptionService.pauseSubscription(entry.type)
    if (status === 'active') await subscriptionService.resumeSubscription(entry.type)
    return toAIEmployee(entry)
  },
}
