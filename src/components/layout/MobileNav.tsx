import { NavLink } from 'react-router-dom'

import {
  BookOpen,
  Compass,
  Heart,
  Home,
  LineChart,
  ListMusic,
  Settings as SettingsIcon,
  Sparkles,
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
  'Liked Songs': Heart,
  Playlists: ListMusic,
  'AI DJ': Sparkles,
  Insights: LineChart,
  Settings: SettingsIcon,
} as const

export function MobileNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 overflow-x-auto border-t border-white/10 bg-[#121212]/95 backdrop-blur-xl lg:hidden"
      style={{
        height: MOBILE_NAV_HEIGHT,
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
      aria-label="Mobile navigation"
    >
      {/*
        min-w-max prevents all navigation items from becoming
        extremely narrow now that the app has more pages.

        On smaller screens, the navigation can scroll sideways.
      */}
      <ul className="flex h-full min-w-max items-center px-2">
        {NAV_ITEMS.map((item) => {
          const Icon =
            iconMap[item.label as keyof typeof iconMap] ?? Home

          return (
            <li
              key={item.to}
              className="w-20 flex-none"
            >
              <NavLink
                to={item.to}
                end={item.to === '/'}
                onClick={(event) => {
                  if (item.disabled) {
                    event.preventDefault()
                  }
                }}
                className={({ isActive }) =>
                  cn(
                    'flex flex-col items-center gap-1 rounded-lg py-2 text-[10px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40',
                    item.disabled &&
                      'pointer-events-none opacity-40',
                    isActive && !item.disabled
                      ? 'text-[var(--accent)]'
                      : 'text-white/50 hover:text-white',
                  )
                }
              >
                <Icon
                  className="h-5 w-5"
                  aria-hidden="true"
                />

                <span>{item.mobileLabel}</span>
              </NavLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}