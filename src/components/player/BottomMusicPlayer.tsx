import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'

import {
  Heart,
  ListMusic,
  ListPlus,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
} from 'lucide-react'

import { AddToPlaylistDialog } from '@/components/playlists/AddToPlaylistDialog'
import { usePlayerStore } from '@/features/player/player-store'
import { cn } from '@/lib/cn'

import { PlayerProgressBar } from './PlayerProgressBar'
import { PlayerQueueSheet } from './PlayerQueueSheet'
import { PlayerVolumeControl } from './PlayerVolumeControl'

export function BottomMusicPlayer() {
  const audioRef =
    useRef<HTMLAudioElement | null>(null)

  const [audioDuration, setAudioDuration] =
    useState(0)

  const [audioError, setAudioError] =
    useState<string | null>(null)

  const [
    isAddToPlaylistOpen,
    setIsAddToPlaylistOpen,
  ] = useState(false)

  const currentTrack = usePlayerStore(
    (state) => state.currentTrack,
  )

  const isPlaying = usePlayerStore(
    (state) => state.isPlaying,
  )

  const progress = usePlayerStore(
    (state) => state.progress,
  )

  const volume = usePlayerStore(
    (state) => state.volume,
  )

  const isShuffle = usePlayerStore(
    (state) => state.isShuffle,
  )

  const repeatMode = usePlayerStore(
    (state) => state.repeatMode,
  )

  const togglePlay = usePlayerStore(
    (state) => state.togglePlay,
  )

  const pause = usePlayerStore(
    (state) => state.pause,
  )

  const next = usePlayerStore(
    (state) => state.next,
  )

  const previous = usePlayerStore(
    (state) => state.previous,
  )

  const seek = usePlayerStore(
    (state) => state.seek,
  )

  const setVolume = usePlayerStore(
    (state) => state.setVolume,
  )

  const toggleShuffle = usePlayerStore(
    (state) => state.toggleShuffle,
  )

  const cycleRepeat = usePlayerStore(
    (state) => state.cycleRepeat,
  )

  const toggleLike = usePlayerStore(
    (state) => state.toggleLike,
  )

  const likedTrackIds = usePlayerStore(
    (state) => state.likedTrackIds,
  )

  const toggleQueue = usePlayerStore(
    (state) => state.toggleQueue,
  )

  const accentColor = 'var(--accent)'

  const hasPlayablePreview = Boolean(
    currentTrack?.previewUrl,
  )

  const duration =
    audioDuration > 0
      ? audioDuration
      : currentTrack?.durationSec ?? 0

  const liked = currentTrack
    ? likedTrackIds.includes(
        currentTrack.id,
      )
    : false

  useEffect(() => {
    const audio = audioRef.current

    if (!audio) {
      return
    }

    audio.pause()
    audio.currentTime = 0

    seek(0)
    setAudioDuration(0)
    setAudioError(null)

    if (!currentTrack?.previewUrl) {
      audio.removeAttribute('src')
      audio.load()
      pause()

      return
    }

    audio.src =
      currentTrack.previewUrl

    audio.load()
  }, [
    currentTrack?.id,
    currentTrack?.previewUrl,
    pause,
    seek,
  ])

  useEffect(() => {
    const audio = audioRef.current

    if (
      !audio ||
      !currentTrack?.previewUrl
    ) {
      return
    }

    if (!isPlaying) {
      audio.pause()
      return
    }

    audio
      .play()
      .catch((error: unknown) => {
        if (
          error instanceof DOMException &&
          error.name === 'AbortError'
        ) {
          return
        }

        console.error(
          'Audio preview could not be played:',
          error,
        )

        setAudioError(
          'This audio preview could not be played.',
        )

        pause()
      })
  }, [
    isPlaying,
    currentTrack?.id,
    currentTrack?.previewUrl,
    pause,
  ])

  useEffect(() => {
    const audio = audioRef.current

    if (!audio) {
      return
    }

    audio.volume = volume
  }, [volume])

  useEffect(() => {
    if (!currentTrack) {
      setIsAddToPlaylistOpen(false)
    }
  }, [currentTrack])

  function handleLoadedMetadata() {
    const audio = audioRef.current

    if (!audio) {
      return
    }

    if (
      Number.isFinite(
        audio.duration,
      ) &&
      audio.duration > 0
    ) {
      setAudioDuration(
        audio.duration,
      )
    }

    setAudioError(null)
  }

  function handleTimeUpdate() {
    const audio = audioRef.current

    if (!audio) {
      return
    }

    seek(audio.currentTime)
  }

  function handleSeek(
    time: number,
  ) {
    const audio = audioRef.current

    if (
      !audio ||
      !hasPlayablePreview
    ) {
      return
    }

    const maximumTime =
      audioDuration > 0
        ? audioDuration
        : duration

    const clampedTime = Math.max(
      0,
      Math.min(
        time,
        maximumTime,
      ),
    )

    audio.currentTime =
      clampedTime

    seek(clampedTime)
  }

  function handleEnded() {
    const audio = audioRef.current

    if (
      repeatMode === 'one' &&
      audio
    ) {
      audio.currentTime = 0
      seek(0)

      audio
        .play()
        .catch(
          (error: unknown) => {
            if (
              error instanceof
                DOMException &&
              error.name ===
                'AbortError'
            ) {
              return
            }

            console.error(
              'Audio preview could not restart:',
              error,
            )

            pause()
          },
        )

      return
    }

    next()
  }

  function handleAudioError() {
    setAudioError(
      'This track does not have a working preview.',
    )

    pause()
  }

  function openAddToPlaylistDialog() {
    if (!currentTrack) {
      return
    }

    setIsAddToPlaylistOpen(true)
  }

  function closeAddToPlaylistDialog() {
    setIsAddToPlaylistOpen(false)
  }

  return (
    <>
      <audio
        ref={audioRef}
        preload="metadata"
        playsInline
        onLoadedMetadata={
          handleLoadedMetadata
        }
        onCanPlay={() => {
          setAudioError(null)
        }}
        onTimeUpdate={
          handleTimeUpdate
        }
        onEnded={handleEnded}
        onError={handleAudioError}
      />

      <footer
        aria-label="Music player"
        role="region"
        className="fixed bottom-[calc(64px+env(safe-area-inset-bottom))] left-0 right-0 z-30 overflow-hidden border-t border-white/15 bg-[rgba(10,10,15,0.72)] shadow-[0_-20px_60px_rgba(0,0,0,0.45)] backdrop-blur-[30px] backdrop-saturate-150 lg:bottom-0 lg:left-60"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-25"
          style={{
            background:
              'radial-gradient(circle at 50% 0%, var(--accent-glow), transparent 48%)',
          }}
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"
        />

        <div className="relative z-10 mx-auto flex min-h-[120px] max-w-[1600px] flex-col justify-center px-3 py-2 sm:px-4 lg:h-24 lg:min-h-0 lg:px-6">
          <div className="hidden h-full items-center gap-4 md:grid md:grid-cols-[minmax(180px,1fr)_minmax(0,2fr)_minmax(180px,1fr)]">
            <div className="flex min-w-0 items-center gap-3">
              {currentTrack ? (
                <>
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/15 bg-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.4)]">
                    {currentTrack.artworkUrl ? (
                      <img
                        src={
                          currentTrack.artworkUrl
                        }
                        alt={`${currentTrack.albumTitle} artwork`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-white/40">
                        <ListMusic className="h-5 w-5" />
                      </div>
                    )}

                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>

                  <div className="min-w-0">
                    <p
                      aria-live="polite"
                      className="truncate text-sm font-semibold text-white"
                    >
                      {currentTrack.title}
                    </p>

                    <p className="truncate text-xs text-white/50">
                      {
                        currentTrack.artistName
                      }
                    </p>

                    {!hasPlayablePreview && (
                      <p className="mt-0.5 truncate text-[11px] text-amber-300/80">
                        Preview unavailable
                      </p>
                    )}

                    {audioError && (
                      <p className="mt-0.5 truncate text-[11px] text-red-300/80">
                        {audioError}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      void toggleLike()
                    }}
                    aria-label={
                      liked
                        ? 'Unlike track'
                        : 'Like track'
                    }
                    aria-pressed={liked}
                    className={cn(
                      'ml-1 shrink-0 rounded-full border border-transparent p-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]',
                      liked
                        ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)] shadow-[0_0_18px_var(--accent-glow)]'
                        : 'text-white/50 hover:border-white/10 hover:bg-white/10 hover:text-white',
                    )}
                  >
                    <Heart
                      className={cn(
                        'h-4 w-4',
                        liked &&
                          'fill-current',
                      )}
                    />
                  </button>

                  <button
                    type="button"
                    onClick={
                      openAddToPlaylistDialog
                    }
                    aria-label="Add track to playlist"
                    className="shrink-0 rounded-full border border-transparent p-2 text-white/50 transition hover:border-white/10 hover:bg-white/10 hover:text-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                  >
                    <ListPlus className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/30">
                    <ListMusic className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-white/60">
                      Select a track to play
                    </p>

                    <p className="mt-0.5 text-xs text-white/30">
                      Search from Discover
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex min-w-0 flex-col gap-2">
              <div className="flex items-center justify-center gap-2">
                <ControlButton
                  onClick={
                    toggleShuffle
                  }
                  active={isShuffle}
                  label="Toggle shuffle"
                  disabled={!currentTrack}
                >
                  <Shuffle className="h-4 w-4" />
                </ControlButton>

                <ControlButton
                  onClick={previous}
                  label="Previous track"
                  disabled={!currentTrack}
                >
                  <SkipBack className="h-5 w-5 fill-current" />
                </ControlButton>

                <button
                  type="button"
                  onClick={togglePlay}
                  disabled={
                    !hasPlayablePreview
                  }
                  aria-label={
                    !hasPlayablePreview
                      ? 'Preview unavailable'
                      : isPlaying
                        ? 'Pause'
                        : 'Play'
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-[var(--accent)] text-white shadow-[0_0_24px_var(--accent-glow)] transition hover:scale-105 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4 fill-current" />
                  ) : (
                    <Play className="h-4 w-4 fill-current pl-0.5" />
                  )}
                </button>

                <ControlButton
                  onClick={next}
                  label="Next track"
                  disabled={!currentTrack}
                >
                  <SkipForward className="h-5 w-5 fill-current" />
                </ControlButton>

                <ControlButton
                  onClick={
                    cycleRepeat
                  }
                  active={
                    repeatMode !== 'off'
                  }
                  label={`Repeat: ${repeatMode}`}
                  disabled={!currentTrack}
                >
                  {repeatMode ===
                  'one' ? (
                    <Repeat1 className="h-4 w-4" />
                  ) : (
                    <Repeat className="h-4 w-4" />
                  )}
                </ControlButton>
              </div>

              <PlayerProgressBar
                progress={progress}
                duration={duration}
                onSeek={handleSeek}
                accentColor={
                  accentColor
                }
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <div className="rounded-full border border-white/10 bg-white/[0.05] px-1 backdrop-blur-xl">
                <PlayerVolumeControl
                  volume={volume}
                  onChange={
                    setVolume
                  }
                />
              </div>

              <ControlButton
                onClick={toggleQueue}
                label="Open queue"
                disabled={!currentTrack}
              >
                <ListMusic className="h-4 w-4" />
              </ControlButton>
            </div>
          </div>

          <div className="flex h-full flex-col justify-center gap-2 md:hidden">
            <PlayerProgressBar
              progress={progress}
              duration={duration}
              onSeek={handleSeek}
              accentColor={accentColor}
            />

            <div className="flex items-center gap-2">
              {currentTrack ? (
                currentTrack.artworkUrl ? (
                  <img
                    src={
                      currentTrack.artworkUrl
                    }
                    alt={`${currentTrack.albumTitle} artwork`}
                    className="h-10 w-10 shrink-0 rounded-lg border border-white/10 object-cover shadow-lg"
                  />
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/10 text-white/40">
                    <ListMusic className="h-4 w-4" />
                  </div>
                )
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/30">
                  <ListMusic className="h-4 w-4" />
                </div>
              )}

              <div className="min-w-0 flex-1">
                <p
                  aria-live="polite"
                  className="truncate text-sm font-semibold text-white"
                >
                  {currentTrack?.title ??
                    'No track selected'}
                </p>

                <p className="truncate text-xs text-white/50">
                  {currentTrack?.artistName ??
                    'SoundTrail'}
                </p>

                {currentTrack &&
                  !hasPlayablePreview && (
                    <p className="truncate text-[10px] text-amber-300/80">
                      Preview unavailable
                    </p>
                  )}

                {audioError && (
                  <p className="truncate text-[10px] text-red-300/80">
                    {audioError}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  void toggleLike()
                }}
                disabled={!currentTrack}
                aria-label={
                  liked
                    ? 'Unlike track'
                    : 'Like track'
                }
                aria-pressed={liked}
                className={cn(
                  'shrink-0 rounded-full border border-transparent p-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:opacity-40',
                  liked
                    ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
                    : 'text-white/50 hover:bg-white/10 hover:text-white',
                )}
              >
                <Heart
                  className={cn(
                    'h-4 w-4',
                    liked &&
                      'fill-current',
                  )}
                />
              </button>

              <ControlButton
                onClick={
                  openAddToPlaylistDialog
                }
                label="Add to playlist"
                disabled={!currentTrack}
                compact
              >
                <ListPlus className="h-4 w-4" />
              </ControlButton>

              <ControlButton
                onClick={previous}
                label="Previous"
                disabled={!currentTrack}
                compact
              >
                <SkipBack className="h-4 w-4 fill-current" />
              </ControlButton>

              <button
                type="button"
                onClick={togglePlay}
                disabled={
                  !hasPlayablePreview
                }
                aria-label={
                  !hasPlayablePreview
                    ? 'Preview unavailable'
                    : isPlaying
                      ? 'Pause'
                      : 'Play'
                }
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/20 bg-[var(--accent)] text-white shadow-[0_0_18px_var(--accent-glow)] transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
              >
                {isPlaying ? (
                  <Pause className="h-3.5 w-3.5 fill-current" />
                ) : (
                  <Play className="h-3.5 w-3.5 fill-current pl-0.5" />
                )}
              </button>

              <ControlButton
                onClick={next}
                label="Next"
                disabled={!currentTrack}
                compact
              >
                <SkipForward className="h-4 w-4 fill-current" />
              </ControlButton>

              <ControlButton
                onClick={
                  toggleQueue
                }
                label="Queue"
                disabled={!currentTrack}
                compact
              >
                <ListMusic className="h-4 w-4" />
              </ControlButton>
            </div>

            <div className="flex items-center justify-between">
              <ControlButton
                onClick={
                  toggleShuffle
                }
                active={isShuffle}
                label="Toggle shuffle"
                disabled={!currentTrack}
                compact
              >
                <Shuffle className="h-4 w-4" />
              </ControlButton>

              <ControlButton
                onClick={
                  cycleRepeat
                }
                active={
                  repeatMode !== 'off'
                }
                label={`Repeat: ${repeatMode}`}
                disabled={!currentTrack}
                compact
              >
                {repeatMode ===
                'one' ? (
                  <Repeat1 className="h-4 w-4" />
                ) : (
                  <Repeat className="h-4 w-4" />
                )}
              </ControlButton>

              <PlayerVolumeControl
                volume={volume}
                onChange={setVolume}
                compact
              />
            </div>
          </div>
        </div>
      </footer>

      <PlayerQueueSheet />

      <AddToPlaylistDialog
        track={currentTrack}
        open={
          isAddToPlaylistOpen
        }
        onClose={
          closeAddToPlaylistDialog
        }
      />
    </>
  )
}

interface ControlButtonProps {
  onClick: () => void
  label: string
  active?: boolean
  disabled?: boolean
  compact?: boolean
  children: ReactNode
}

function ControlButton({
  onClick,
  label,
  active = false,
  disabled = false,
  compact = false,
  children,
}: ControlButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        'rounded-full border border-transparent text-white/65 transition hover:border-white/10 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-35',
        compact
          ? 'p-1.5'
          : 'p-2',
        active &&
          'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)] shadow-[0_0_16px_var(--accent-glow)]',
      )}
    >
      {children}
    </button>
  )
}