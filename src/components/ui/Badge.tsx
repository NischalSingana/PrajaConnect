import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'outline' | 'gradient';
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-[var(--color-primary-900)]/30 text-[var(--color-primary-300)] border border-[var(--color-primary-500)]/20 shadow-[0_0_10px_rgba(139,92,246,0.1)]",
    success: "bg-emerald-900/30 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]",
    warning: "bg-yellow-900/30 text-yellow-400 border border-yellow-500/20 shadow-[0_0_10px_rgba(234,179,8,0.1)]",
    destructive: "bg-red-900/30 text-red-400 border border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]",
    outline: "text-white border border-[var(--border-color)] bg-white/5",
    gradient: "bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-secondary-600)] text-white border-none shadow-md",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-lg px-3 py-1 text-xs font-bold uppercase tracking-wider transition-all duration-200",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
