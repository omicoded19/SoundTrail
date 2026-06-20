import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  Heart,
  ListMusic,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
} from 'lucide-react'

import { cn } from '@/lib/cn'
import { usePlayerStore } from '@/features/player/player-store'
import { useArtistStore } from '@/features/artist/artist-store'
import { getArtistById } from '@/data'
import { PlayerProgressBar } from './PlayerProgressBar'
import { PlayerVolumeControl } from './PlayerVolumeControl'
import { PlayerQueueSheet } from './PlayerQueueSheet'

export function BottomMusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const [audioDuration, setAudioDuration] =
    useState(0)

  const [audioError, setAudioError] =
    useState<string | null>(null)

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

  const isLiked = usePlayerStore(
    (state) => state.isLiked,
  )

  const toggleQueue = usePlayerStore(
    (state) => state.toggleQueue,
  )

  const activeArtistId = useArtistStore(
    (state) => state.activeArtistId,
  )

  const artist = getArtistById(activeArtistId)

  const accentColor =
    artist?.accentColor ?? '#ffffff'

  const hasPlayablePreview =
    Boolean(currentTrack?.previewUrl)

  const duration =
    audioDuration > 0
      ? audioDuration
      : currentTrack?.durationSec ?? 0

  const liked = currentTrack
    ? isLiked(currentTrack.id)
    : false

  /*
    Change the audio source whenever the selected
    track changes.
  */
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

    audio.src = currentTrack.previewUrl
    audio.load()
  }, [
    currentTrack?.id,
    currentTrack?.previewUrl,
    pause,
    seek,
  ])

  /*
    Synchronize Zustand's isPlaying value with
    the real HTML audio element.
  */
  useEffect(() => {
    const audio = audioRef.current

    if (
      !audio ||
      !currentTrack?.previewUrl
    ) {
      return
    }

    if (isPlaying) {
      audio.play().catch((error: unknown) => {
        console.error(
          'Audio preview could not be played:',
          error,
        )

        setAudioError(
          'This audio preview could not be played.',
        )

        pause()
      })
    } else {
      audio.pause()
    }
  }, [
    isPlaying,
    currentTrack?.id,
    currentTrack?.previewUrl,
    pause,
  ])

  /*
    Synchronize the stored volume with the
    real audio element.
  */
  useEffect(() => {
    const audio = audioRef.current

    if (!audio) {
      return
    }

    audio.volume = volume
  }, [volume])

  function handleLoadedMetadata() {
    const audio = audioRef.current

    if (!audio) {
      return
    }

    if (
      Number.isFinite(audio.duration) &&
      audio.duration > 0
    ) {
      setAudioDuration(audio.duration)
    }
  }

  /*
    Update Zustand progress from the real playback
    position instead of using simulated time.
  */
  function handleTimeUpdate() {
    const audio = audioRef.current

    if (!audio) {
      return
    }

    seek(audio.currentTime)
  }

  function handleSeek(time: number) {
    const audio = audioRef.current

    if (!audio || !hasPlayablePreview) {
      return
    }

    const maximumTime =
      audioDuration > 0
        ? audioDuration
        : duration

    const clampedTime = Math.max(
      0,
      Math.min(time, maximumTime),
    )

    audio.currentTime = clampedTime
    seek(clampedTime)
  }

  function handleEnded() {
    const audio = audioRef.current

    if (repeatMode === 'one' && audio) {
      audio.currentTime = 0
      seek(0)

      audio.play().catch((error: unknown) => {
        console.error(
          'Audio preview could not restart:',
          error,
        )

        pause()
      })

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

  return (
    <>
      <audio
        ref={audioRef}
        preload="metadata"
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onError={handleAudioError}
      />

      <footer
        className="fixed bottom-[calc(64px+env(safe-area-inset-bottom))] left-0 right-0 z-30 border-t border-white/10 bg-black/40 backdrop-blur-2xl lg:bottom-0 lg:left-60"
        aria-label="Music player"
        role="region"
      >
        <div className="mx-auto flex min-h-[120px] max-w-[1600px] flex-col justify-center px-3 py-2 sm:px-4 lg:h-24 lg:min-h-0 lg:px-6">
          {/* Desktop layout */}
          <div className="hidden h-full items-center gap-4 md:grid md:grid-cols-[minmax(180px,1fr)_minmax(0,2fr)_minmax(180px,1fr)] md:items-center">
            {/* Track information */}
            <div className="flex min-w-0 items-center gap-3">
              {currentTrack ? (
                <>
                  {currentTrack.artworkUrl ? (
                    <img
                      src={currentTrack.artworkUrl}
                      alt=""
                      className="h-14 w-14 shrink-0 rounded-md object-cover shadow-lg"
                    />
                  ) : (
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-white/10 text-white/40">
                      <ListMusic className="h-5 w-5" />
                    </div>
                  )}

                  <div className="min-w-0">
                    <p
                      className="truncate text-sm font-semibold text-white"
                      aria-live="polite"
                    >
                      {currentTrack.title}
                    </p>

                    <p className="truncate text-xs text-white/50">
                      {currentTrack.artistName}
                    </p>

                    {!hasPlayablePreview && (
                      <p className="mt-0.5 truncate text-[11px] text-amber-300/70">
                        Preview unavailable
                      </p>
                    )}

                    {audioError && (
                      <p className="mt-0.5 truncate text-[11px] text-red-300/70">
                        {audioError}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleLike()}
                    className={cn(
                      'ml-1 shrink-0 rounded-full p-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40',
                      liked
                        ? 'text-rose-400'
                        : 'text-white/50 hover:text-white',
                    )}
                    aria-label={
                      liked
                        ? 'Unlike track'
                        : 'Like track'
                    }
                    aria-pressed={liked}
                  >
                    <Heart
                      className={cn(
                        'h-4 w-4',
                        liked && 'fill-current',
                      )}
                    />
                  </button>
                </>
              ) : (
                <p className="text-sm text-white/40">
                  Select a track to play
                </p>
              )}
            </div>

            {/* Playback controls and progress */}
            <div className="flex min-w-0 flex-col gap-2">
              <div className="flex items-center justify-center gap-2">
                <ControlButton
                  onClick={toggleShuffle}
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
                  disabled={!hasPlayablePreview}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label={
                    !hasPlayablePreview
                      ? 'Preview unavailable'
                      : isPlaying
                        ? 'Pause'
                        : 'Play'
                  }
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
                  onClick={cycleRepeat}
                  active={repeatMode !== 'off'}
                  label={`Repeat: ${repeatMode}`}
                  disabled={!currentTrack}
                >
                  {repeatMode === 'one' ? (
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
                accentColor={accentColor}
              />
            </div>

            {/* Volume and queue */}
            <div className="flex items-center justify-end gap-2">
              <PlayerVolumeControl
                volume={volume}
                onChange={setVolume}
              />

              <ControlButton
                onClick={toggleQueue}
                label="Open queue"
                disabled={!currentTrack}
              >
                <ListMusic className="h-4 w-4" />
              </ControlButton>
            </div>
          </div>

          {/* Mobile layout */}
          <div className="flex h-full flex-col justify-center gap-2 md:hidden">
            <PlayerProgressBar
              progress={progress}
              duration={duration}
              onSeek={handleSeek}
              accentColor={accentColor}
            />

            <div className="flex items-center gap-3">
              {currentTrack &&
                (currentTrack.artworkUrl ? (
                  <img
                    src={currentTrack.artworkUrl}
                    alt=""
                    className="h-10 w-10 shrink-0 rounded object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-white/10 text-white/40">
                    <ListMusic className="h-4 w-4" />
                  </div>
                ))}

              <div className="min-w-0 flex-1">
                <p
                  className="truncate text-sm font-semibold text-white"
                  aria-live="polite"
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
                    <p className="truncate text-[10px] text-amber-300/70">
                      Preview unavailable
                    </p>
                  )}
              </div>

              <button
                type="button"
                onClick={() => toggleLike()}
                disabled={!currentTrack}
                className={cn(
                  'shrink-0 rounded-full p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40',
                  liked
                    ? 'text-rose-400'
                    : 'text-white/50',
                )}
                aria-label={
                  liked
                    ? 'Unlike track'
                    : 'Like track'
                }
                aria-pressed={liked}
              >
                <Heart
                  className={cn(
                    'h-4 w-4',
                    liked && 'fill-current',
                  )}
                />
              </button>

              <ControlButton
                onClick={toggleShuffle}
                active={isShuffle}
                label="Toggle shuffle"
                disabled={!currentTrack}
                compact
              >
                <Shuffle className="h-4 w-4" />
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
                disabled={!hasPlayablePreview}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label={
                  !hasPlayablePreview
                    ? 'Preview unavailable'
                    : isPlaying
                      ? 'Pause'
                      : 'Play'
                }
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
                onClick={cycleRepeat}
                active={repeatMode !== 'off'}
                label="Repeat"
                disabled={!currentTrack}
                compact
              >
                {repeatMode === 'one' ? (
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

              <ControlButton
                onClick={toggleQueue}
                label="Queue"
                disabled={!currentTrack}
                compact
              >
                <ListMusic className="h-4 w-4" />
              </ControlButton>
            </div>
          </div>
        </div>
      </footer>

      <PlayerQueueSheet />
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
  active,
  disabled,
  compact,
  children,
}: ControlButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 disabled:opacity-40',
        compact ? 'p-1.5' : 'p-2',
        active && 'text-white',
      )}
      aria-label={label}
      aria-pressed={active}
    >
      {children}
    </button>
  )
}