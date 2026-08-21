import { Link } from 'react-router-dom'
import { Logo } from '@/components/ui/Logo'
import { useLeadFlow } from '@/app/LeadFlowContext'

interface FooterLink {
  label: string
  href?: string // internal route, or a homepage hash like "/#platform"
  action?: 'demo' // opens the demo-request modal instead of navigating
}

// Every entry here points at a real destination. Items that had no real
// page or section behind them (Solutions, Resources, About Us, Careers,
// Pricing, Changelog, "Request a New Employee", legal pages, social links)
// were removed rather than left as href="#" placeholders.
const FOOTER_COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: 'Product',
    links: [
      { label: 'AI Workforce Platform', href: '/#platform' },
      { label: 'Company Brain', href: '/#company-brain' },
      { label: 'Integrations', href: '/#company-brain' },
      { label: 'Security & Governance', href: '/#governance' },
    ],
  },
  {
    title: 'AI Employees',
    links: [
      { label: 'Aivra Hr', href: '/ai-employees/hr' },
      { label: 'AI Voice Employee', href: '/ai-employees/voice' },
    ],
  },
  {
    title: 'Company',
    links: [{ label: 'Contact Sales', action: 'demo' }],
  },
]

function FooterLinkItem({ link }: { link: FooterLink }) {
  const { openDemoRequest } = useLeadFlow()
  const className = 'text-[13px] text-ink-500 hover:text-ink-800'
  if (link.action === 'demo') {
    return (
      <button type="button" onClick={() => openDemoRequest('hr')} className={className}>
        {link.label}
      </button>
    )
  }
  return (
    <Link to={link.href!} className={className}>
      {link.label}
    </Link>
  )
}

export function MarketingFooter() {
  return (
    <footer className="border-t border-ink-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:grid-cols-6">
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <Logo />
            <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-ink-500">
              The AI Workforce Operating System. Deploy governed AI Employees across voice, chat and business systems.
            </p>
          </div>
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="text-[13px] font-semibold text-ink-900">{col.title}</h4>
              <ul className="mt-3 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <FooterLinkItem link={link} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 border-t border-ink-100 pt-6">
          <p className="text-xs text-ink-400">© {new Date().getFullYear()} AIVRA Technologies Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
