import { type ButtonHTMLAttributes, type ReactNode, forwardRef } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/utils/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  isLoading?: boolean
  icon?: ReactNode
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-ink text-ivory hover:bg-ink-soft',
  secondary: 'bg-gold text-ivory hover:brightness-95',
  outline: 'border border-ink text-ink hover:bg-ink hover:text-ivory',
  ghost: 'text-ink hover:bg-ivory-deep',
  danger: 'bg-danger text-ivory hover:brightness-95',
}

const sizeClasses: Record<Size, string> = {
  sm: 'text-sm px-4 py-2 gap-1.5',
  md: 'text-sm px-6 py-3 gap-2',
  lg: 'text-base px-8 py-4 gap-2.5',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading, icon, disabled, className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center rounded-xs font-medium tracking-wide transition-colors duration-200',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {isLoading ? <Loader2 className="size-4 animate-spin" /> : icon}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
