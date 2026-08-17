import type { HrEmployeeConfig, ScheduleSlot } from '@/types'

export const mockHiringTeam = [
  { id: 'hm_1', name: 'Priya Nair', role: 'Talent Acquisition Lead' },
  { id: 'hm_2', name: 'Rohan Mehta', role: 'Head of People' },
  { id: 'hm_3', name: 'Design Leadership', role: 'Interview Panel' },
]

export const mockScheduleSlots: ScheduleSlot[] = [
  { id: 'slot_1', startTime: '2026-08-19T09:00:00Z', endTime: '2026-08-19T09:45:00Z', interviewerId: 'hm_3', interviewerName: 'Design Leadership Panel', timezone: 'Asia/Kolkata', available: true },
  { id: 'slot_2', startTime: '2026-08-19T10:30:00Z', endTime: '2026-08-19T11:15:00Z', interviewerId: 'hm_3', interviewerName: 'Design Leadership Panel', timezone: 'Asia/Kolkata', available: true },
  { id: 'slot_3', startTime: '2026-08-19T13:00:00Z', endTime: '2026-08-19T13:45:00Z', interviewerId: 'hm_3', interviewerName: 'Design Leadership Panel', timezone: 'Asia/Kolkata', available: false },
  { id: 'slot_4', startTime: '2026-08-20T09:00:00Z', endTime: '2026-08-20T09:45:00Z', interviewerId: 'hm_2', interviewerName: 'Rohan Mehta', timezone: 'Asia/Kolkata', available: true },
  { id: 'slot_5', startTime: '2026-08-20T11:00:00Z', endTime: '2026-08-20T11:45:00Z', interviewerId: 'hm_2', interviewerName: 'Rohan Mehta', timezone: 'Asia/Kolkata', available: true },
  { id: 'slot_6', startTime: '2026-08-20T15:00:00Z', endTime: '2026-08-20T15:45:00Z', interviewerId: 'hm_1', interviewerName: 'Priya Nair', timezone: 'Asia/Kolkata', available: true },
]

export const mockHrConfig: HrEmployeeConfig = {
  rubricVersion: 'v3',
  interviewTemplate: 'Structured Interview v3',
  calendarConnected: false,
  notificationsEnabled: true,
  hiringTeam: mockHiringTeam,
  companyName: 'Acme Corporation',
  timezone: 'Asia/Kolkata',
}
