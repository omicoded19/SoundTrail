import { motion } from 'motion/react'
import { ArtistHero } from '@/components/artist/ArtistHero'
import { ArtistTabs } from '@/components/artist/ArtistTabs'
import { RelatedArtistsRow } from '@/components/artist/RelatedArtistsRow'
import { TrackList } from '@/components/catalog/TrackList'
import { AlbumGrid } from '@/components/catalog/AlbumGrid'
import { useArtistStore } from '@/features/artist/artist-store'
import { usePlayerStore } from '@/features/player/player-store'
import {
  getArtistById,
  getTracksByArtist,
  getAlbumsByArtist,
  getRelatedArtists,
  getTrackById,
} from '@/data'

export function HomePage() {
  const activeArtistId = useArtistStore((s) => s.activeArtistId)
  const activeTab = useArtistStore((s) => s.activeTab)
  const setActiveArtistId = useArtistStore((s) => s.setActiveArtistId)
  const setActiveTab = useArtistStore((s) => s.setActiveTab)
  const playTrack = usePlayerStore((s) => s.playTrack)

  const artist = getArtistById(activeArtistId)
  if (!artist) return null

  const tracks = getTracksByArtist(activeArtistId)
  const albums = getAlbumsByArtist(activeArtistId)
  const relatedArtists = getRelatedArtists(activeArtistId)

  const handlePlayTrack = (track: (typeof tracks)[0]) => {
    playTrack(track, tracks)
  }

  const handleSelectAlbum = (albumId: string) => {
    const album = albums.find((item) => item.id === albumId)
    const firstTrackId = album?.trackIds[0]
    const track = firstTrackId ? getTrackById(firstTrackId) : undefined
    if (track) playTrack(track, tracks)
  }

  return (
    <motion.div
      className="min-h-screen overflow-x-hidden"
      animate={{
        background: `linear-gradient(135deg, ${artist.accentColor}22 0%, #0a0a0a 45%, #0a0a0a 100%)`,
      }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex min-h-screen flex-col lg:flex-row">
        <ArtistHero artist={artist} />

        <div className="flex min-w-0 flex-1 flex-col px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <ArtistTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            accentColor={artist.accentColor}
          />

          <div className="mt-6 flex-1">
            {activeTab === 'overview' && (
              <div className="space-y-10">
                <TrackList tracks={tracks} onPlayTrack={handlePlayTrack} />
                <AlbumGrid albums={albums} onSelectAlbum={handleSelectAlbum} />
                <RelatedArtistsRow
                  artists={relatedArtists}
                  activeArtistId={activeArtistId}
                  onSelectArtist={setActiveArtistId}
                />
              </div>
            )}

            {activeTab === 'related' && (
              <RelatedArtistsRow
                artists={relatedArtists}
                activeArtistId={activeArtistId}
                onSelectArtist={setActiveArtistId}
              />
            )}

            {activeTab === 'albums' && (
              <AlbumGrid albums={albums} title="All Albums" onSelectAlbum={handleSelectAlbum} />
            )}

            {activeTab === 'about' && (
              <section className="max-w-xl">
                <h2 className="mb-4 text-lg font-bold text-white">About {artist.name}</h2>
                <p className="text-sm leading-relaxed text-white/65">{artist.bio}</p>
              </section>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
