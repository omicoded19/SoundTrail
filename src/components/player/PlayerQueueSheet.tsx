import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { usePlayerStore } from '@/features/player/player-store'
import { formatDuration } from '@/lib/format'
import { cn } from '@/lib/cn'

export function PlayerQueueSheet() {
  const isQueueOpen = usePlayerStore((s) => s.isQueueOpen)
  const closeQueue = usePlayerStore((s) => s.closeQueue)
  const queue = usePlayerStore((s) => s.queue)
  const queueIndex = usePlayerStore((s) => s.queueIndex)
  const playTrack = usePlayerStore((s) => s.playTrack)

  return (
    <AnimatePresence>
      {isQueueOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:left-60"
            onClick={closeQueue}
            aria-hidden="true"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="fixed bottom-[calc(136px+64px+env(safe-area-inset-bottom))] left-0 right-0 z-50 max-h-[45vh] overflow-hidden rounded-t-2xl border-t border-white/10 bg-[#1a1a1a]/95 backdrop-blur-xl lg:bottom-24 lg:left-60"
            role="dialog"
            aria-label="Playback queue"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <h3 className="text-sm font-bold text-white">Up Next</h3>
              <button
                type="button"
                onClick={closeQueue}
                className="rounded-full p-2 text-white/60 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                aria-label="Close queue"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <ul className="max-h-[calc(45vh-64px)] overflow-y-auto px-2 py-2">
              {queue.length === 0 ? (
                <li className="px-3 py-8 text-center text-sm text-white/40">
                  No tracks in queue. Play a song to get started.
                </li>
              ) : (
                queue.map((track, index) => (
                  <li key={`${track.id}-${index}`}>
                    <button
                      type="button"
                      onClick={() => playTrack(track, queue)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40',
                        index === queueIndex && 'bg-white/10',
                      )}
                    >
                      <span className="w-5 text-xs tabular-nums text-white/40">{index + 1}</span>
                      <img
                        src={track.artworkUrl}
                        alt=""
                        className="h-10 w-10 rounded object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-white">{track.title}</p>
                        <p className="truncate text-xs text-white/45">{track.artistName}</p>
                      </div>
                      <span className="text-xs tabular-nums text-white/40">
                        {formatDuration(track.durationSec)}
                      </span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
