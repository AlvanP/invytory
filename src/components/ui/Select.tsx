import { type SelectHTMLAttributes, forwardRef, useId } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/utils/cn'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  optional?: boolean
  error?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, optional, error, id, className, children, ...props }, ref) => {
    const generatedId = useId()
    const inputId = id ?? generatedId

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-ink-soft flex items-baseline gap-1.5">
            {label}
            {optional && <span className="text-xs font-normal text-ink-soft/60">(optional)</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={inputId}
            className={cn(
              'w-full appearance-none rounded-xs border border-ink/15 bg-white px-4 py-3 text-sm text-ink',
              'transition-colors duration-150 focus:border-gold focus:outline-none',
              error && 'border-danger',
              className
            )}
            {...props}
          >
            {children}
          </select>
          <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-ink-soft/60" />
        </div>
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
    )
  }
)
Select.displayName = 'Select'
