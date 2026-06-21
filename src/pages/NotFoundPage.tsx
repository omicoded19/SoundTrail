import {
  ArrowLeft,
  Compass,
  Music2,
} from 'lucide-react'

import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <main className="flex min-h-[calc(100dvh-96px)] items-center justify-center px-6 py-12">
      <section className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-white/[0.045] p-10 text-center shadow-2xl shadow-black/30 backdrop-blur-2xl md:p-14">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-25"
          style={{
            background:
              'radial-gradient(circle at 50% 0%, var(--accent-glow), transparent 55%)',
          }}
        />

        <div className="relative">
          <div className="mx-auto flex size-20 items-center justify-center rounded-full border border-[var(--accent)] bg-[var(--accent-soft)] shadow-[0_0_30px_var(--accent-glow)]">
            <Music2
              className="text-[var(--accent)]"
              size={34}
            />
          </div>

          <p className="mt-8 text-sm font-medium uppercase tracking-[0.22em] text-[var(--accent)]">
            Error 404
          </p>

          <h1 className="mt-3 text-4xl font-bold text-white md:text-5xl">
            This trail does not exist
          </h1>

          <p className="mx-auto mt-4 max-w-lg leading-7 text-white/50">
            The page may have been moved, removed or
            entered incorrectly.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-6 py-3 font-semibold text-white shadow-[0_0_24px_var(--accent-glow)] transition hover:brightness-110"
            >
              <ArrowLeft size={18} />
              Return home
            </Link>

            <Link
              to="/discover"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-6 py-3 font-semibold text-white transition hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
            >
              <Compass size={18} />
              Discover music
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}