import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, error, ...props }, ref) => {
    return (
      <div className="relative w-full group">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--color-primary-400)] transition-colors duration-200 pointer-events-none">
            {icon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            "flex h-12 w-full rounded-2xl border border-[var(--border-color)] bg-white/5 px-4 py-2 text-sm text-white placeholder:text-[var(--text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)]/50 focus-visible:border-[var(--color-primary-500)]/50 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50",
            icon && "pl-12",
            error && "border-red-500/50 focus-visible:ring-red-500/50",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-2 ml-1 text-xs font-medium text-red-400">{error}</p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
