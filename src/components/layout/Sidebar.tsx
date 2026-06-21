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
} from 'lucide-react'

import { cn } from '@/lib/cn'
import { NAV_ITEMS } from '@/lib/constants'

const iconMap = {
  Home,
  Discover: Compass,
  Journal: BookOpen,
  Insights: LineChart,
  'Liked Songs': Heart,
  Playlists: ListMusic,
  Settings: SettingsIcon,
} as const

export function Sidebar() {
  return (
    <aside
      aria-label="Main navigation"
      className="fixed left-0 top-0 z-40 hidden h-screen w-60 flex-col border-r border-white/10 bg-[rgba(12,12,16,0.78)] shadow-[20px_0_60px_rgba(0,0,0,0.22)] backdrop-blur-2xl backdrop-saturate-150 lg:flex"
    >
      <div className="flex items-center gap-3 px-6 py-7">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[var(--accent-soft)] shadow-[0_0_22px_var(--accent-glow)]">
          <Disc3
            aria-hidden="true"
            className="h-5 w-5 text-[var(--accent)]"
          />
        </div>

        <div>
          <span className="block text-lg font-bold tracking-tight text-white">
            SoundTrail
          </span>

          <span className="block text-[10px] uppercase tracking-[0.18em] text-white/30">
            Music discovery
          </span>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3">
        {NAV_ITEMS.map((item) => {
          const Icon =
            iconMap[
              item.label as keyof typeof iconMap
            ] ?? Home

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]',
                  isActive
                    ? 'border border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)] shadow-[0_0_20px_var(--accent-glow)]'
                    : 'border border-transparent text-white/60 hover:border-white/10 hover:bg-white/[0.06] hover:text-white',
                )
              }
            >
              <Icon
                aria-hidden="true"
                className="h-5 w-5 shrink-0"
              />

              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      <div className="px-5 pb-5">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 backdrop-blur-xl">
          <p className="text-xs font-medium text-white/60">
            Real music discovery
          </p>

          <p className="mt-1 text-[11px] leading-4 text-white/30">
            Artist metadata, artwork and playable catalogue
            previews.
          </p>
        </div>
      </div>
    </aside>
  )
}