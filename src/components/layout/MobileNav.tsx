import { NavLink } from 'react-router-dom'
import { Compass, Home, LineChart, Sparkles, BookOpen } from 'lucide-react'
import { cn } from '@/lib/cn'
import { NAV_ITEMS, MOBILE_NAV_HEIGHT } from '@/lib/constants'

const iconMap = {
  Home,
  Discover: Compass,
  Journal: BookOpen,
  'AI DJ': Sparkles,
  Insights: LineChart,
} as const

export function MobileNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[#121212]/95 backdrop-blur-xl lg:hidden"
      style={{ height: MOBILE_NAV_HEIGHT, paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Mobile navigation"
    >
      <ul className="flex h-full items-center justify-around px-2">
        {NAV_ITEMS.map((item) => {
          const Icon = iconMap[item.label as keyof typeof iconMap] ?? Home
          return (
            <li key={item.to} className="flex-1">
              <NavLink
                to={item.to}
                end={item.to === '/'}
                onClick={(e) => item.disabled && e.preventDefault()}
                className={({ isActive }) =>
                  cn(
                    'flex flex-col items-center gap-1 py-2 text-[10px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40',
                    item.disabled && 'pointer-events-none opacity-40',
                    isActive && !item.disabled ? 'text-white' : 'text-white/50',
                  )
                }
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                <span>{item.mobileLabel}</span>
              </NavLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
