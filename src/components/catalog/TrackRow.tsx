import { Play } from 'lucide-react'
import { motion } from 'motion/react'
import type { Track } from '@/types/track'
import { formatDuration } from '@/lib/format'
import { cn } from '@/lib/cn'
import { usePlayerStore } from '@/features/player/player-store'

interface TrackRowProps {
  track: Track
  index: number
  onPlay: (track: Track) => void
}

export function TrackRow({ track, index, onPlay }: TrackRowProps) {
  const currentTrack = usePlayerStore((s) => s.currentTrack)
  const isPlaying = usePlayerStore((s) => s.isPlaying)
  const isActive = currentTrack?.id === track.id
  const isCurrentlyPlaying = isActive && isPlaying

  return (
    <motion.button
      type="button"
      onClick={() => onPlay(track)}
      whileHover={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
      className={cn(
        'group grid w-full grid-cols-[2rem_1fr_auto] items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40',
        isActive && 'bg-white/10',
      )}
      aria-label={`Play ${track.title} by ${track.artistName}`}
      aria-current={isActive ? 'true' : undefined}
    >
      <span className="flex w-8 items-center justify-center text-sm tabular-nums">
        {isCurrentlyPlaying ? (
          <span className="flex gap-0.5" aria-label="Playing">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="inline-block h-3 w-0.5 animate-pulse rounded-full bg-white"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </span>
        ) : (
          <>
            <span
              className={cn(
                'text-white/40 group-hover:hidden',
                isActive && 'hidden',
              )}
            >
              {index + 1}
            </span>
            <Play
              className={cn(
                'h-3.5 w-3.5 fill-white text-white',
                isActive ? 'block' : 'hidden group-hover:block',
              )}
              aria-hidden="true"
            />
          </>
        )}
      </span>

      <div className="min-w-0">
        <p
          className={cn(
            'truncate text-sm font-medium',
            isActive ? 'text-white' : 'text-white/90',
          )}
        >
          {track.title}
        </p>
        <p className="truncate text-xs text-white/45">{track.albumTitle}</p>
      </div>

      <span className="text-xs tabular-nums text-white/40">
        {formatDuration(track.durationSec)}
      </span>
    </motion.button>
  )
}
