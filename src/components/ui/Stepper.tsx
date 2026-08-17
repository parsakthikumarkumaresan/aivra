import { Check } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface StepItem {
  id: string
  label: string
  description?: string
}

interface StepperProps {
  steps: StepItem[]
  currentIndex: number
  completedIndexes?: number[]
  onStepClick?: (index: number) => void
  className?: string
}

export function Stepper({ steps, currentIndex, completedIndexes = [], onStepClick, className }: StepperProps) {
  return (
    <ol className={cn('flex flex-col gap-1', className)}>
      {steps.map((step, index) => {
        const isComplete = completedIndexes.includes(index)
        const isActive = index === currentIndex
        const isClickable = Boolean(onStepClick) && (isComplete || isActive || index < currentIndex)
        return (
          <li key={step.id}>
            <button
              type="button"
              disabled={!isClickable}
              onClick={() => isClickable && onStepClick?.(index)}
              className={cn(
                'flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors duration-150',
                isActive ? 'bg-brand-50' : isClickable ? 'hover:bg-ink-50' : '',
                !isClickable && 'cursor-default',
              )}
            >
              <span
                className={cn(
                  'mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                  isComplete
                    ? 'bg-brand-600 text-white'
                    : isActive
                      ? 'border-2 border-brand-600 text-brand-700'
                      : 'border border-ink-300 text-ink-400',
                )}
              >
                {isComplete ? <Check className="size-3.5" /> : index + 1}
              </span>
              <span className="min-w-0">
                <span className={cn('block text-sm font-medium', isActive ? 'text-brand-800' : isComplete ? 'text-ink-800' : 'text-ink-500')}>
                  {step.label}
                </span>
                {step.description && <span className="mt-0.5 block text-xs text-ink-500">{step.description}</span>}
              </span>
            </button>
          </li>
        )
      })}
    </ol>
  )
}

export function StepperHorizontal({ steps, currentIndex, completedIndexes = [] }: StepperProps) {
  return (
    <ol className="flex items-center">
      {steps.map((step, index) => {
        const isComplete = completedIndexes.includes(index)
        const isActive = index === currentIndex
        return (
          <li key={step.id} className={cn('flex items-center', index < steps.length - 1 && 'flex-1')}>
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={cn(
                  'flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                  isComplete ? 'bg-brand-600 text-white' : isActive ? 'border-2 border-brand-600 text-brand-700' : 'border border-ink-300 text-ink-400',
                )}
              >
                {isComplete ? <Check className="size-3.5" /> : index + 1}
              </span>
              <span className={cn('max-w-20 text-center text-[11px] font-medium leading-tight', isActive ? 'text-brand-700' : 'text-ink-500')}>
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={cn('mx-2 h-px flex-1', isComplete ? 'bg-brand-400' : 'bg-ink-200')} />
            )}
          </li>
        )
      })}
    </ol>
  )
}
