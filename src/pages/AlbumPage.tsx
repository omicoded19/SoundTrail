import { ArrowLeft, Play } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'

import {
  getAlbumById,
  getArtistById,
  getTracksByAlbum,
} from '@/data'

import { useArtistStore } from '@/features/artist/artist-store'
import { usePlayerStore } from '@/features/player/player-store'

function formatDuration(durationSec: number) {
  const minutes = Math.floor(durationSec / 60)
  const seconds = durationSec % 60

  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export function AlbumPage() {
  /*
    Reads the album ID from a URL such as:

    /album/lv-album-starlight
  */
  const { albumId } = useParams()

  const navigate = useNavigate()

  const playTrack = usePlayerStore(
    (state) => state.playTrack,
  )

  const setActiveArtistId = useArtistStore(
    (state) => state.setActiveArtistId,
  )

  /*
    Find the album using the ID from the URL.
  */
  const album = getAlbumById(albumId ?? '')

  /*
    Find the album's artist and tracks.
  */
  const artist = album
    ? getArtistById(album.artistId)
    : undefined

  const albumTracks = album
    ? getTracksByAlbum(album.id)
    : []

  /*
    Show a fallback when the URL contains an invalid album ID.
  */
  if (!album || !artist) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
        <h1 className="text-3xl font-bold text-white">
          Album not found
        </h1>

        <button
          type="button"
          onClick={() => navigate('/discover')}
          className="mt-5 rounded-full bg-white px-6 py-3 font-semibold text-black"
        >
          Return to Discover
        </button>
      </div>
    )
  }

  const handlePlayAlbum = () => {
    const firstTrack = albumTracks[0]

    if (firstTrack) {
      playTrack(firstTrack, albumTracks)
    }
  }

  const handleOpenArtist = () => {
    setActiveArtistId(artist.id)
    navigate('/')
  }

  return (
    <div
      className="min-h-screen p-6 pb-32 sm:p-8"
      style={{
        background: `
          linear-gradient(
            145deg,
            ${artist.accentColorDark} 0%,
            #171717 45%,
            #0d0d0d 100%
          )
        `,
      }}
    >
      <button
        type="button"
        onClick={() => navigate('/discover')}
        className="flex items-center gap-2 text-sm text-white/60 transition hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Discover
      </button>

      <header className="mt-10 flex flex-col gap-8 md:flex-row md:items-end">
        <img
          src={album.coverUrl}
          alt={album.title}
          className="aspect-square w-full max-w-[300px] rounded-2xl object-cover shadow-2xl"
        />

        <div className="min-w-0">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/50">
            Album
          </p>

          <h1 className="mt-3 text-5xl font-bold tracking-tight text-white sm:text-6xl">
            {album.title}
          </h1>

          <button
            type="button"
            onClick={handleOpenArtist}
            className="mt-4 font-medium text-white/70 transition hover:text-white"
          >
            {artist.name}
          </button>

          <p className="mt-2 text-sm text-white/50">
            {album.releaseYear} · {albumTracks.length} tracks
          </p>

          <button
            type="button"
            onClick={handlePlayAlbum}
            disabled={albumTracks.length === 0}
            className="mt-7 flex items-center gap-2 rounded-full bg-white px-7 py-3 font-semibold text-black transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Play className="h-5 w-5 fill-current" />
            Play album
          </button>
        </div>
      </header>

      <section className="mt-12 overflow-hidden rounded-3xl border border-white/10 bg-black/20">
        {albumTracks.map((track, index) => (
          <button
            key={track.id}
            type="button"
            onClick={() => playTrack(track, albumTracks)}
            className="flex w-full items-center gap-4 border-b border-white/10 px-5 py-4 text-left transition last:border-b-0 hover:bg-white/5"
          >
            <span className="w-6 text-sm text-white/30">
              {index + 1}
            </span>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10">
              <Play className="h-4 w-4 text-white/70" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-white">
                {track.title}
              </p>

              <p className="truncate text-sm text-white/50">
                {track.artistName}
              </p>
            </div>

            <span className="text-sm text-white/40">
              {formatDuration(track.durationSec)}
            </span>
          </button>
        ))}
      </section>
    </div>
  )
}