import { Construction } from 'lucide-react'
import { PageHeader, EmptyState } from '@/components/ui'

// Renders honestly for the one remaining not-backend-wired admin section
// (Integrations — the customer-facing Integrations page is also still
// mock-backed) instead of a fake table with invented numbers.
export default function AdminComingSoonPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Integrations" />
      <EmptyState
        icon={<Construction className="size-5" />}
        title="Not built yet"
        description="No admin-side integrations management exists yet; the customer-facing Integrations page is also currently mock-backed."
      />
    </div>
  )
}
