import { useNavigate } from 'react-router-dom'

import { artists, albums } from '@/data'
import { useArtistStore } from '@/features/artist/artist-store'

export function DiscoverPage() {
  const navigate = useNavigate()
  const setActiveArtistId = useArtistStore((state) => state.setActiveArtistId)

  const handleSelectArtist = (artistId: string) => {
    setActiveArtistId(artistId)
    navigate('/')
  }

  return (
    <div className="space-y-10 p-8">
      <div>
        <h1 className="text-5xl font-bold text-white">Discover</h1>
        <p className="mt-2 text-white/60">
          Find new artists, albums and sounds you'll love.
        </p>
      </div>

      <input
        type="text"
        placeholder="Search artists, albums, genres..."
        className="w-full rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none transition focus:border-pink-500"
      />

      <section>
        <h2 className="mb-4 text-2xl font-semibold text-white">
          Trending Artists
        </h2>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {artists.map((artist) => (
            <button
              key={artist.id}
              onClick={() => handleSelectArtist(artist.id)}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 text-left backdrop-blur-sm transition hover:bg-white/10"
            >
              <img
                src={artist.portraitUrl}
                alt={artist.name}
                className="mb-4 h-40 w-full rounded-xl object-cover"
              />

              <h3 className="font-semibold text-white">{artist.name}</h3>
              <p className="text-sm text-white/50">Artist</p>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-semibold text-white">
          Recommended Albums
        </h2>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {albums.map((album) => {
            const artist = artists.find((a) => a.id === album.artistId)

            return (
              <div
                key={album.id}
                className="overflow-hidden rounded-2xl border border-white/10 bg-white/5"
              >
                <img
                  src={album.coverUrl}
                  alt={album.title}
                  className="h-48 w-full object-cover"
                />

                <div className="p-4">
                  <h3 className="font-semibold text-white">{album.title}</h3>
                  <p className="text-sm text-white/50">
                    {artist?.name} · {album.releaseYear}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}