import { useState } from 'react'
import {
  Check,
  Palette,
  RotateCcw,
  Volume2,
} from 'lucide-react'

import { cn } from '@/lib/cn'

import { usePlayerStore } from '@/features/player/player-store'

import {
  ACCENT_THEME_OPTIONS,
  DEFAULT_ACCENT_THEME,
  applyAccentTheme,
  getSavedAccentTheme,
  type AccentTheme,
} from '@/features/theme/theme'

export function SettingsPage() {
  /*
    Load the currently saved accent theme.
  */
  const [selectedAccent, setSelectedAccent] =
    useState<AccentTheme>(() => getSavedAccentTheme())

  const volume = usePlayerStore(
    (state) => state.volume,
  )

  const setVolume = usePlayerStore(
    (state) => state.setVolume,
  )

  const volumePercentage = Math.round(volume * 100)

  const handleAccentChange = (
    accent: AccentTheme,
  ) => {
    setSelectedAccent(accent)
    applyAccentTheme(accent)
  }

  const handleResetSettings = () => {
    handleAccentChange(DEFAULT_ACCENT_THEME)
    setVolume(0.75)
  }

  return (
    <div className="min-h-screen space-y-10 p-8 pb-32">
      <header>
        <h1 className="text-5xl font-bold text-white">
          Settings
        </h1>

        <p className="mt-3 max-w-2xl text-white/60">
          Personalise how SoundTrail looks and sounds.
        </p>
      </header>

      <div className="grid gap-8 xl:grid-cols-2">
        {/* Accent colour settings */}
        <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[var(--accent-soft)] p-3">
              <Palette className="h-6 w-6 text-[var(--accent)]" />
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white">
                Accent colour
              </h2>

              <p className="mt-1 text-sm text-white/50">
                Choose the main highlight colour.
              </p>
            </div>
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {ACCENT_THEME_OPTIONS.map((theme) => {
              const isSelected =
                selectedAccent === theme.id

              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() =>
                    handleAccentChange(theme.id)
                  }
                  className={cn(
                    'flex items-center gap-4 rounded-2xl border p-4 text-left transition',
                    isSelected
                      ? 'border-[var(--accent)] bg-[var(--accent-soft)]'
                      : 'border-white/10 bg-black/10 hover:border-white/30 hover:bg-white/5',
                  )}
                >
                  <span
                    className="h-11 w-11 shrink-0 rounded-full shadow-lg"
                    style={{
                      backgroundColor: theme.preview,
                    }}
                  />

                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-white">
                      {theme.label}
                    </span>

                    <span className="mt-1 block text-sm text-white/40">
                      {theme.description}
                    </span>
                  </span>

                  {isSelected && (
                    <Check className="h-5 w-5 shrink-0 text-[var(--accent)]" />
                  )}
                </button>
              )
            })}
          </div>
        </section>

        {/* Volume setting */}
        <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[var(--accent-soft)] p-3">
              <Volume2 className="h-6 w-6 text-[var(--accent)]" />
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white">
                Player volume
              </h2>

              <p className="mt-1 text-sm text-white/50">
                Set the default music volume.
              </p>
            </div>
          </div>

          <div className="mt-9">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-white/60">
                Volume
              </span>

              <span className="font-semibold text-white">
                {volumePercentage}%
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              value={volumePercentage}
              onChange={(event) =>
                setVolume(
                  Number(event.target.value) / 100,
                )
              }
              className="w-full"
              aria-label="Player volume"
            />

            <div className="mt-3 flex justify-between text-xs text-white/30">
              <span>Muted</span>
              <span>Maximum</span>
            </div>
          </div>
        </section>
      </div>

      {/* Reset settings */}
      <section className="flex flex-col justify-between gap-5 rounded-3xl border border-white/10 bg-white/5 p-6 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Reset preferences
          </h2>

          <p className="mt-1 text-sm text-white/50">
            Restore the rose accent and 75% volume.
          </p>
        </div>

        <button
          type="button"
          onClick={handleResetSettings}
          className="flex items-center justify-center gap-2 rounded-xl border border-white/10 px-5 py-3 font-medium text-white transition hover:bg-white/10"
        >
          <RotateCcw className="h-4 w-4" />
          Reset settings
        </button>
      </section>
    </div>
  )
}