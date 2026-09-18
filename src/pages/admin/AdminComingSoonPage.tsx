import { useLocation } from 'react-router-dom'
import { Construction } from 'lucide-react'
import { ADMIN_NAV } from '@/components/admin/adminNavigation'
import { PageHeader, EmptyState, Badge } from '@/components/ui'

// Renders honestly for every admin nav section that isn't backend-wired
// yet, instead of a fake table with invented numbers (spec section 3/36:
// "Do not make fake functionality appear production-ready").
export default function AdminComingSoonPage() {
  const { pathname } = useLocation()
  const item = ADMIN_NAV.find((nav) => nav.href === pathname)

  return (
    <div className="space-y-6">
      <PageHeader
        title={item?.label ?? 'Coming soon'}
        actions={item?.phase && <Badge tone="brand">{item.phase}</Badge>}
      />
      <EmptyState
        icon={<Construction className="size-5" />}
        title="Not built yet"
        description={item?.description ?? 'This section is planned but not implemented.'}
      />
    </div>
  )
}
