import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, Menu, Users, Mic, FileText, BookOpen, Building2, ShoppingBag, Hotel, UtensilsCrossed } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { Button } from '@/components/ui/Button'
import { Drawer } from '@/components/ui/Drawer'
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
  { label: 'AI HR Employee', href: '#hr-employee', description: 'Screens, interviews and schedules candidates', icon: <Users className="size-4" /> },
  { label: 'AI Voice Employee', href: '#voice-employee', description: 'Handles calls, bookings and support', icon: <Mic className="size-4" /> },
]

const SOLUTION_LINKS: NavLinkItem[] = [
  { label: 'Jewellery & Retail', href: '#solutions', description: 'Enquiries, order status and bookings', icon: <ShoppingBag className="size-4" /> },
  { label: 'Hotels & Hospitality', href: '#solutions', description: 'Reservations and guest support', icon: <Hotel className="size-4" /> },
  { label: 'Restaurants', href: '#solutions', description: 'Table bookings and takeaway orders', icon: <UtensilsCrossed className="size-4" /> },
]

function NavDropdown({ label, items }: { label: string; items: NavLinkItem[] }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button className="flex items-center gap-1 rounded-md px-3 py-2 text-[13.5px] font-medium text-ink-700 hover:text-ink-900">
        {label}
        <ChevronDown className={cn('size-3.5 transition-transform duration-150', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="absolute left-1/2 top-full z-30 w-80 -translate-x-1/2 pt-2">
          <div className="rounded-xl border border-ink-200 bg-white p-2 shadow-elevated">
            {items.map((item) => (
              <a key={item.label} href={item.href} className="flex items-start gap-3 rounded-lg p-2.5 hover:bg-ink-50">
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                  {item.icon}
                </span>
                <span>
                  <span className="block text-[13.5px] font-semibold text-ink-900">{item.label}</span>
                  <span className="block text-xs text-ink-500">{item.description}</span>
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const ALL_LINKS: NavLinkItem[] = [...PRODUCT_LINKS, ...EMPLOYEE_LINKS, ...SOLUTION_LINKS]

export function MarketingHeader() {
  const [mobileOpen, setMobileOpen] = useState(false)
  return (
    <header className="sticky top-0 z-40 border-b border-ink-200 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-0.5 lg:flex">
          <NavDropdown label="Product" items={PRODUCT_LINKS} />
          <NavDropdown label="AI Employees" items={EMPLOYEE_LINKS} />
          <NavDropdown label="Solutions" items={SOLUTION_LINKS} />
          <a href="#resources" className="flex items-center gap-1 rounded-md px-3 py-2 text-[13.5px] font-medium text-ink-700 hover:text-ink-900">
            <BookOpen className="size-3.5" />
            Resources
          </a>
          <a href="#pricing" className="rounded-md px-3 py-2 text-[13.5px] font-medium text-ink-700 hover:text-ink-900">
            Pricing
          </a>
          <a href="#about" className="rounded-md px-3 py-2 text-[13.5px] font-medium text-ink-700 hover:text-ink-900">
            About Us
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/login">
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
              Login
            </Button>
          </Link>
          <Button size="sm" className="hidden sm:inline-flex">
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

      <Drawer open={mobileOpen} onClose={() => setMobileOpen(false)} title={<Logo markSize={26} />} width="320px">
        <div className="flex flex-col gap-1">
          {ALL_LINKS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="flex items-start gap-3 rounded-lg p-2.5 hover:bg-ink-50"
            >
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                {item.icon}
              </span>
              <span>
                <span className="block text-[13.5px] font-semibold text-ink-900">{item.label}</span>
                <span className="block text-xs text-ink-500">{item.description}</span>
              </span>
            </a>
          ))}
          <a href="#resources" onClick={() => setMobileOpen(false)} className="rounded-lg px-2.5 py-2.5 text-[13.5px] font-medium text-ink-700 hover:bg-ink-50">
            Resources
          </a>
          <a href="#pricing" onClick={() => setMobileOpen(false)} className="rounded-lg px-2.5 py-2.5 text-[13.5px] font-medium text-ink-700 hover:bg-ink-50">
            Pricing
          </a>
          <a href="#about" onClick={() => setMobileOpen(false)} className="rounded-lg px-2.5 py-2.5 text-[13.5px] font-medium text-ink-700 hover:bg-ink-50">
            About Us
          </a>
        </div>
        <div className="mt-4 flex flex-col gap-2 border-t border-ink-100 pt-4">
          <Link to="/login" onClick={() => setMobileOpen(false)}>
            <Button variant="outline" className="w-full">
              Login
            </Button>
          </Link>
          <Button className="w-full">Book a Demo</Button>
        </div>
      </Drawer>
    </header>
  )
}
