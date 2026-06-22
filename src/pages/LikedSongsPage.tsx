import {
  AlertCircle,
  Heart,
  LoaderCircle,
  Music2,
  Pause,
  Play,
  RefreshCw,
  Trash2,
} from 'lucide-react'

import { Link } from 'react-router-dom'

import { usePlayerStore } from '@/features/player/player-store'
import { formatDuration } from '@/lib/format'

export function LikedSongsPage() {
  const likedTracks = usePlayerStore(
    (state) => state.likedTracks,
  )

  const isLikedSongsLoading =
    usePlayerStore(
      (state) =>
        state.isLikedSongsLoading,
    )

  const likedSongsError =
    usePlayerStore(
      (state) =>
        state.likedSongsError,
    )

  const currentTrack =
    usePlayerStore(
      (state) =>
        state.currentTrack,
    )

  const isPlaying =
    usePlayerStore(
      (state) =>
        state.isPlaying,
    )

  const playTrack =
    usePlayerStore(
      (state) =>
        state.playTrack,
    )

  const togglePlay =
    usePlayerStore(
      (state) =>
        state.togglePlay,
    )

  const toggleLike =
    usePlayerStore(
      (state) =>
        state.toggleLike,
    )

  const loadLikedSongs =
    usePlayerStore(
      (state) =>
        state.loadLikedSongs,
    )

  const playableLikedTracks =
    likedTracks.filter(
      (track) =>
        Boolean(track.previewUrl),
    )

  function handlePlayTrack(
    track: (typeof likedTracks)[number],
  ) {
    if (!track.previewUrl) {
      return
    }

    if (
      currentTrack?.id ===
      track.id
    ) {
      togglePlay()
      return
    }

    playTrack(
      track,
      playableLikedTracks,
    )
  }

  function handlePlayAll() {
    const firstTrack =
      playableLikedTracks[0]

    if (!firstTrack) {
      return
    }

    playTrack(
      firstTrack,
      playableLikedTracks,
    )
  }

  function handleRemoveTrack(
    track: (typeof likedTracks)[number],
  ) {
    void toggleLike(track)
  }

  function handleRetry() {
    void loadLikedSongs()
  }

  return (
    <main className="min-h-screen px-5 py-8 pb-40 md:px-8 lg:px-12">
      <section className="mx-auto max-w-6xl">
        <header className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-[var(--accent)]">
              Your library
            </p>

            <div className="mt-3 flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-2xl border border-[var(--accent)] bg-[var(--accent-soft)] shadow-[0_0_24px_var(--accent-glow)]">
                <Heart className="size-6 fill-[var(--accent)] text-[var(--accent)]" />
              </div>

              <h1 className="text-4xl font-bold text-white md:text-5xl">
                Liked Songs
              </h1>
            </div>

            <p className="mt-4 text-sm text-white/50">
              {isLikedSongsLoading
                ? 'Loading your saved music...'
                : `${likedTracks.length} saved ${
                    likedTracks.length === 1
                      ? 'track'
                      : 'tracks'
                  }`}
            </p>
          </div>

          <button
            type="button"
            onClick={handlePlayAll}
            disabled={
              playableLikedTracks.length ===
                0 ||
              isLikedSongsLoading
            }
            className="flex items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-6 py-3 font-semibold text-white shadow-[0_0_24px_var(--accent-glow)] transition hover:scale-105 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
          >
            <Play className="size-5 fill-current" />
            Play all
          </button>
        </header>

        {likedSongsError && (
          <div
            role="alert"
            className="mt-8 flex flex-col gap-4 rounded-3xl border border-red-400/20 bg-red-500/10 p-5 text-red-200 sm:flex-row sm:items-center"
          >
            <div className="flex flex-1 items-start gap-3">
              <AlertCircle
                className="mt-0.5 shrink-0"
                size={20}
              />

              <div>
                <h2 className="font-semibold">
                  Liked songs could not be synced
                </h2>

                <p className="mt-1 text-sm text-red-200/70">
                  {likedSongsError}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRetry}
              disabled={isLikedSongsLoading}
              className="flex shrink-0 items-center justify-center gap-2 rounded-xl border border-red-300/20 bg-red-400/10 px-4 py-2 text-sm font-medium transition hover:bg-red-400/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={
                  isLikedSongsLoading
                    ? 'animate-spin'
                    : ''
                }
              />
              Retry
            </button>
          </div>
        )}

        {isLikedSongsLoading &&
          likedTracks.length === 0 && (
            <section className="mt-10 flex min-h-72 flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/[0.035] backdrop-blur-xl">
              <LoaderCircle
                className="animate-spin text-[var(--accent)]"
                size={36}
              />

              <p className="mt-4 text-sm text-white/50">
                Loading your liked songs...
              </p>
            </section>
          )}

        {!isLikedSongsLoading &&
          likedTracks.length === 0 && (
            <section className="mt-10 flex min-h-80 flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.025] px-6 text-center backdrop-blur-xl">
              <div className="flex size-16 items-center justify-center rounded-full border border-white/10 bg-white/[0.05]">
                <Heart
                  className="text-white/25"
                  size={30}
                />
              </div>

              <h2 className="mt-5 text-xl font-semibold text-white">
                No liked songs yet
              </h2>

              <p className="mt-2 max-w-md text-sm leading-6 text-white/45">
                Find a song you enjoy and press its
                heart button. Your liked music will
                be saved to your SoundTrail account.
              </p>

              <Link
                to="/discover"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_22px_var(--accent-glow)] transition hover:brightness-110"
              >
                <Music2 size={17} />
                Discover music
              </Link>
            </section>
          )}

        {likedTracks.length > 0 && (
          <section className="mt-10 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-xl shadow-black/20 backdrop-blur-xl">
            <div className="hidden grid-cols-[40px_64px_minmax(0,1.4fr)_minmax(0,1fr)_100px_48px] items-center gap-4 border-b border-white/10 px-5 py-3 text-xs font-medium uppercase tracking-[0.14em] text-white/30 md:grid">
              <span>#</span>
              <span />

              <span>Title</span>
              <span>Album</span>
              <span>Duration</span>
              <span />
            </div>

            {likedTracks.map(
              (track, index) => {
                const canPlay =
                  Boolean(
                    track.previewUrl,
                  )

                const active =
                  currentTrack?.id ===
                  track.id

                const activePlaying =
                  active &&
                  isPlaying

                return (
                  <article
                    key={track.id}
                    className={`group flex items-center gap-4 border-b border-white/10 px-4 py-4 transition last:border-b-0 md:grid md:grid-cols-[40px_64px_minmax(0,1.4fr)_minmax(0,1fr)_100px_48px] md:px-5 ${
                      active
                        ? 'bg-[var(--accent-soft)]'
                        : 'hover:bg-white/[0.055]'
                    }`}
                  >
                    <span
                      className={`hidden text-sm md:block ${
                        active
                          ? 'text-[var(--accent)]'
                          : 'text-white/30'
                      }`}
                    >
                      {activePlaying ? (
                        <span className="inline-flex items-end gap-0.5">
                          <span className="h-3 w-0.5 animate-pulse rounded-full bg-[var(--accent)]" />
                          <span className="h-4 w-0.5 animate-pulse rounded-full bg-[var(--accent)]" />
                          <span className="h-2 w-0.5 animate-pulse rounded-full bg-[var(--accent)]" />
                        </span>
                      ) : (
                        index + 1
                      )}
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        handlePlayTrack(
                          track,
                        )
                      }}
                      disabled={!canPlay}
                      aria-label={
                        canPlay
                          ? activePlaying
                            ? `Pause ${track.title}`
                            : `Play ${track.title}`
                          : `Preview unavailable for ${track.title}`
                      }
                      className="relative size-14 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/10 disabled:cursor-not-allowed"
                    >
                      {track.artworkUrl ? (
                        <img
                          src={
                            track.artworkUrl
                          }
                          alt={`${track.albumTitle} artwork`}
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Music2
                            className="text-white/25"
                            size={22}
                          />
                        </div>
                      )}

                      {canPlay && (
                        <span className="absolute inset-0 flex items-center justify-center bg-black/55 opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100">
                          {activePlaying ? (
                            <Pause
                              className="fill-white text-white"
                              size={20}
                            />
                          ) : (
                            <Play
                              className="fill-white text-white"
                              size={20}
                            />
                          )}
                        </span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        handlePlayTrack(
                          track,
                        )
                      }}
                      disabled={!canPlay}
                      className="min-w-0 flex-1 text-left disabled:cursor-default"
                    >
                      <h2
                        className={`truncate font-semibold ${
                          active
                            ? 'text-[var(--accent)]'
                            : 'text-white'
                        }`}
                      >
                        {track.title}
                      </h2>

                      <p className="mt-1 truncate text-sm text-white/50">
                        {track.artistName}
                      </p>

                      <p className="mt-1 text-xs text-white/30 md:hidden">
                        {track.albumTitle}
                      </p>

                      {!canPlay && (
                        <p className="mt-1 text-xs text-amber-300/60">
                          Preview unavailable
                        </p>
                      )}
                    </button>

                    <p className="hidden truncate text-sm text-white/40 md:block">
                      {track.albumTitle}
                    </p>

                    <span className="hidden text-sm tabular-nums text-white/35 md:block">
                      {formatDuration(
                        track.durationSec,
                      )}
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        handleRemoveTrack(
                          track,
                        )
                      }}
                      aria-label={`Remove ${track.title} from liked songs`}
                      className="flex size-10 shrink-0 items-center justify-center rounded-full text-white/35 transition hover:bg-red-500/10 hover:text-red-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                    >
                      <Trash2 size={17} />
                    </button>
                  </article>
                )
              },
            )}
          </section>
        )}
      </section>
    </main>
  )
}