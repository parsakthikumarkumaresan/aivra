import { Logo } from '@/components/ui/Logo'
import { Globe, Link2, Rss } from 'lucide-react'

const FOOTER_COLUMNS = [
  {
    title: 'Product',
    links: ['AI Workforce Platform', 'Company Brain', 'Integrations', 'Security & Governance', 'Changelog'],
  },
  {
    title: 'AI Employees',
    links: ['AI HR Employee', 'AI Voice Employee', 'Request a New Employee'],
  },
  {
    title: 'Solutions',
    links: ['Jewellery & Retail', 'Hotels', 'Restaurants', 'Real Estate', 'Automobile', 'Healthcare'],
  },
  {
    title: 'Resources',
    links: ['Documentation', 'API Reference', 'Case Studies', 'Blog', 'Help Center'],
  },
  {
    title: 'Company',
    links: ['About Us', 'Careers', 'Pricing', 'Contact Sales'],
  },
]

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
            <div className="mt-5 flex items-center gap-3 text-ink-400">
              <a href="#" aria-label="Company website" className="hover:text-ink-700">
                <Globe className="size-4" />
              </a>
              <a href="#" aria-label="Blog" className="hover:text-ink-700">
                <Rss className="size-4" />
              </a>
              <a href="#" aria-label="Social links" className="hover:text-ink-700">
                <Link2 className="size-4" />
              </a>
            </div>
          </div>
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="text-[13px] font-semibold text-ink-900">{col.title}</h4>
              <ul className="mt-3 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-[13px] text-ink-500 hover:text-ink-800">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-ink-100 pt-6 sm:flex-row">
          <p className="text-xs text-ink-400">© {new Date().getFullYear()} AIVRA Technologies Inc. All rights reserved.</p>
          <div className="flex items-center gap-5 text-xs text-ink-400">
            <a href="#" className="hover:text-ink-700">Privacy Policy</a>
            <a href="#" className="hover:text-ink-700">Terms of Service</a>
            <a href="#" className="hover:text-ink-700">Security</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
