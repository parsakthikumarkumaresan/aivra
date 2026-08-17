import type { AIEmployee, EmployeeStatus } from '@/types'
import { mockEmployees } from './data/employees'
import { delay } from './utils'

export const employeesService = {
  listEmployees(): Promise<AIEmployee[]> {
    return delay(mockEmployees)
  },
  getEmployee(id: string): Promise<AIEmployee | undefined> {
    return delay(mockEmployees.find((e) => e.id === id))
  },
  getEmployeeByType(type: 'hr' | 'voice'): Promise<AIEmployee | undefined> {
    return delay(mockEmployees.find((e) => e.type === type))
  },
  setEmployeeStatus(id: string, status: EmployeeStatus): Promise<AIEmployee | undefined> {
    const employee = mockEmployees.find((e) => e.id === id)
    if (employee) employee.status = status
    return delay(employee, 600)
  },
}
