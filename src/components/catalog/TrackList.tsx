import { motion } from 'motion/react'
import type { Track } from '@/types/track'
import { TrackRow } from './TrackRow'

interface TrackListProps {
  tracks: Track[]
  title?: string
  onPlayTrack: (track: Track) => void
}

export function TrackList({ tracks, title = 'Popular', onPlayTrack }: TrackListProps) {
  return (
    <motion.section
      key={tracks.map((t) => t.id).join('-')}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.05 }}
      aria-label={title}
    >
      <h2 className="mb-3 text-lg font-bold text-white">{title}</h2>
      <div className="flex flex-col gap-0.5">
        {tracks.map((track, index) => (
          <TrackRow key={track.id} track={track} index={index} onPlay={onPlayTrack} />
        ))}
      </div>
    </motion.section>
  )
}
