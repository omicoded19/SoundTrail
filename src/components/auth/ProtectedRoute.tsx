import {
  Navigate,
  Outlet,
  useLocation,
} from 'react-router-dom'

import {
  Disc3,
  LoaderCircle,
} from 'lucide-react'

import { useAuthStore } from '@/features/auth/auth-store'

export function ProtectedRoute() {
  const location = useLocation()

  const isAuthenticated =
    useAuthStore(
      (state) => state.isAuthenticated,
    )

  const isLoading =
    useAuthStore(
      (state) => state.isLoading,
    )

  if (isLoading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center px-6">
        <div className="text-center">
          <div className="relative mx-auto flex size-16 items-center justify-center rounded-2xl border border-white/10 bg-[var(--accent-soft)] shadow-[0_0_30px_var(--accent-glow)]">
            <Disc3
              className="text-[var(--accent)]"
              size={28}
            />

            <LoaderCircle
              className="absolute -right-2 -top-2 animate-spin text-white/60"
              size={20}
            />
          </div>

          <p className="mt-5 text-sm text-white/45">
            Restoring your SoundTrail...
          </p>
        </div>
      </main>
    )
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from:
            location.pathname +
            location.search,
        }}
      />
    )
  }

  return <Outlet />
}