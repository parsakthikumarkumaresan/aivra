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

  // Voice is AIVRA-customized per customer — once a deployment exists
  // (pending or active), brand it with the customer's own business name
  // instead of the generic catalog name.
  const voiceProject = catalogEntry.type === 'voice' && subscription ? getVoiceProject() : null
  const branding = voiceProject
    ? { name: `${voiceProject.businessName} AI Customer Assistant`, tagline: `${voiceProject.industry} Customer Assistant`, configuredLabel: voiceProject.industry }
    : {}

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
