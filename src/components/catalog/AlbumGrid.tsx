import { motion } from 'motion/react'
import type { Album } from '@/types/album'
import { AlbumCard } from './AlbumCard'

interface AlbumGridProps {
  albums: Album[]
  title?: string
  onSelectAlbum?: (albumId: string) => void
}

export function AlbumGrid({ albums, title = 'Albums', onSelectAlbum }: AlbumGridProps) {
  return (
    <motion.section
      key={albums.map((a) => a.id).join('-')}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1 }}
      aria-label={title}
    >
      <h2 className="mb-4 text-lg font-bold text-white">{title}</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-2 xl:grid-cols-3">
        {albums.map((album) => (
          <AlbumCard key={album.id} album={album} onSelect={onSelectAlbum} />
        ))}
      </div>
    </motion.section>
  )
}
