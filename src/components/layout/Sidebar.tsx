import { NavLink } from 'react-router-dom'
import { Compass, Disc3, Heart, Home, LineChart, Sparkles, BookOpen } from 'lucide-react'
import { cn } from '@/lib/cn'
import { NAV_ITEMS } from '@/lib/constants'

const iconMap = {
  Home,
  Discover: Compass,
  Journal: BookOpen,
  'Liked Songs': Heart,
  'AI DJ': Sparkles,
  Insights: LineChart,
} as const

export function Sidebar() {
  return (
    <aside
      className="fixed left-0 top-0 z-40 hidden h-screen w-60 flex-col bg-sidebar lg:flex"
      aria-label="Main navigation"
    >
      <div className="flex items-center gap-3 px-6 py-7">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
          <Disc3 className="h-5 w-5 text-white" aria-hidden="true" />
        </div>
        <span className="text-lg font-bold tracking-tight text-white">SoundTrail</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {NAV_ITEMS.map((item) => {
          const Icon = iconMap[item.label as keyof typeof iconMap] ?? Home
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={(e) => item.disabled && e.preventDefault()}
              aria-current={undefined}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40',
                  item.disabled && 'cursor-not-allowed opacity-40',
                  isActive && !item.disabled
                    ? 'bg-white/10 text-white'
                    : 'text-white/60 hover:bg-white/5 hover:text-white',
                )
              }
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
              {item.label}
            </NavLink>
          )
        })}
      </nav>

      <div className="border-t border-white/5 px-6 py-5">
        <p className="text-xs text-white/30">Phase 1A · Mock data</p>
      </div>
    </aside>
  )
}
