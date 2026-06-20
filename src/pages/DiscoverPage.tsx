import { useEffect, useState } from 'react'
import {
  AlertCircle,
  LoaderCircle,
  MapPin,
  Search,
  UserRound,
} from 'lucide-react'
import { Link } from 'react-router-dom'

/*
  This type matches the cleaned artist object
  returned by our Express backend.
*/
interface SoundTrailArtist {
  id: string
  name: string
  sortName: string
  type: string | null
  country: string | null
  disambiguation: string | null
  score: number | null

  area: {
    id: string
    name: string
    type: string | null
  } | null

  beginArea: {
    id: string
    name: string
    type: string | null
  } | null

  lifeSpan: {
    begin: string | null
    end: string | null
    ended: boolean
  } | null

  genres: {
    id: string | null
    name: string
    count: number
  }[]

  tags: {
    name: string
    count: number
  }[]

  musicBrainzUrl: string
}

/*
  This type matches the response returned by:

  GET /api/search/artists
*/
interface ArtistSearchResponse {
  success: boolean
  query?: string
  count?: number
  artists?: SoundTrailArtist[]
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

export function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const [artists, setArtists] = useState<
    SoundTrailArtist[]
  >([])

  const [isLoading, setIsLoading] =
    useState(false)

  const [error, setError] =
    useState<string | null>(null)

  useEffect(() => {
    const trimmedQuery = searchQuery.trim()

    /*
      Do not search when the query contains
      fewer than two characters.
    */
    if (trimmedQuery.length < 2) {
      setArtists([])
      setError(null)
      setIsLoading(false)
      return
    }

    const controller = new AbortController()

    setIsLoading(true)
    setError(null)

    /*
      Wait for the user to stop typing before
      sending the search request.
    */
    const timeoutId = window.setTimeout(async () => {
      try {
        const parameters = new URLSearchParams({
          q: trimmedQuery,
        })

        /*
          The frontend contacts our Express backend.

          The backend then contacts MusicBrainz.
        */
        const response = await fetch(
          `http://localhost:4000/api/search/artists?${parameters.toString()}`,
          {
            signal: controller.signal,
            headers: {
              Accept: 'application/json',
            },
          },
        )

        const data =
          (await response.json()) as ArtistSearchResponse

        if (!response.ok) {
          throw new Error(
            data.message ??
              `Request failed with status ${response.status}`,
          )
        }

        setArtists(data.artists ?? [])
      } catch (requestError) {
        /*
          AbortError is normal when the query changes
          before an older request finishes.
        */
        if (
          requestError instanceof DOMException &&
          requestError.name === 'AbortError'
        ) {
          return
        }

        console.error(
          'SoundTrail artist search failed:',
          requestError,
        )

        setArtists([])

        setError(
          requestError instanceof Error
            ? requestError.message
            : 'We could not load artists.',
        )
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    }, 1000)

    /*
      Cancel the timer and old request when
      the search query changes.
    */
    return () => {
      window.clearTimeout(timeoutId)
      controller.abort()
    }
  }, [searchQuery])

  const hasSearchQuery =
    searchQuery.trim().length >= 2

  return (
    <main className="min-h-screen px-6 py-10 lg:px-12">
      <section className="mx-auto max-w-6xl">
        <div className="mb-10">
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-violet-400">
            Discover
          </p>

          <h1 className="text-4xl font-bold text-white md:text-5xl">
            Find your next favourite artist
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60 md:text-base">
            Search for artists from around the world
            with SoundTrail.
          </p>
        </div>

        <div className="relative max-w-2xl">
          <Search
            className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-white/40"
            size={21}
          />

          <input
            type="search"
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value)
            }}
            placeholder="Search for Arijit Singh, Coldplay, Adele..."
            className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.06] pl-14 pr-14 text-white outline-none transition placeholder:text-white/30 focus:border-violet-400/60 focus:bg-white/[0.09] focus:ring-4 focus:ring-violet-500/10"
          />

          {isLoading && (
            <LoaderCircle
              className="absolute right-5 top-1/2 -translate-y-1/2 animate-spin text-violet-400"
              size={21}
            />
          )}
        </div>

        <div className="mt-10">
          {!hasSearchQuery && (
            <div className="flex min-h-64 flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-6 text-center">
              <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-violet-500/10">
                <Search
                  className="text-violet-400"
                  size={25}
                />
              </div>

              <h2 className="text-lg font-semibold text-white">
                Search for an artist
              </h2>

              <p className="mt-2 max-w-md text-sm text-white/50">
                Enter at least two characters to start
                exploring real artist results.
              </p>
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-2xl border border-red-400/20 bg-red-500/10 p-5 text-red-200"
            >
              <AlertCircle
                className="mt-0.5 shrink-0"
                size={20}
              />

              <div>
                <h2 className="font-semibold">
                  Artist search failed
                </h2>

                <p className="mt-1 text-sm text-red-200/70">
                  {error}
                </p>
              </div>
            </div>
          )}

          {isLoading &&
            hasSearchQuery &&
            artists.length === 0 &&
            !error && (
              <div className="flex min-h-64 flex-col items-center justify-center">
                <LoaderCircle
                  className="animate-spin text-violet-400"
                  size={34}
                />

                <p className="mt-4 text-sm text-white/50">
                  Searching artists...
                </p>
              </div>
            )}

          {!isLoading &&
            !error &&
            hasSearchQuery &&
            artists.length === 0 && (
              <div className="flex min-h-64 flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/[0.02] px-6 text-center">
                <UserRound
                  className="text-white/30"
                  size={38}
                />

                <h2 className="mt-4 text-lg font-semibold text-white">
                  No artists found
                </h2>

                <p className="mt-2 text-sm text-white/50">
                  Try a different spelling or a more
                  general artist name.
                </p>
              </div>
            )}

          {!error && artists.length > 0 && (
            <>
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">
                  Search results
                </h2>

                <span className="text-sm text-white/40">
                  {artists.length} artists
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {artists.map((artist) => {
                  const artistLocation =
                    artist.area?.name ??
                    artist.country ??
                    'Location unavailable'

                  return (
                    <Link
                      key={artist.id}
                      to={`/artist/${artist.id}`}
                      aria-label={`Open ${artist.name} artist page`}
                      className="group block rounded-2xl border border-white/10 bg-white/[0.04] p-5 outline-none transition hover:-translate-y-1 hover:border-violet-400/30 hover:bg-white/[0.07] focus-visible:border-violet-400 focus-visible:ring-4 focus-visible:ring-violet-500/20"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-lg font-bold text-white shadow-lg shadow-violet-950/30">
                          {getArtistInitials(artist.name)}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="truncate text-lg font-semibold text-white">
                              {artist.name}
                            </h3>

                            {typeof artist.score ===
                              'number' && (
                              <span className="shrink-0 rounded-full bg-violet-500/10 px-2 py-1 text-xs font-medium text-violet-300">
                                {artist.score}%
                              </span>
                            )}
                          </div>

                          <p className="mt-1 text-sm text-white/50">
                            {artist.type ?? 'Artist'}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 flex items-center gap-2 text-sm text-white/50">
                        <MapPin size={16} />

                        <span className="truncate">
                          {artistLocation}
                        </span>
                      </div>

                      {artist.disambiguation && (
                        <p className="mt-3 line-clamp-2 text-sm leading-5 text-white/40">
                          {artist.disambiguation}
                        </p>
                      )}
                    </Link>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  )
}