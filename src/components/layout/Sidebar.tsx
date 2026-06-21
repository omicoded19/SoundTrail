import {
  NavLink,
  useNavigate,
} from 'react-router-dom'

import {
  BookOpen,
  Compass,
  Disc3,
  Heart,
  Home,
  LineChart,
  ListMusic,
  LogIn,
  LogOut,
  Settings as SettingsIcon,
  UserRound,
} from 'lucide-react'

import { useAuthStore } from '@/features/auth/auth-store'
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

function getUserInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
}

export function Sidebar() {
  const navigate = useNavigate()

  const user = useAuthStore(
    (state) => state.user,
  )

  const isAuthenticated =
    useAuthStore(
      (state) =>
        state.isAuthenticated,
    )

  const logout = useAuthStore(
    (state) => state.logout,
  )

  function handleLogout() {
    logout()
    navigate('/login')
  }

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
              className={({
                isActive,
              }) =>
                cn(
                  'flex items-center gap-3 rounded-xl border px-3 py-3 text-sm font-medium transition',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]',
                  isActive
                    ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)] shadow-[0_0_20px_var(--accent-glow)]'
                    : 'border-transparent text-white/60 hover:border-white/10 hover:bg-white/[0.06] hover:text-white',
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

      <div className="space-y-3 px-4 pb-5">
        {isAuthenticated &&
        user ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-3 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-[var(--accent)] bg-[var(--accent-soft)] text-sm font-bold text-[var(--accent)] shadow-[0_0_18px_var(--accent-glow)]">
                {user.name
                  ? getUserInitials(
                      user.name,
                    )
                  : (
                    <UserRound
                      size={18}
                    />
                  )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">
                  {user.name}
                </p>

                <p className="mt-0.5 truncate text-[11px] text-white/35">
                  {user.email}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-white/55 transition hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
            >
              <LogOut size={15} />
              Log out
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-3 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white/50">
                <UserRound
                  size={18}
                />
              </div>

              <div>
                <p className="text-sm font-semibold text-white">
                  Your SoundTrail
                </p>

                <p className="mt-0.5 text-[11px] text-white/35">
                  Save songs and playlists
                </p>
              </div>
            </div>

            <NavLink
              to="/login"
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-3 py-2 text-xs font-semibold text-white shadow-[0_0_20px_var(--accent-glow)] transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            >
              <LogIn size={15} />
              Sign in
            </NavLink>

            <NavLink
              to="/register"
              className="mt-2 flex w-full items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-white/55 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
            >
              Create account
            </NavLink>
          </div>
        )}

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 backdrop-blur-xl">
          <p className="text-xs font-medium text-white/60">
            Real music discovery
          </p>

          <p className="mt-1 text-[11px] leading-4 text-white/30">
            Artist metadata,
            artwork and playable
            catalogue previews.
          </p>
        </div>
      </div>
    </aside>
  )
}