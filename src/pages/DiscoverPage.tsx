import { useState } from 'react'
import { Play, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import {
  albums,
  artists,
  getTrackById,
} from '@/data'

import { useArtistStore } from '@/features/artist/artist-store'
import { usePlayerStore } from '@/features/player/player-store'

import type { Track } from '@/types/track'

export function DiscoverPage() {
  /*
    Stores whatever the user types into the search bar.
  */
  const [search, setSearch] = useState('')

  /*
    navigate lets us move to another route using TypeScript code.
  */
  const navigate = useNavigate()

  /*
    Changes the artist currently displayed on the Home page.
  */
  const setActiveArtistId = useArtistStore(
    (state) => state.setActiveArtistId,
  )

  /*
    Starts a track and loads a queue into the bottom player.
  */
  const playTrack = usePlayerStore(
    (state) => state.playTrack,
  )

  /*
    Lowercase makes searching case-insensitive.

    "LUNA", "Luna", and "luna" will produce the same result.
  */
  const searchText = search.toLowerCase().trim()

  /*
    Keep artists whose names contain the search text.
  */
  const filteredArtists = artists.filter((artist) =>
    artist.name.toLowerCase().includes(searchText),
  )

  /*
    Keep albums whose album title or artist name
    contains the search text.
  */
  const filteredAlbums = albums.filter((album) => {
    const albumArtist = artists.find(
      (artist) => artist.id === album.artistId,
    )

    const matchesAlbumTitle = album.title
      .toLowerCase()
      .includes(searchText)

    const matchesArtistName = albumArtist?.name
      .toLowerCase()
      .includes(searchText)

    return matchesAlbumTitle || matchesArtistName
  })

  /*
    Open an artist on the Home page.
  */
  const handleSelectArtist = (artistId: string) => {
    setActiveArtistId(artistId)
    navigate('/')
  }

  /*
    Play an album without opening its details page.
  */
  const handlePlayAlbum = (albumId: string) => {
    const selectedAlbum = albums.find(
      (album) => album.id === albumId,
    )

    if (!selectedAlbum) {
      return
    }

    /*
      Convert the album's track IDs into complete Track objects.
    */
    const albumTracks = selectedAlbum.trackIds
      .map((trackId) => getTrackById(trackId))
      .filter((track): track is Track => Boolean(track))

    const firstTrack = albumTracks[0]

    if (firstTrack) {
      playTrack(firstTrack, albumTracks)
    }
  }

  return (
    <div className="min-h-screen space-y-10 p-8 pb-32">
      <header>
        <h1 className="text-5xl font-bold text-white">
          Discover
        </h1>

        <p className="mt-2 text-white/60">
          Find new artists, albums and sounds you&apos;ll love.
        </p>
      </header>

      {/* Search bar */}
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-white/30"
          aria-hidden="true"
        />

        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search artists or albums..."
          className="w-full rounded-xl border border-white/10 bg-white/5 py-4 pl-14 pr-5 text-white outline-none transition placeholder:text-white/30 focus:border-[var(--accent)]"
        />
      </div>

      {/* Artists */}
      <section>
        <h2 className="mb-5 text-2xl font-semibold text-white">
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
                  className="mb-4 h-44 w-full rounded-xl object-cover"
                />

                <h3 className="font-semibold text-white">
                  {artist.name}
                </h3>

                <p className="mt-1 text-sm text-white/50">
                  Artist
                </p>
              </button>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center">
            <p className="text-white/50">
              No artists matched your search.
            </p>
          </div>
        )}
      </section>

      {/* Albums */}
      <section>
        <h2 className="mb-5 text-2xl font-semibold text-white">
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
                  className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition hover:-translate-y-1 hover:bg-white/10"
                >
                  <div className="relative">
                    {/* Clicking the cover opens the Album page */}
                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/album/${album.id}`)
                      }
                      className="block w-full"
                      aria-label={`Open ${album.title}`}
                    >
                      <img
                        src={album.coverUrl}
                        alt={album.title}
                        className="aspect-square w-full object-cover"
                      />
                    </button>

                    {/* Clicking this button plays the album immediately */}
                    <button
                      type="button"
                      onClick={() => handlePlayAlbum(album.id)}
                      aria-label={`Play ${album.title}`}
                      className="absolute bottom-4 right-4 flex h-14 w-14 items-center justify-center rounded-full bg-white text-black opacity-0 shadow-xl transition hover:scale-105 group-hover:opacity-100"
                    >
                      <Play className="h-6 w-6 fill-current" />
                    </button>
                  </div>

                  {/* Clicking album information opens the Album page */}
                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/album/${album.id}`)
                    }
                    className="block w-full p-4 text-left"
                  >
                    <h3 className="truncate font-semibold text-white">
                      {album.title}
                    </h3>

                    <p className="mt-1 truncate text-sm text-white/50">
                      {albumArtist?.name}
                    </p>

                    <p className="mt-3 text-xs text-white/30">
                      {album.releaseYear} ·{' '}
                      {album.trackIds.length} tracks
                    </p>
                  </button>
                </article>
              )
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center">
            <p className="text-white/50">
              No albums matched your search.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}