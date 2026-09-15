import { useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { useSetBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { isInternalModeEnabled } from '@/services/mock/internalMode'
import { Button } from '@/components/ui/Button'

// Layout-route guard for /app/employees/voice/setup/advanced — the full
// technical Voice configuration wizard (knowledge/RAG scoping, tools, the
// escalation rule engine, telephony). This is JEXA.AI-internal functionality,
// not a customer workflow, so by default (no internal-mode flag set) it
// renders a blocker instead of the wizard. The flag is only ever set from
// Settings → Developer → "Enable JEXA.AI Internal Mode".
export function VoiceAdvancedSetupGate() {
  useSetBreadcrumbs([{ label: 'AI Employees', href: '/app/employees' }, { label: 'Jaan', href: '/app/employees/voice' }, { label: 'Advanced Setup' }])
  const [internal] = useState(isInternalModeEnabled)

  if (!internal) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center px-6 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-warning-100 text-warning-600">
          <ShieldAlert className="size-6" />
        </div>
        <h1 className="mt-4 text-[19px] font-bold text-ink-900">JEXA.AI Internal Configuration</h1>
        <p className="mt-2 max-w-sm text-[13.5px] text-ink-600">This configuration is managed by the JEXA.AI implementation team.</p>
        <p className="mt-1 max-w-sm text-[13.5px] text-ink-600">Customer access is not available for this configuration.</p>
        <Link to="/app/employees/voice" className="mt-6">
          <Button variant="outline">Return to Voice Employee</Button>
        </Link>
      </div>
    )
  }

  return <Outlet />
}
