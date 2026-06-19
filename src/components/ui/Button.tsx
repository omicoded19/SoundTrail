import { cn } from '@/lib/cn'
import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'ghost' | 'primary' | 'icon'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({
  className,
  variant = 'ghost',
  size = 'md',
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center rounded-full font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 disabled:pointer-events-none disabled:opacity-40',
        variant === 'ghost' && 'text-white/80 hover:bg-white/10 hover:text-white',
        variant === 'primary' && 'bg-white text-black hover:bg-white/90',
        variant === 'icon' && 'text-white/70 hover:bg-white/10 hover:text-white',
        size === 'sm' && 'h-8 px-3 text-xs',
        size === 'md' && 'h-10 px-4 text-sm',
        size === 'lg' && 'h-12 px-6 text-base',
        className,
      )}
      {...props}
    />
  )
}
