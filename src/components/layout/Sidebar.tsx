import { NavLink } from 'react-router-dom'

import {
  BookOpen,
  Compass,
  Disc3,
  Heart,
  Home,
  LineChart,
  ListMusic,
  Settings as SettingsIcon,
  Sparkles,
} from 'lucide-react'

import { cn } from '@/lib/cn'
import { NAV_ITEMS } from '@/lib/constants'

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

export function Sidebar() {
  return (
    <aside
      className="fixed left-0 top-0 z-40 hidden h-screen w-60 flex-col bg-sidebar lg:flex"
      aria-label="Main navigation"
    >
      {/* SoundTrail logo */}
      <div className="flex items-center gap-3 px-6 py-7">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-soft)]">
          <Disc3
            className="h-5 w-5 text-[var(--accent)]"
            aria-hidden="true"
          />
        </div>

        <span className="text-lg font-bold tracking-tight text-white">
          SoundTrail
        </span>
      </div>

      {/* Navigation links */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3">
        {NAV_ITEMS.map((item) => {
          const Icon =
            iconMap[item.label as keyof typeof iconMap] ?? Home

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={(event) => {
                if (item.disabled) {
                  event.preventDefault()
                }
              }}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]',
                  item.disabled &&
                    'cursor-not-allowed opacity-40',
                  isActive && !item.disabled
                    ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
                    : 'text-white/60 hover:bg-white/5 hover:text-white',
                )
              }
            >
              <Icon
                className="h-5 w-5 shrink-0"
                aria-hidden="true"
              />

              {item.label}
            </NavLink>
          )
        })}
      </nav>

      {/* Project status */}
      <div className="border-t border-white/5 px-6 py-5">
        <p className="text-xs text-white/30">
          Phase 1A · Mock data
        </p>
      </div>
    </aside>
  )
}