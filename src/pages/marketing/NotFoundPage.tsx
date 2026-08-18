import { MarketingHeader } from '@/components/marketing/MarketingHeader'
import { MarketingFooter } from '@/components/marketing/MarketingFooter'
import { NotFoundContent } from '@/components/layout/NotFoundContent'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <MarketingHeader />
      <div className="flex-1">
        <NotFoundContent />
      </div>
      <MarketingFooter />
    </div>
  )
}
