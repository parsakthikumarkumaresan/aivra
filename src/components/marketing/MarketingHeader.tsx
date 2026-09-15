import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, Menu, Users, Mic, FileText, Building2 } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { Button } from '@/components/ui/Button'
import { Drawer } from '@/components/ui/Drawer'
import { useLeadFlow } from '@/app/LeadFlowContext'
import { cn } from '@/utils/cn'

interface NavLinkItem {
  label: string
  href: string
  description: string
  icon: React.ReactNode
}

const PRODUCT_LINKS: NavLinkItem[] = [
  { label: 'AI Workforce Platform', href: '#platform', description: 'The operating system behind every AI Employee', icon: <Building2 className="size-4" /> },
  { label: 'Company Brain', href: '#company-brain', description: 'Shared knowledge that powers every employee', icon: <FileText className="size-4" /> },
]

const EMPLOYEE_LINKS: NavLinkItem[] = [
  { label: 'Jexa HR', href: '/ai-employees/hr', description: 'Screens, interviews and schedules candidates', icon: <Users className="size-4" /> },
  { label: 'Jaan', href: '/ai-employees/voice', description: 'Handles calls, bookings and support', icon: <Mic className="size-4" /> },
]

// Employee links point to real routes (/ai-employees/*); Product links are
// same-page anchors that exist on the homepage. Solutions/Resources/Pricing/
// About Us were removed rather than left as href="#" — there's no page or
// section behind them yet, and pointing them at an unrelated existing page
// would be more misleading than not showing the nav item at all.
function NavLinkContent({ item, onClick, className }: { item: NavLinkItem; onClick?: () => void; className?: string }) {
  const inner = (
    <>
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
        {item.icon}
      </span>
      <span>
        <span className="block text-[13.5px] font-semibold text-ink-900">{item.label}</span>
        <span className="block text-xs text-ink-500">{item.description}</span>
      </span>
    </>
  )
  const cls = className ?? 'flex items-start gap-3 rounded-lg p-2.5 transition-colors duration-150 hover:bg-ink-50'
  return item.href.startsWith('/') ? (
    <Link to={item.href} onClick={onClick} className={cls}>{inner}</Link>
  ) : (
    <a href={item.href} onClick={onClick} className={cls}>{inner}</a>
  )
}

function NavDropdown({ label, items }: { label: string; items: NavLinkItem[] }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button className="flex items-center gap-1 rounded-md px-3 py-2 text-[13.5px] font-medium text-ink-700 transition-colors duration-200 hover:text-brand-600">
        {label}
        <ChevronDown className={cn('size-3.5 transition-transform duration-200', open && 'rotate-180')} />
      </button>
      <div
        className={cn(
          'absolute left-1/2 top-full z-30 w-80 -translate-x-1/2 pt-2 transition-all duration-200 ease-out',
          open ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-1 opacity-0',
        )}
      >
        <div className="rounded-xl border border-ink-200 bg-surface-elevated/95 p-2 shadow-elevated backdrop-blur-sm">
          {items.map((item) => (
            <NavLinkContent key={item.label} item={item} />
          ))}
        </div>
      </div>
    </div>
  )
}

const ALL_LINKS: NavLinkItem[] = [...PRODUCT_LINKS, ...EMPLOYEE_LINKS]

export function MarketingHeader() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { openDemoRequest } = useLeadFlow()

  return (
    <header className="sticky top-0 z-40 border-b border-ink-200 bg-ink-25/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:h-20">
        <Link to="/" className="hero-reveal" style={{ animationDelay: '0ms' }}>
          <Logo markSize={44} markSizeLg={60} />
        </Link>
        <nav className="hidden items-center gap-0.5 lg:flex hero-reveal" style={{ animationDelay: '90ms' }}>
          <NavDropdown label="Product" items={PRODUCT_LINKS} />
          <NavDropdown label="AI Employees" items={EMPLOYEE_LINKS} />
        </nav>
        <div className="flex items-center gap-2 hero-reveal" style={{ animationDelay: '160ms' }}>
          <Link to="/login">
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
              Login
            </Button>
          </Link>
          <Button size="sm" className="hidden sm:inline-flex" onClick={() => openDemoRequest('hr')}>
            Book a Demo
          </Button>
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="flex size-9 items-center justify-center rounded-lg text-ink-600 hover:bg-ink-100 lg:hidden"
          >
            <Menu className="size-5" />
          </button>
        </div>
      </div>

      <Drawer open={mobileOpen} onClose={() => setMobileOpen(false)} title={<Logo markSize={32} />} width="320px">
        <div className="flex flex-col gap-1">
          {ALL_LINKS.map((item) => (
            <NavLinkContent key={item.label} item={item} onClick={() => setMobileOpen(false)} />
          ))}
        </div>
        <div className="mt-4 flex flex-col gap-2 border-t border-ink-100 pt-4">
          <Link to="/login" onClick={() => setMobileOpen(false)}>
            <Button variant="outline" className="w-full">
              Login
            </Button>
          </Link>
          <Button
            className="w-full"
            onClick={() => {
              setMobileOpen(false)
              openDemoRequest('hr')
            }}
          >
            Book a Demo
          </Button>
        </div>
      </Drawer>
    </header>
  )
}
