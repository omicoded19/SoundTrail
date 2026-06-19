import { useEffect, useState } from 'react'
import {
  AlertCircle,
  LoaderCircle,
  MapPin,
  Search,
  UserRound,
} from 'lucide-react'

interface MusicBrainzArtist {
  id: string
  name: string
  type?: string
  country?: string
  disambiguation?: string
  score?: number
  area?: {
    id: string
    name: string
    type?: string
  }
}

interface MusicBrainzResponse {
  artists?: MusicBrainzArtist[]
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
  const [artists, setArtists] = useState<MusicBrainzArtist[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const trimmedQuery = searchQuery.trim()

    // Do not search for an empty or one-character query.
    if (trimmedQuery.length < 2) {
      setArtists([])
      setError(null)
      setIsLoading(false)
      return
    }

    const controller = new AbortController()

    setIsLoading(true)
    setError(null)

    // Wait until the user has stopped typing.
    const timeoutId = window.setTimeout(async () => {
      try {
        const params = new URLSearchParams({
          query: trimmedQuery,
          fmt: 'json',
          limit: '12',
          dismax: 'true',
        })

        const response = await fetch(
          `https://musicbrainz.org/ws/2/artist/?${params.toString()}`,
          {
            signal: controller.signal,
            headers: {
              Accept: 'application/json',
            },
          },
        )

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`)
        }

        const data = (await response.json()) as MusicBrainzResponse

        setArtists(data.artists ?? [])
      } catch (requestError) {
        // Aborting is expected when the user types another character.
        if (
          requestError instanceof DOMException &&
          requestError.name === 'AbortError'
        ) {
          return
        }

        console.error('MusicBrainz search failed:', requestError)

        setArtists([])
        setError('We could not load artists. Please try again.')
      } finally {
        // Avoid updating state after this request has been cancelled.
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    }, 1000)

    // Runs before the Effect executes again and when the page unmounts.
    return () => {
      window.clearTimeout(timeoutId)
      controller.abort()
    }
  }, [searchQuery])

  const hasSearchQuery = searchQuery.trim().length >= 2

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
            Search for artists from around the world using MusicBrainz.
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
            onChange={(event) => setSearchQuery(event.target.value)}
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
                <Search className="text-violet-400" size={25} />
              </div>

              <h2 className="text-lg font-semibold text-white">
                Search for an artist
              </h2>

              <p className="mt-2 max-w-md text-sm text-white/50">
                Enter at least two characters to start exploring real
                MusicBrainz artist results.
              </p>
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-2xl border border-red-400/20 bg-red-500/10 p-5 text-red-200"
            >
              <AlertCircle className="mt-0.5 shrink-0" size={20} />

              <div>
                <h2 className="font-semibold">Artist search failed</h2>
                <p className="mt-1 text-sm text-red-200/70">{error}</p>
              </div>
            </div>
          )}

          {isLoading && hasSearchQuery && artists.length === 0 && !error && (
            <div className="flex min-h-64 flex-col items-center justify-center">
              <LoaderCircle
                className="animate-spin text-violet-400"
                size={34}
              />

              <p className="mt-4 text-sm text-white/50">
                Searching MusicBrainz...
              </p>
            </div>
          )}

          {!isLoading &&
            !error &&
            hasSearchQuery &&
            artists.length === 0 && (
              <div className="flex min-h-64 flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/[0.02] px-6 text-center">
                <UserRound className="text-white/30" size={38} />

                <h2 className="mt-4 text-lg font-semibold text-white">
                  No artists found
                </h2>

                <p className="mt-2 text-sm text-white/50">
                  Try a different spelling or a more general artist name.
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
                  const location =
                    artist.area?.name ??
                    artist.country ??
                    'Location unavailable'

                  return (
                    <article
                      key={artist.id}
                      className="group rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:-translate-y-1 hover:border-violet-400/30 hover:bg-white/[0.07]"
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

                            {typeof artist.score === 'number' && (
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
                        <span className="truncate">{location}</span>
                      </div>

                      {artist.disambiguation && (
                        <p className="mt-3 line-clamp-2 text-sm leading-5 text-white/40">
                          {artist.disambiguation}
                        </p>
                      )}
                    </article>
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