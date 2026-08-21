import { Home, Users, Brain, Inbox, CheckSquare, BarChart3, Plug, Settings, Bell, Search, PhoneCall } from 'lucide-react'
import { LogoMark } from '@/components/ui/Logo'
import { Avatar } from '@/components/ui/Avatar'

const NAV_ICONS = [Home, Users, Brain, Inbox, CheckSquare, BarChart3, Plug, Settings]

const MINI_KPIS = [
  { label: 'Active AI Employees', value: '2' },
  { label: 'Tasks Completed', value: '1,248' },
  { label: 'Conversations', value: '2,873' },
  { label: 'Accuracy Score', value: '98.6%' },
]

const MINI_EMPLOYEES = [
  { name: 'Aivra Hr', status: 'Screening candidates', color: '#6D3EF2' },
  { name: 'AI Voice Employee', status: 'Handling enquiries', color: '#2137C9' },
]

const CHART_POINTS = '0,38 14,32 28,34 42,22 56,26 70,14 84,18 100,8'

export function DashboardPreview() {
  return (
    <div className="relative select-none">
      <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-overlay">
        <div className="flex h-9 items-center gap-3.5 border-b border-ink-100 bg-ink-25 px-4">
          <LogoMark size={16} />
          <span className="text-[11px] font-semibold text-ink-700">AIVRA</span>
          <div className="ml-auto flex items-center gap-2.5 text-ink-300">
            <Search className="size-3" />
            <Bell className="size-3" />
          </div>
        </div>
        <div className="flex">
          <div className="flex w-11 shrink-0 flex-col items-center gap-3 border-r border-ink-100 py-3">
            {NAV_ICONS.map((Icon, i) => (
              <span
                key={i}
                className={`flex size-6 items-center justify-center rounded-md ${i === 0 ? 'bg-brand-100 text-brand-600' : 'text-ink-300'}`}
              >
                <Icon className="size-3.5" />
              </span>
            ))}
          </div>
          <div className="flex-1 p-4">
            <p className="text-[11px] text-ink-400">Welcome back, Admin</p>
            <p className="text-[13px] font-semibold text-ink-900">Here's what's happening in your AI workforce today.</p>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {MINI_KPIS.map((kpi) => (
                <div key={kpi.label} className="rounded-lg border border-ink-100 bg-white p-2">
                  <p className="text-[15px] font-bold leading-none text-ink-900">{kpi.value}</p>
                  <p className="mt-1 text-[8.5px] leading-tight text-ink-400">{kpi.label}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-ink-100 p-2.5">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-semibold text-ink-700">AI Employees</p>
                  <span className="text-[8px] text-brand-600">View all</span>
                </div>
                <div className="mt-2 space-y-2">
                  {MINI_EMPLOYEES.map((emp) => (
                    <div key={emp.name} className="flex items-center gap-1.5">
                      <Avatar name={emp.name} size="xs" color={emp.color} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[9px] font-medium text-ink-800">{emp.name}</p>
                        <p className="truncate text-[8px] text-ink-400">{emp.status}</p>
                      </div>
                      <span className="size-1.5 rounded-full bg-success-500" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-lg border border-ink-100 p-2.5">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-semibold text-ink-700">Activity Overview</p>
                  <span className="text-[8px] text-ink-400">7 Days</span>
                </div>
                <svg viewBox="0 0 100 44" className="mt-2 h-11 w-full">
                  <polyline points={CHART_POINTS} fill="none" stroke="#6D3EF2" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute -bottom-7 -right-6 w-44 rounded-xl border border-ink-200 bg-white p-3 shadow-overlay sm:-right-10 sm:w-48">
        <div className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-full bg-info-100 text-info-600">
            <PhoneCall className="size-3" />
          </span>
          <div>
            <p className="text-[10px] font-semibold text-ink-900">Voice Support Agent</p>
            <p className="text-[8.5px] text-success-600">● On Call</p>
          </div>
        </div>
        <div className="mt-2.5 flex h-5 items-center gap-[3px]">
          {[6, 12, 8, 16, 10, 14, 7, 11, 5].map((h, i) => (
            <span key={i} className="w-[3px] rounded-full bg-brand-400" style={{ height: `${h}px` }} />
          ))}
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[9px] font-medium text-ink-500">05:24</span>
          <span className="rounded-md bg-brand-600 px-2 py-1 text-[8.5px] font-semibold text-white">Join Call</span>
        </div>
      </div>
    </div>
  )
}
