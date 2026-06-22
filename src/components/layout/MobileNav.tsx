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
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[rgba(12,12,16,0.9)] shadow-[0_-15px_45px_rgba(0,0,0,0.35)] backdrop-blur-2xl backdrop-saturate-150 lg:hidden"
      style={{
        height: MOBILE_NAV_HEIGHT,
        paddingBottom:
          'env(safe-area-inset-bottom)',
      }}
    >
      <ul className="grid h-full w-full grid-cols-7 items-stretch px-1">
        {NAV_ITEMS.map((item) => {
          const Icon =
            iconMap[
              item.label as keyof typeof iconMap
            ] ?? Home

          return (
            <li
              key={item.to}
              className="min-w-0"
            >
              <NavLink
                to={item.to}
                end={item.to === '/'}
                aria-label={item.label}
                className={({ isActive }) =>
                  cn(
                    'flex h-full min-w-0 flex-col items-center justify-center gap-1 rounded-xl border border-transparent px-0.5 text-[9px] font-medium leading-none transition',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--accent)]',
                    isActive
                      ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
                      : 'text-white/50 hover:bg-white/[0.06] hover:text-white',
                  )
                }
              >
                <Icon
                  aria-hidden="true"
                  className="h-[18px] w-[18px] shrink-0"
                />

                <span className="block w-full truncate text-center">
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