import { motion } from 'motion/react'
import type { Artist } from '@/types/artist'
import { cn } from '@/lib/cn'

interface RelatedArtistAvatarProps {
  artist: Artist
  isActive?: boolean
  onSelect: (artistId: string) => void
}

export function RelatedArtistAvatar({ artist, isActive, onSelect }: RelatedArtistAvatarProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(artist.id)}
      className="group flex flex-col items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded-lg p-1"
      aria-label={`View ${artist.name}`}
      aria-current={isActive ? 'true' : undefined}
    >
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
        className={cn(
          'relative h-16 w-16 overflow-hidden rounded-full ring-2 transition-all md:h-20 md:w-20',
          isActive ? 'ring-white' : 'ring-transparent group-hover:ring-white/40',
        )}
        style={isActive ? { boxShadow: `0 0 0 2px ${artist.accentColor}` } : undefined}
      >
        <img
          src={artist.portraitUrl}
          alt=""
          className="h-full w-full object-cover object-top"
        />
      </motion.div>
      <span
        className={cn(
          'max-w-[80px] truncate text-xs font-medium',
          isActive ? 'text-white' : 'text-white/60 group-hover:text-white',
        )}
      >
        {artist.name}
      </span>
    </button>
  )
}
