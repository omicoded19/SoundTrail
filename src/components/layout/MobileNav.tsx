import { NavLink } from 'react-router-dom'

import {
  BookOpen,
  Compass,
  Heart,
  Home,
  LineChart,
  ListMusic,
  Settings as SettingsIcon,
} from 'lucide-react'

import { cn } from '@/lib/cn'
import {
  MOBILE_NAV_HEIGHT,
  NAV_ITEMS,
} from '@/lib/constants'

const iconMap = {
  Home,
  Discover: Compass,
  Journal: BookOpen,
  Insights: LineChart,
  'Liked Songs': Heart,
  Playlists: ListMusic,
  Settings: SettingsIcon,
} as const

export function MobileNav() {
  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed bottom-0 left-0 right-0 z-40 overflow-x-auto border-t border-white/10 bg-[rgba(12,12,16,0.82)] shadow-[0_-15px_45px_rgba(0,0,0,0.35)] backdrop-blur-2xl backdrop-saturate-150 lg:hidden"
      style={{
        height: MOBILE_NAV_HEIGHT,
        paddingBottom:
          'env(safe-area-inset-bottom)',
      }}
    >
      <ul className="flex h-full min-w-max items-center px-2">
        {NAV_ITEMS.map((item) => {
          const Icon =
            iconMap[
              item.label as keyof typeof iconMap
            ] ?? Home

          return (
            <li
              key={item.to}
              className="w-20 flex-none"
            >
              <NavLink
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  cn(
                    'flex flex-col items-center gap-1 rounded-xl border border-transparent py-2 text-[10px] font-medium transition',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]',
                    isActive
                      ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
                      : 'text-white/50 hover:bg-white/[0.06] hover:text-white',
                  )
                }
              >
                <Icon
                  aria-hidden="true"
                  className="h-5 w-5"
                />

                <span>
                  {item.mobileLabel}
                </span>
              </NavLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}