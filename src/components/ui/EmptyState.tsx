import { cn } from '@/lib/cn'
import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  className?: string
}

export function EmptyState({ icon: Icon, title, description, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 text-center text-white/50',
        className,
      )}
    >
      <Icon className="mb-4 h-10 w-10 stroke-[1.5]" aria-hidden="true" />
      <h3 className="text-lg font-semibold text-white/80">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-sm">{description}</p>}
    </div>
  )
}
