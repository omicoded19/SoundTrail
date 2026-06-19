import type { Artist } from '@/types/artist'
import { RelatedArtistAvatar } from './RelatedArtistAvatar'

interface RelatedArtistsRowProps {
  artists: Artist[]
  activeArtistId: string
  onSelectArtist: (artistId: string) => void
  title?: string
}

export function RelatedArtistsRow({
  artists,
  activeArtistId,
  onSelectArtist,
  title = 'Related Artists',
}: RelatedArtistsRowProps) {
  return (
    <section aria-label={title}>
      <h2 className="mb-4 text-lg font-bold text-white">{title}</h2>
      <div className="flex flex-wrap gap-4 md:gap-6">
        {artists.map((artist) => (
          <RelatedArtistAvatar
            key={artist.id}
            artist={artist}
            isActive={artist.id === activeArtistId}
            onSelect={onSelectArtist}
          />
        ))}
      </div>
    </section>
  )
}
