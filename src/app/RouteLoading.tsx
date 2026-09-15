import { Loader2 } from 'lucide-react'

export function RouteLoading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-ink-25">
      <Loader2 className="size-6 animate-spin text-brand-600" />
    </div>
  )
}
