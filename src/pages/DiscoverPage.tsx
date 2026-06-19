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
    Stores the text typed inside the search input.
  */
  const [search, setSearch] = useState('')

  const navigate = useNavigate()

  const setActiveArtistId = useArtistStore(
    (state) => state.setActiveArtistId,
  )

  const playTrack = usePlayerStore(
    (state) => state.playTrack,
  )

  /*
    Lowercase makes searching case-insensitive.

    For example:
    "LUNA" and "luna" will both find Luna Vale.
  */
  const searchText = search.toLowerCase().trim()

  const filteredArtists = artists.filter((artist) =>
    artist.name.toLowerCase().includes(searchText),
  )

  /*
    Albums can be searched using either:
    - album title
    - artist name
  */
  const filteredAlbums = albums.filter((album) => {
    const albumArtist = artists.find(
      (artist) => artist.id === album.artistId,
    )

    const matchesAlbum = album.title
      .toLowerCase()
      .includes(searchText)

    const matchesArtist = albumArtist?.name
      .toLowerCase()
      .includes(searchText)

    return matchesAlbum || matchesArtist
  })

  /*
    Clicking an artist:

    1. Changes the active artist in the Zustand store.
    2. Navigates back to the artist profile page.
  */
  const handleSelectArtist = (artistId: string) => {
    setActiveArtistId(artistId)
    navigate('/')
  }

  /*
    Clicking an album:

    1. Finds the selected album.
    2. Converts its track IDs into complete Track objects.
    3. Plays the first track.
    4. Sends all album tracks to the player's queue.
  */
  const handlePlayAlbum = (albumId: string) => {
    const selectedAlbum = albums.find(
      (album) => album.id === albumId,
    )

    if (!selectedAlbum) {
      return
    }

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

      {/* Search input */}
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
          className="w-full rounded-xl border border-white/10 bg-white/5 py-4 pl-14 pr-5 text-white outline-none transition placeholder:text-white/30 focus:border-pink-500"
        />
      </div>

      {/* Artist results */}
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

      {/* Album results */}
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
                <button
                  key={album.id}
                  type="button"
                  onClick={() => handlePlayAlbum(album.id)}
                  className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 text-left transition hover:-translate-y-1 hover:bg-white/10"
                  aria-label={`Play ${album.title}`}
                >
                  <div className="relative">
                    <img
                      src={album.coverUrl}
                      alt={album.title}
                      className="aspect-square w-full object-cover"
                    />

                    {/* Appears when the user hovers over an album */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition group-hover:opacity-100">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-black shadow-xl">
                        <Play className="h-6 w-6 fill-current" />
                      </div>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="truncate font-semibold text-white">
                      {album.title}
                    </h3>

                    <p className="mt-1 truncate text-sm text-white/50">
                      {albumArtist?.name}
                    </p>

                    <p className="mt-3 text-xs text-white/30">
                      {album.releaseYear} · {album.trackIds.length}{' '}
                      tracks
                    </p>
                  </div>
                </button>
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