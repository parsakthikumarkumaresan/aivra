import { useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { isInternalModeEnabled } from '@/services/mock/internalMode'
import { Button } from '@/components/ui/Button'

// Generic guard for AIVRA-internal-only surfaces that live outside the
// customer app shell (the Voice Agent Builder, Telephony). Same mechanism
// as VoiceAdvancedSetupGate — a localStorage flag toggled only from
// Settings → Developer, off by default so a normal session never sees these.
export function InternalGate() {
  const [internal] = useState(isInternalModeEnabled)

  if (!internal) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-ink-25 px-6 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-warning-100 text-warning-600">
          <ShieldAlert className="size-6" />
        </div>
        <h1 className="mt-4 text-[19px] font-bold text-ink-900">AIVRA Internal Configuration</h1>
        <p className="mt-2 max-w-sm text-[13.5px] text-ink-600">This area is used by the AIVRA implementation team to build and operate Voice Employees.</p>
        <p className="mt-1 max-w-sm text-[13.5px] text-ink-600">Customer access is not available here.</p>
        <Link to="/app" className="mt-6">
          <Button variant="outline">Return to AIVRA</Button>
        </Link>
      </div>
    )
  }

  return <Outlet />
}
