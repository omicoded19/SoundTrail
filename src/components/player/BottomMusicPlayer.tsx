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
  const currentTrack = usePlayerStore((s) => s.currentTrack)
  const isPlaying = usePlayerStore((s) => s.isPlaying)
  const progress = usePlayerStore((s) => s.progress)
  const volume = usePlayerStore((s) => s.volume)
  const isShuffle = usePlayerStore((s) => s.isShuffle)
  const repeatMode = usePlayerStore((s) => s.repeatMode)
  const togglePlay = usePlayerStore((s) => s.togglePlay)
  const next = usePlayerStore((s) => s.next)
  const previous = usePlayerStore((s) => s.previous)
  const seek = usePlayerStore((s) => s.seek)
  const setVolume = usePlayerStore((s) => s.setVolume)
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle)
  const cycleRepeat = usePlayerStore((s) => s.cycleRepeat)
  const toggleLike = usePlayerStore((s) => s.toggleLike)
  const isLiked = usePlayerStore((s) => s.isLiked)
  const toggleQueue = usePlayerStore((s) => s.toggleQueue)

  const activeArtistId = useArtistStore((s) => s.activeArtistId)
  const artist = getArtistById(activeArtistId)
  const accentColor = artist?.accentColor ?? '#ffffff'

  const duration = currentTrack?.durationSec ?? 0
  const liked = currentTrack ? isLiked(currentTrack.id) : false

  return (
    <>
      <footer
        className="fixed bottom-[calc(64px+env(safe-area-inset-bottom))] left-0 right-0 z-30 border-t border-white/10 bg-black/40 backdrop-blur-2xl lg:bottom-0 lg:left-60"
        aria-label="Music player"
        role="region"
      >
        <div className="mx-auto flex min-h-[120px] max-w-[1600px] flex-col justify-center px-3 py-2 sm:px-4 lg:h-24 lg:min-h-0 lg:px-6">
          {/* Desktop layout */}
          <div className="hidden h-full items-center gap-4 md:grid md:grid-cols-[minmax(180px,1fr)_minmax(0,2fr)_minmax(180px,1fr)] md:items-center">
            {/* Track info */}
            <div className="flex min-w-0 items-center gap-3">
              {currentTrack ? (
                <>
                  <img
                    src={currentTrack.artworkUrl}
                    alt=""
                    className="h-14 w-14 shrink-0 rounded-md object-cover shadow-lg"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white" aria-live="polite">
                      {currentTrack.title}
                    </p>
                    <p className="truncate text-xs text-white/50">{currentTrack.artistName}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleLike()}
                    className={cn(
                      'ml-1 shrink-0 rounded-full p-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40',
                      liked ? 'text-rose-400' : 'text-white/50 hover:text-white',
                    )}
                    aria-label={liked ? 'Unlike track' : 'Like track'}
                    aria-pressed={liked}
                  >
                    <Heart className={cn('h-4 w-4', liked && 'fill-current')} />
                  </button>
                </>
              ) : (
                <p className="text-sm text-white/40">Select a track to play</p>
              )}
            </div>

            {/* Controls + progress */}
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
                <ControlButton onClick={previous} label="Previous track" disabled={!currentTrack}>
                  <SkipBack className="h-5 w-5 fill-current" />
                </ControlButton>
                <button
                  type="button"
                  onClick={togglePlay}
                  disabled={!currentTrack}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 disabled:opacity-40"
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4 fill-current" />
                  ) : (
                    <Play className="h-4 w-4 fill-current pl-0.5" />
                  )}
                </button>
                <ControlButton onClick={next} label="Next track" disabled={!currentTrack}>
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
                onSeek={seek}
                accentColor={accentColor}
              />
            </div>

            {/* Volume + queue */}
            <div className="flex items-center justify-end gap-2">
              <PlayerVolumeControl volume={volume} onChange={setVolume} />
              <ControlButton
                onClick={toggleQueue}
                label="Open queue"
                disabled={!currentTrack}
              >
                <ListMusic className="h-4 w-4" />
              </ControlButton>
            </div>
          </div>

          {/* Mobile compact layout */}
          <div className="flex h-full flex-col justify-center gap-2 md:hidden">
            <PlayerProgressBar
              progress={progress}
              duration={duration}
              onSeek={seek}
              accentColor={accentColor}
            />
            <div className="flex items-center gap-3">
              {currentTrack && (
                <img
                  src={currentTrack.artworkUrl}
                  alt=""
                  className="h-10 w-10 shrink-0 rounded object-cover"
                />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white" aria-live="polite">
                  {currentTrack?.title ?? 'No track selected'}
                </p>
                <p className="truncate text-xs text-white/50">
                  {currentTrack?.artistName ?? 'SoundTrail'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => toggleLike()}
                disabled={!currentTrack}
                className={cn(
                  'shrink-0 rounded-full p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40',
                  liked ? 'text-rose-400' : 'text-white/50',
                )}
                aria-label={liked ? 'Unlike track' : 'Like track'}
                aria-pressed={liked}
              >
                <Heart className={cn('h-4 w-4', liked && 'fill-current')} />
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
              <ControlButton onClick={previous} label="Previous" disabled={!currentTrack} compact>
                <SkipBack className="h-4 w-4 fill-current" />
              </ControlButton>
              <button
                type="button"
                onClick={togglePlay}
                disabled={!currentTrack}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 disabled:opacity-40"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="h-3.5 w-3.5 fill-current" />
                ) : (
                  <Play className="h-3.5 w-3.5 fill-current pl-0.5" />
                )}
              </button>
              <ControlButton onClick={next} label="Next" disabled={!currentTrack} compact>
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
              <ControlButton onClick={toggleQueue} label="Queue" disabled={!currentTrack} compact>
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
  children: React.ReactNode
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
