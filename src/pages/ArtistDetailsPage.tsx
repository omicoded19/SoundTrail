import { useEffect, useState } from 'react'
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  ExternalLink,
  LoaderCircle,
  MapPin,
  Mic2,
} from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

interface SoundTrailArtistArea {
  id: string
  name: string
  type: string | null
}

interface SoundTrailArtistGenre {
  id: string | null
  name: string
  count: number
}

interface SoundTrailArtistTag {
  name: string
  count: number
}

interface SoundTrailArtist {
  id: string
  name: string
  sortName: string
  type: string | null
  country: string | null
  disambiguation: string | null
  score: number | null
  area: SoundTrailArtistArea | null
  beginArea: SoundTrailArtistArea | null

  lifeSpan: {
    begin: string | null
    end: string | null
    ended: boolean
  } | null

  genres: SoundTrailArtistGenre[]
  tags: SoundTrailArtistTag[]
  musicBrainzUrl: string
}

interface ArtistDetailsResponse {
  success: boolean
  artist?: SoundTrailArtist
  message?: string
}

function getArtistInitials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
}

export function ArtistDetailsPage() {
  /*
    Reads the artist ID from a URL such as:

    /artist/ed3f4831-e3e0-4dc0-9381-f5649e9df221
  */
  const { artistId } = useParams<{
    artistId: string
  }>()

  const [artist, setArtist] =
    useState<SoundTrailArtist | null>(null)

  const [isLoading, setIsLoading] =
    useState(true)

  const [error, setError] =
    useState<string | null>(null)

  useEffect(() => {
    if (!artistId) {
      setError('No artist ID was provided.')
      setIsLoading(false)
      return
    }

    const controller = new AbortController()

    async function loadArtistDetails() {
      try {
        setIsLoading(true)
        setError(null)

        /*
          ArtistDetailsPage contacts the Express backend.

          The backend then loads the artist information
          from MusicBrainz.
        */
        const response = await fetch(
          `http://localhost:4000/api/artists/${encodeURIComponent(
            artistId,
          )}`,
          {
            signal: controller.signal,
            headers: {
              Accept: 'application/json',
            },
          },
        )

        const data =
          (await response.json()) as ArtistDetailsResponse

        if (!response.ok) {
          throw new Error(
            data.message ??
              `Request failed with status ${response.status}`,
          )
        }

        if (!data.artist) {
          throw new Error(
            'The backend returned no artist information.',
          )
        }

        setArtist(data.artist)
      } catch (requestError) {
        /*
          AbortError is expected when the user leaves
          the page before the request finishes.
        */
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

        setError(
          requestError instanceof Error
            ? requestError.message
            : 'We could not load this artist.',
        )
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    loadArtistDetails()

    return () => {
      controller.abort()
    }
  }, [artistId])

  if (isLoading) {
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
                {error ??
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

  let activeYears = 'Years unavailable'

  if (artist.lifeSpan?.begin) {
    activeYears = `${artist.lifeSpan.begin} – ${
      artist.lifeSpan.ended
        ? artist.lifeSpan.end ?? 'Unknown'
        : 'Present'
    }`
  }

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
                  <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-white/60">
                    <MapPin size={16} />
                    {artistLocation}
                  </div>

                  <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-white/60">
                    <CalendarDays size={16} />
                    {activeYears}
                  </div>

                  <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-white/60">
                    <Mic2 size={16} />
                    {artist.type ?? 'Artist'}
                  </div>
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

              {genres.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {genres.map((genre) => (
                    <span
                      key={genre.id ?? genre.name}
                      className="rounded-full bg-violet-500/10 px-3 py-1.5 text-sm text-violet-300"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-white/40">
                  No genre information available.
                </p>
              )}
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white">
                Tags
              </h2>

              {tags.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag.name}
                      className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm text-white/60"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-white/40">
                  No tags available.
                </p>
              )}
            </div>
          </div>
        </div>

        <p className="mt-5 text-xs text-white/25">
          MusicBrainz ID: {artist.id}
        </p>
      </section>
    </main>
  )
}