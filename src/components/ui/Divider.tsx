import { cn } from '@/utils/cn'

export function Divider({ className, vertical }: { className?: string; vertical?: boolean }) {
  return <div className={cn(vertical ? 'w-px self-stretch bg-ink-200' : 'h-px w-full bg-ink-200', className)} />
}
