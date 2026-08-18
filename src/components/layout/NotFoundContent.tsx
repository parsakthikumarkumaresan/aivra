import { Link } from 'react-router-dom'
import { Home, LayoutDashboard } from 'lucide-react'
import { Button } from '@/components/ui/Button'

// Shared 404 body, reused by the public top-level catch-all and the
// authenticated /app catch-all — only the surrounding chrome differs.
export function NotFoundContent() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <p className="text-[64px] font-bold leading-none tracking-tight text-brand-600">404</p>
      <h1 className="mt-4 text-[22px] font-bold text-ink-900">Page not found</h1>
      <p className="mt-2 max-w-sm text-[14px] text-ink-500">The page you're looking for doesn't exist or may have moved.</p>
      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <Link to="/app">
          <Button icon={<LayoutDashboard className="size-4" />}>Go to Dashboard</Button>
        </Link>
        <Link to="/">
          <Button variant="outline" icon={<Home className="size-4" />}>Back to AIVRA Home</Button>
        </Link>
      </div>
    </div>
  )
}
