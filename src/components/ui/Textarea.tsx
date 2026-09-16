import { type TextareaHTMLAttributes, forwardRef, useId } from 'react'
import { cn } from '@/utils/cn'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  hint?: string
  error?: string
  optional?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, hint, error, optional, id, className, rows = 4, ...props }, ref) => {
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
        <textarea
          ref={ref}
          id={inputId}
          rows={rows}
          aria-invalid={!!error}
          className={cn(
            'w-full rounded-xs border border-ink/15 bg-white px-4 py-3 text-sm text-ink placeholder:text-ink-soft/40 resize-y',
            'transition-colors duration-150 focus:border-gold focus:outline-none',
            error && 'border-danger',
            className
          )}
          {...props}
        />
        {hint && !error && <p className="text-xs text-ink-soft/70">{hint}</p>}
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'
