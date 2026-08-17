import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Briefcase, Users2, PhoneCall, CalendarCheck2, CalendarClock, BarChart3, Settings2 } from 'lucide-react'
import { cn } from '@/utils/cn'

const ITEMS = [
  { label: 'Overview', href: '/app/employees/hr', icon: LayoutDashboard, end: true },
  { label: 'Jobs', href: '/app/employees/hr/jobs', icon: Briefcase },
  { label: 'Candidates', href: '/app/employees/hr/candidates', icon: Users2 },
  { label: 'Screenings', href: '/app/employees/hr/screenings', icon: PhoneCall },
  { label: 'Interviews', href: '/app/employees/hr/interviews', icon: CalendarCheck2 },
  { label: 'Scheduling', href: '/app/employees/hr/schedule', icon: CalendarClock },
  { label: 'Reports', href: '/app/employees/hr/reports', icon: BarChart3 },
  { label: 'Configuration', href: '/app/employees/hr/configuration', icon: Settings2 },
]

export function HrSubNav() {
  return (
    <nav className="flex items-center gap-1 overflow-x-auto border-b border-ink-200 pb-px">
      {ITEMS.map((item) => (
        <NavLink
          key={item.href}
          to={item.href}
          end={item.end}
          className={({ isActive }) =>
            cn(
              'relative flex shrink-0 items-center gap-1.5 whitespace-nowrap px-3 py-2.5 text-[13px] font-medium transition-colors duration-150',
              isActive ? 'text-brand-700' : 'text-ink-500 hover:text-ink-800',
            )
          }
        >
          {({ isActive }) => (
            <>
              <item.icon className="size-3.5" />
              {item.label}
              {isActive && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-brand-600" />}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
