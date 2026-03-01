import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-sm font-semibold ring-offset-bg-surface transition-all active:scale-95 duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-secondary-600)] text-white shadow-[0_4px_15px_-4px_rgba(124,58,237,0.5)] hover:shadow-[0_8px_25px_-4px_rgba(124,58,237,0.6)]",
        primary: "bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-secondary-600)] text-white shadow-[0_4px_15px_-4px_rgba(124,58,237,0.5)] hover:shadow-[0_8px_25px_-4px_rgba(124,58,237,0.6)]",
        secondary: "bg-[var(--surface-color)] border border-[var(--border-color)] text-white hover:bg-[var(--color-border-dark)]",
        destructive: "bg-red-500 text-white hover:bg-red-600 shadow-sm",
        outline: "border border-[var(--border-color)] bg-transparent hover:bg-[var(--color-border-dark)] text-white",
        ghost: "hover:bg-[var(--color-border-dark)] text-white",
        link: "text-[var(--color-primary-400)] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-xl px-4",
        lg: "h-14 rounded-2xl px-10 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  isLoading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={props.disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
        ) : null}
        {children}
      </Comp>
    )
  }
)
Button.displayName = "Button"

// eslint-disable-next-line react-refresh/only-export-components
export { Button, buttonVariants }
