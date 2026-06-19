import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { artists, albums } from '@/data'
import { useArtistStore } from '@/features/artist/artist-store'

export function DiscoverPage() {
  // Stores whatever the user types in the search bar
  const [search, setSearch] = useState('')

  const navigate = useNavigate()

  const setActiveArtistId = useArtistStore(
    (state) => state.setActiveArtistId,
  )

  // Convert search text to lowercase so searching is case-insensitive
  const searchText = search.toLowerCase().trim()

  // Keep only artists whose names contain the search text
  const filteredArtists = artists.filter((artist) =>
    artist.name.toLowerCase().includes(searchText),
  )

  // Keep only albums whose titles contain the search text
  const filteredAlbums = albums.filter((album) =>
    album.title.toLowerCase().includes(searchText),
  )

  const handleSelectArtist = (artistId: string) => {
    // Change the artist shown on the Home page
    setActiveArtistId(artistId)

    // Navigate back to the artist profile
    navigate('/')
  }

  return (
    <div className="space-y-10 p-8">
      <header>
        <h1 className="text-5xl font-bold text-white">
          Discover
        </h1>

        <p className="mt-2 text-white/60">
          Find new artists, albums and sounds you&apos;ll love.
        </p>
      </header>

      {/* Controlled search input */}
      <input
        type="search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search artists or albums..."
        className="w-full rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none transition placeholder:text-white/30 focus:border-pink-500"
      />

      <section>
        <h2 className="mb-4 text-2xl font-semibold text-white">
          Trending Artists
        </h2>

        {filteredArtists.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {filteredArtists.map((artist) => (
              <button
                key={artist.id}
                type="button"
                onClick={() => handleSelectArtist(artist.id)}
                className="rounded-2xl border border-white/10 bg-white/5 p-5 text-left transition hover:-translate-y-1 hover:bg-white/10"
              >
                <img
                  src={artist.portraitUrl}
                  alt={artist.name}
                  className="mb-4 h-40 w-full rounded-xl object-cover"
                />

                <h3 className="font-semibold text-white">
                  {artist.name}
                </h3>

                <p className="text-sm text-white/50">
                  Artist
                </p>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-white/50">
            No artists found.
          </p>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-semibold text-white">
          Recommended Albums
        </h2>

        {filteredAlbums.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {filteredAlbums.map((album) => {
              const albumArtist = artists.find(
                (artist) => artist.id === album.artistId,
              )

              return (
                <article
                  key={album.id}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition hover:-translate-y-1 hover:bg-white/10"
                >
                  <img
                    src={album.coverUrl}
                    alt={album.title}
                    className="h-48 w-full object-cover"
                  />

                  <div className="p-4">
                    <h3 className="font-semibold text-white">
                      {album.title}
                    </h3>

                    <p className="text-sm text-white/50">
                      {albumArtist?.name} · {album.releaseYear}
                    </p>
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <p className="text-white/50">
            No albums found.
          </p>
        )}
      </section>
    </div>
  )
}