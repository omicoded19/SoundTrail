import { formatDuration } from '@/lib/format'
import { cn } from '@/lib/cn'

interface PlayerProgressBarProps {
  progress: number
  duration: number
  onSeek: (time: number) => void
  accentColor?: string
  className?: string
}

export function PlayerProgressBar({
  progress,
  duration,
  onSeek,
  accentColor = '#ffffff',
  className,
}: PlayerProgressBarProps) {
  const safeDuration = duration > 0 ? duration : 1
  const percent = Math.min(100, (progress / safeDuration) * 100)

  return (
    <div className={cn('flex min-w-0 flex-1 items-center gap-2', className)}>
      <span className="hidden w-10 shrink-0 text-right text-[11px] tabular-nums text-white/50 sm:block">
        {formatDuration(progress)}
      </span>

      <input
        type="range"
        min={0}
        max={safeDuration}
        step={1}
        value={Math.min(progress, safeDuration)}
        onChange={(e) => onSeek(Number(e.target.value))}
        className="h-1 min-w-0 flex-1 cursor-pointer appearance-none rounded-full bg-white/20 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full"
        style={{
          background: `linear-gradient(to right, ${accentColor} ${percent}%, rgba(255,255,255,0.2) ${percent}%)`,
        }}
        aria-label="Seek"
        aria-valuemin={0}
        aria-valuemax={safeDuration}
        aria-valuenow={progress}
      />

      <span className="hidden w-10 shrink-0 text-[11px] tabular-nums text-white/50 sm:block">
        {formatDuration(safeDuration)}
      </span>
    </div>
  )
}
