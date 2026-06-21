import { useEffect, useState } from 'react'
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  Clock3,
  Disc3,
  ExternalLink,
  LoaderCircle,
  MapPin,
  Mic2,
  Music2,
  Pause,
  Play,
} from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import { usePlayerStore } from '@/features/player/player-store'
import { formatDuration } from '@/lib/format'
import {
  getArtistDetails,
  searchTracks,
  type SoundTrailArtist,
} from '@/services/api'
import type { Track } from '@/types/track'

function getArtistInitials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
}

export function ArtistDetailsPage() {
  const { artistId } = useParams<{
    artistId: string
  }>()

  const [artist, setArtist] =
    useState<SoundTrailArtist | null>(null)

  const [tracks, setTracks] =
    useState<Track[]>([])

  const [isArtistLoading, setIsArtistLoading] =
    useState(true)

  const [isTracksLoading, setIsTracksLoading] =
    useState(true)

  const [artistError, setArtistError] =
    useState<string | null>(null)

  const [tracksError, setTracksError] =
    useState<string | null>(null)

  const currentTrack = usePlayerStore(
    (state) => state.currentTrack,
  )

  const isPlaying = usePlayerStore(
    (state) => state.isPlaying,
  )

  const playTrack = usePlayerStore(
    (state) => state.playTrack,
  )

  const togglePlay = usePlayerStore(
    (state) => state.togglePlay,
  )

  useEffect(() => {
    if (!artistId) {
      setArtistError('No artist ID was provided.')
      setTracksError('No artist ID was provided.')
      setIsArtistLoading(false)
      setIsTracksLoading(false)

      return
    }

    const selectedArtistId = artistId
    const controller = new AbortController()

    setArtist(null)
    setTracks([])
    setArtistError(null)
    setTracksError(null)
    setIsArtistLoading(true)
    setIsTracksLoading(true)

    async function loadPage() {
      try {
        /*
          MusicBrainz provides the artist profile.
        */
        const artistResult =
          await getArtistDetails(
            selectedArtistId,
            controller.signal,
          )

        setArtist(artistResult)
        setIsArtistLoading(false)

        try {
          /*
            iTunes provides artwork and playable
            audio previews.
          */
          const trackResults =
            await searchTracks(
              artistResult.name,
              controller.signal,
            )

          setTracks(trackResults)
        } catch (requestError) {
          if (
            requestError instanceof DOMException &&
            requestError.name === 'AbortError'
          ) {
            return
          }

          console.error(
            'Playable artist tracks request failed:',
            requestError,
          )

          setTracks([])

          setTracksError(
            requestError instanceof Error
              ? requestError.message
              : 'We could not load playable songs for this artist.',
          )
        }
      } catch (requestError) {
        if (
          requestError instanceof DOMException &&
          requestError.name === 'AbortError'
        ) {
          return
        }

        console.error(
          'Artist details request failed:',
          requestError,
        )

        setArtist(null)
        setTracks([])

        setArtistError(
          requestError instanceof Error
            ? requestError.message
            : 'We could not load this artist.',
        )
      } finally {
        if (!controller.signal.aborted) {
          setIsArtistLoading(false)
          setIsTracksLoading(false)
        }
      }
    }

    loadPage()

    return () => {
      controller.abort()
    }
  }, [artistId])

  function handlePlayTrack(track: Track) {
    if (!track.previewUrl) {
      return
    }

    /*
      Clicking the active track pauses or resumes it.
    */
    if (currentTrack?.id === track.id) {
      togglePlay()
      return
    }

    /*
      Give the player every playable artist track
      so next and previous continue working.
    */
    const playableQueue = tracks.filter(
      (item) => Boolean(item.previewUrl),
    )

    playTrack(track, playableQueue)
  }

  if (isArtistLoading && !artist) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center px-6">
        <div className="text-center">
          <LoaderCircle
            className="mx-auto animate-spin text-violet-400"
            size={38}
          />

          <p className="mt-4 text-sm text-white/50">
            Loading artist details...
          </p>
        </div>
      </main>
    )
  }

  if (!artist) {
    return (
      <main className="min-h-screen px-6 py-10 lg:px-12">
        <section className="mx-auto max-w-6xl">
          <Link
            to="/discover"
            className="inline-flex items-center gap-2 text-sm text-white/50 transition hover:text-white"
          >
            <ArrowLeft size={18} />
            Back to Discover
          </Link>

          <div
            role="alert"
            className="mt-10 flex items-start gap-3 rounded-2xl border border-red-400/20 bg-red-500/10 p-5 text-red-200"
          >
            <AlertCircle
              className="mt-0.5 shrink-0"
              size={21}
            />

            <div>
              <h1 className="font-semibold">
                Artist could not be loaded
              </h1>

              <p className="mt-1 text-sm text-red-200/70">
                {artistError ??
                  'No artist information was found.'}
              </p>
            </div>
          </div>
        </section>
      </main>
    )
  }

  const artistLocation =
    artist.area?.name ??
    artist.beginArea?.name ??
    artist.country ??
    'Location unavailable'

  const activeYears = artist.lifeSpan?.begin
    ? `${artist.lifeSpan.begin} – ${
        artist.lifeSpan.ended
          ? artist.lifeSpan.end ?? 'Unknown'
          : 'Present'
      }`
    : 'Years unavailable'

  const genres = [...artist.genres]
    .sort((firstGenre, secondGenre) => {
      return secondGenre.count - firstGenre.count
    })
    .slice(0, 8)

  const tags = [...artist.tags]
    .sort((firstTag, secondTag) => {
      return secondTag.count - firstTag.count
    })
    .slice(0, 8)

  const displayedTracks = tracks.slice(0, 12)

  return (
    <main className="min-h-screen px-6 py-10 lg:px-12">
      <section className="mx-auto max-w-6xl">
        <Link
          to="/discover"
          className="inline-flex items-center gap-2 text-sm text-white/50 transition hover:text-white"
        >
          <ArrowLeft size={18} />
          Back to Discover
        </Link>

        <div className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]">
          <div className="relative px-6 py-12 md:px-10 md:py-16">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 via-fuchsia-500/5 to-transparent" />

            <div className="relative flex flex-col gap-7 md:flex-row md:items-center">
              <div className="flex size-28 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-3xl font-bold text-white shadow-2xl shadow-violet-950/40 md:size-36 md:text-4xl">
                {getArtistInitials(artist.name)}
              </div>

              <div className="min-w-0">
                <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-violet-300">
                  {artist.type ?? 'Artist'}
                </p>

                <h1 className="text-4xl font-bold text-white md:text-6xl">
                  {artist.name}
                </h1>

                {artist.disambiguation && (
                  <p className="mt-3 max-w-2xl text-base text-white/50">
                    {artist.disambiguation}
                  </p>
                )}

                <div className="mt-6 flex flex-wrap gap-3">
                  <span className="flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-white/60">
                    <MapPin size={16} />
                    {artistLocation}
                  </span>

                  <span className="flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-white/60">
                    <CalendarDays size={16} />
                    {activeYears}
                  </span>

                  <span className="flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-white/60">
                    <Mic2 size={16} />
                    {artist.type ?? 'Artist'}
                  </span>
                </div>

                <a
                  href={artist.musicBrainzUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-violet-300 transition hover:text-violet-200"
                >
                  View on MusicBrainz
                  <ExternalLink size={16} />
                </a>
              </div>
            </div>
          </div>

          <div className="grid gap-8 border-t border-white/10 p-6 md:grid-cols-2 md:p-10">
            <div>
              <h2 className="text-xl font-semibold text-white">
                Genres
              </h2>

              <div className="mt-4 flex flex-wrap gap-2">
                {genres.length > 0 ? (
                  genres.map((genre) => (
                    <span
                      key={genre.id ?? genre.name}
                      className="rounded-full bg-violet-500/10 px-3 py-1.5 text-sm text-violet-300"
                    >
                      {genre.name}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-white/40">
                    No genre information available.
                  </p>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white">
                Tags
              </h2>

              <div className="mt-4 flex flex-wrap gap-2">
                {tags.length > 0 ? (
                  tags.map((tag) => (
                    <span
                      key={tag.name}
                      className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm text-white/60"
                    >
                      {tag.name}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-white/40">
                    No tags available.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <section className="mt-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-violet-400">
                Playable previews
              </p>

              <h2 className="mt-2 text-2xl font-bold text-white">
                Songs by {artist.name}
              </h2>
            </div>

            {!isTracksLoading && !tracksError && (
              <span className="text-sm text-white/40">
                {displayedTracks.length} songs
              </span>
            )}
          </div>

          {isTracksLoading && (
            <div className="mt-6 flex min-h-48 flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/[0.03]">
              <LoaderCircle
                className="animate-spin text-violet-400"
                size={32}
              />

              <p className="mt-4 text-sm text-white/50">
                Finding playable songs...
              </p>
            </div>
          )}

          {!isTracksLoading && tracksError && (
            <div
              role="alert"
              className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-400/20 bg-amber-500/10 p-5 text-amber-200"
            >
              <AlertCircle
                className="mt-0.5 shrink-0"
                size={20}
              />

              <div>
                <h3 className="font-semibold">
                  Songs could not be loaded
                </h3>

                <p className="mt-1 text-sm text-amber-200/70">
                  {tracksError}
                </p>
              </div>
            </div>
          )}

          {!isTracksLoading &&
            !tracksError &&
            displayedTracks.length === 0 && (
              <div className="mt-6 flex min-h-48 flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-6 text-center">
                <Disc3
                  className="text-white/30"
                  size={38}
                />

                <h3 className="mt-4 text-lg font-semibold text-white">
                  No playable previews found
                </h3>

                <p className="mt-2 text-sm text-white/50">
                  Try searching for this artist directly
                  on the Discover page.
                </p>
              </div>
            )}

          {!isTracksLoading &&
            !tracksError &&
            displayedTracks.length > 0 && (
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {displayedTracks.map((track) => {
                  const isActive =
                    currentTrack?.id === track.id

                  const isCurrentlyPlaying =
                    isActive && isPlaying

                  return (
                    <article
                      key={track.id}
                      className="group flex min-w-0 items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-3 transition hover:border-violet-400/30 hover:bg-white/[0.07]"
                    >
                      <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-white/10">
                        {track.artworkUrl ? (
                          <img
                            src={track.artworkUrl}
                            alt={`${track.albumTitle} artwork`}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Music2
                              className="text-white/30"
                              size={24}
                            />
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            handlePlayTrack(track)
                          }}
                          disabled={!track.previewUrl}
                          aria-label={
                            isCurrentlyPlaying
                              ? `Pause ${track.title}`
                              : `Play ${track.title}`
                          }
                          className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100 disabled:cursor-not-allowed"
                        >
                          {isCurrentlyPlaying ? (
                            <Pause
                              className="fill-white text-white"
                              size={25}
                            />
                          ) : (
                            <Play
                              className="fill-white text-white"
                              size={25}
                            />
                          )}
                        </button>
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-semibold text-white">
                          {track.title}
                        </h3>

                        <p className="mt-1 truncate text-sm text-white/50">
                          {track.albumTitle}
                        </p>

                        <p className="mt-2 flex items-center gap-1 text-xs text-white/35">
                          <Clock3 size={13} />
                          {formatDuration(
                            track.durationSec,
                          )}
                        </p>
                      </div>

                      {track.externalUrl && (
                        <a
                          href={track.externalUrl}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`Open ${track.title} externally`}
                          className="flex size-10 shrink-0 items-center justify-center rounded-full border border-white/10 text-white/45 transition hover:border-violet-400/30 hover:bg-violet-500/10 hover:text-violet-300"
                        >
                          <ExternalLink size={17} />
                        </a>
                      )}
                    </article>
                  )
                })}
              </div>
            )}
        </section>

        <p className="mt-8 text-xs text-white/25">
          MusicBrainz ID: {artist.id}
        </p>
      </section>
    </main>
  )
}