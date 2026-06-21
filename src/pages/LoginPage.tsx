import {
  useEffect,
  useState,
  type FormEvent,
} from 'react'

import {
  AlertCircle,
  ArrowLeft,
  Disc3,
  Eye,
  EyeOff,
  LoaderCircle,
  Lock,
  Mail,
} from 'lucide-react'

import {
  Link,
  useLocation,
  useNavigate,
} from 'react-router-dom'

import { useAuthStore } from '@/features/auth/auth-store'

interface LoginLocationState {
  from?: string
}

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const login = useAuthStore(
    (state) => state.login,
  )

  const isLoading = useAuthStore(
    (state) => state.isLoading,
  )

  const isAuthenticated =
    useAuthStore(
      (state) => state.isAuthenticated,
    )

  const error = useAuthStore(
    (state) => state.error,
  )

  const clearError = useAuthStore(
    (state) => state.clearError,
  )

  const [email, setEmail] =
    useState('')

  const [password, setPassword] =
    useState('')

  const [
    showPassword,
    setShowPassword,
  ] = useState(false)

  const redirectPath =
    (
      location.state as
        | LoginLocationState
        | null
    )?.from ?? '/'

  useEffect(() => {
    clearError()
  }, [clearError])

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectPath, {
        replace: true,
      })
    }
  }, [
    isAuthenticated,
    navigate,
    redirectPath,
  ])

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    const success = await login({
      email,
      password,
    })

    if (success) {
      navigate(redirectPath, {
        replace: true,
      })
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#09090d] px-5 py-10">
      <div className="pointer-events-none absolute left-[-180px] top-[-180px] size-[480px] rounded-full bg-violet-600/20 blur-[130px]" />

      <div className="pointer-events-none absolute bottom-[-220px] right-[-180px] size-[520px] rounded-full bg-fuchsia-600/15 blur-[150px]" />

      <div className="relative z-10 w-full max-w-md">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-white/45 transition hover:text-white"
        >
          <ArrowLeft size={17} />
          Back to SoundTrail
        </Link>

        <section className="overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.055] shadow-2xl shadow-black/40 backdrop-blur-2xl">
          <div className="border-b border-white/10 px-6 py-7 sm:px-8">
            <Link
              to="/"
              className="inline-flex items-center gap-3"
            >
              <div className="flex size-11 items-center justify-center rounded-2xl border border-white/10 bg-[var(--accent-soft)] shadow-[0_0_24px_var(--accent-glow)]">
                <Disc3
                  className="text-[var(--accent)]"
                  size={22}
                />
              </div>

              <div>
                <p className="text-lg font-bold text-white">
                  SoundTrail
                </p>

                <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">
                  Music discovery
                </p>
              </div>
            </Link>

            <h1 className="mt-8 text-3xl font-bold text-white">
              Welcome back
            </h1>

            <p className="mt-2 text-sm leading-6 text-white/45">
              Sign in to access your liked songs,
              playlists and personal music trail.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5 px-6 py-7 sm:px-8"
          >
            {error && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-red-200"
              >
                <AlertCircle
                  className="mt-0.5 shrink-0"
                  size={18}
                />

                <p className="text-sm leading-5">
                  {error}
                </p>
              </div>
            )}

            <div>
              <label
                htmlFor="login-email"
                className="text-sm font-medium text-white/70"
              >
                Email address
              </label>

              <div className="relative mt-2">
                <Mail
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
                  size={18}
                />

                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(
                      event.target.value,
                    )

                    if (error) {
                      clearError()
                    }
                  }}
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                  className="h-12 w-full rounded-2xl border border-white/10 bg-black/20 pl-12 pr-4 text-white outline-none transition placeholder:text-white/25 focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="text-sm font-medium text-white/70"
              >
                Password
              </label>

              <div className="relative mt-2">
                <Lock
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
                  size={18}
                />

                <input
                  id="login-password"
                  type={
                    showPassword
                      ? 'text'
                      : 'password'
                  }
                  value={password}
                  onChange={(event) => {
                    setPassword(
                      event.target.value,
                    )

                    if (error) {
                      clearError()
                    }
                  }}
                  autoComplete="current-password"
                  required
                  placeholder="Enter your password"
                  className="h-12 w-full rounded-2xl border border-white/10 bg-black/20 pl-12 pr-12 text-white outline-none transition placeholder:text-white/25 focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"
                />

                <button
                  type="button"
                  onClick={() => {
                    setShowPassword(
                      (currentValue) =>
                        !currentValue,
                    )
                  }}
                  aria-label={
                    showPassword
                      ? 'Hide password'
                      : 'Show password'
                  }
                  className="absolute right-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-white/35 transition hover:bg-white/10 hover:text-white"
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--accent)] px-5 py-3.5 font-semibold text-white shadow-[0_0_28px_var(--accent-glow)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <LoaderCircle
                    className="animate-spin"
                    size={18}
                  />

                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>

            <p className="text-center text-sm text-white/40">
              Don&apos;t have an account?{' '}
              <Link
                to="/register"
                className="font-semibold text-[var(--accent)] transition hover:brightness-125"
              >
                Create one
              </Link>
            </p>
          </form>
        </section>
      </div>
    </main>
  )
}