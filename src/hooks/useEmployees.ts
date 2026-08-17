import { employeesService } from '@/services/api'
import { useAsync } from './useAsync'

export function useEmployees() {
  return useAsync(() => employeesService.listEmployees(), [])
}

export function useEmployee(id: string) {
  return useAsync(() => employeesService.getEmployee(id), [id])
}

export function useEmployeeByType(type: 'hr' | 'voice') {
  return useAsync(() => employeesService.getEmployeeByType(type), [type])
}
