import { motion } from 'motion/react'
import type { Album } from '@/types/album'

interface AlbumCardProps {
  album: Album
  onSelect?: (albumId: string) => void
}

export function AlbumCard({ album, onSelect }: AlbumCardProps) {
  return (
    <motion.button
      type="button"
      onClick={() => onSelect?.(album.id)}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      className="group w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded-lg"
      aria-label={`${album.title}, ${album.releaseYear}`}
    >
      <div className="relative aspect-square overflow-hidden rounded-lg bg-white/5 shadow-lg">
        <img
          src={album.coverUrl}
          alt=""
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
      </div>
      <p className="mt-3 truncate text-sm font-semibold text-white">{album.title}</p>
      <p className="text-xs text-white/45">{album.releaseYear}</p>
    </motion.button>
  )
}
