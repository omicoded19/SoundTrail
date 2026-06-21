import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  AlertCircle,
  ArrowLeft,
  Dumbbell,
  Flame,
  Headphones,
  Heart,
  LoaderCircle,
  MapPin,
  Mic2,
  Music2,
  Pause,
  Play,
  Radio,
  Search,
  Sparkles,
  UserRound,
  Waves,
  X,
  type LucideIcon,
} from 'lucide-react'

import {
  Link,
  useSearchParams,
} from 'react-router-dom'

import { usePlayerStore } from '@/features/player/player-store'
import { formatDuration } from '@/lib/format'

import {
  searchArtists,
  searchTracks,
  type SoundTrailArtist,
} from '@/services/api'

import type { Track } from '@/types/track'

type BrowseCategory = {
  title: string
  description: string
  query: string
  icon: LucideIcon
  background: string
}

const browseCategories: BrowseCategory[] = [
  {
    title: 'Bollywood',
    description: 'Popular Hindi soundtracks',
    query: 'Bollywood hits',
    icon: Flame,
    background:
      'linear-gradient(135deg, #db2777 0%, #9d174d 100%)',
  },
  {
    title: 'Indian Pop',
    description: 'Modern Indian favourites',
    query: 'Indian pop',
    icon: Sparkles,
    background:
      'linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)',
  },
  {
    title: 'Punjabi',
    description: 'Punjabi hits and anthems',
    query: 'Punjabi hits',
    icon: Radio,
    background:
      'linear-gradient(135deg, #ea580c 0%, #9a3412 100%)',
  },
  {
    title: 'Chill',
    description: 'Slow down and unwind',
    query: 'chill music',
    icon: Waves,
    background:
      'linear-gradient(135deg, #0891b2 0%, #164e63 100%)',
  },
  {
    title: 'Lo-fi',
    description: 'Beats for focus and study',
    query: 'lofi beats',
    icon: Headphones,
    background:
      'linear-gradient(135deg, #4f46e5 0%, #312e81 100%)',
  },
  {
    title: 'Workout',
    description: 'High-energy motivation',
    query: 'workout music',
    icon: Dumbbell,
    background:
      'linear-gradient(135deg, #dc2626 0%, #7f1d1d 100%)',
  },
  {
    title: 'Indie',
    description: 'Independent discoveries',
    query: 'Indian indie music',
    icon: Mic2,
    background:
      'linear-gradient(135deg, #059669 0%, #064e3b 100%)',
  },
  {
    title: 'Pop',
    description: 'Global pop favourites',
    query: 'pop hits',
    icon: Music2,
    background:
      'linear-gradient(135deg, #0284c7 0%, #0c4a6e 100%)',
  },
]

function getArtistInitials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
}

function getUniqueTracks(
  tracks: Track[],
): Track[] {
  const uniqueTracks =
    new Map<string, Track>()

  for (const track of tracks) {
    if (!uniqueTracks.has(track.id)) {
      uniqueTracks.set(track.id, track)
    }
  }

  return [...uniqueTracks.values()]
}

function isAbortError(error: unknown) {
  return (
    error instanceof DOMException &&
    error.name === 'AbortError'
  )
}

export function DiscoverPage() {
  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams()

  const urlQuery =
    searchParams.get('q') ?? ''

  const currentTrack = usePlayerStore(
    (state) => state.currentTrack,
  )

  const queue = usePlayerStore(
    (state) => state.queue,
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

  const toggleLike = usePlayerStore(
    (state) => state.toggleLike,
  )

  const isLiked = usePlayerStore(
    (state) => state.isLiked,
  )

  const [searchQuery, setSearchQuery] =
    useState(urlQuery)

  const [tracks, setTracks] =
    useState<Track[]>([])

  const [artists, setArtists] = useState<
    SoundTrailArtist[]
  >([])

  const [quickPicks, setQuickPicks] =
    useState<Track[]>([])

  const [isSearching, setIsSearching] =
    useState(false)

  const [
    isQuickPicksLoading,
    setIsQuickPicksLoading,
  ] = useState(true)

  const [searchError, setSearchError] =
    useState<string | null>(null)

  const [quickPicksError, setQuickPicksError] =
    useState<string | null>(null)

  /*
    Synchronise Discover with the URL.

    Pressing browser Back after selecting a category
    removes the query and returns to Start Browsing.
  */
  useEffect(() => {
    setSearchQuery(urlQuery)

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }, [urlQuery])

  useEffect(() => {
    const controller = new AbortController()

    async function loadQuickPicks() {
      setIsQuickPicksLoading(true)
      setQuickPicksError(null)

      try {
        const results =
          await Promise.allSettled([
            searchTracks(
              'Bollywood hits',
              controller.signal,
            ),
            searchTracks(
              'Indian pop',
              controller.signal,
            ),
            searchTracks(
              'chill music',
              controller.signal,
            ),
          ])

        if (controller.signal.aborted) {
          return
        }

        const loadedTracks = results.flatMap(
          (result) => {
            return result.status === 'fulfilled'
              ? result.value
              : []
          },
        )

        const uniqueResults =
          getUniqueTracks(
            loadedTracks.filter((track) =>
              Boolean(track.previewUrl),
            ),
          ).slice(0, 12)

        setQuickPicks(uniqueResults)

        if (uniqueResults.length === 0) {
          setQuickPicksError(
            'No playable recommendations are available right now.',
          )
        }
      } catch (requestError) {
        if (isAbortError(requestError)) {
          return
        }

        console.error(
          'Quick picks request failed:',
          requestError,
        )

        setQuickPicks([])

        setQuickPicksError(
          requestError instanceof Error
            ? requestError.message
            : 'Could not load recommendations.',
        )
      } finally {
        if (!controller.signal.aborted) {
          setIsQuickPicksLoading(false)
        }
      }
    }

    loadQuickPicks()

    return () => {
      controller.abort()
    }
  }, [])

  useEffect(() => {
    const trimmedQuery =
      searchQuery.trim()

    if (trimmedQuery.length < 2) {
      setTracks([])
      setArtists([])
      setSearchError(null)
      setIsSearching(false)

      return
    }

    const controller =
      new AbortController()

    setIsSearching(true)
    setSearchError(null)

    const timeoutId = window.setTimeout(
      async () => {
        try {
          const [
            trackResults,
            artistResults,
          ] = await Promise.all([
            searchTracks(
              trimmedQuery,
              controller.signal,
            ),
            searchArtists(
              trimmedQuery,
              controller.signal,
            ),
          ])

          setTracks(
            trackResults.slice(0, 16),
          )

          setArtists(
            artistResults.slice(0, 9),
          )
        } catch (requestError) {
          if (isAbortError(requestError)) {
            return
          }

          console.error(
            'Discover search failed:',
            requestError,
          )

          setTracks([])
          setArtists([])

          setSearchError(
            requestError instanceof Error
              ? requestError.message
              : 'We could not complete your search.',
          )
        } finally {
          if (!controller.signal.aborted) {
            setIsSearching(false)
          }
        }
      },
      600,
    )

    return () => {
      window.clearTimeout(timeoutId)
      controller.abort()
    }
  }, [searchQuery])

  const recentPlayerTracks = useMemo(() => {
    return getUniqueTracks([
      ...(currentTrack
        ? [currentTrack]
        : []),
      ...queue,
    ]).slice(0, 6)
  }, [currentTrack, queue])

  const hasSearchQuery =
    searchQuery.trim().length >= 2

  function handleSearchChange(
    value: string,
  ) {
    setSearchQuery(value)

    /*
      When the query originally came from a category,
      keep its URL entry updated without adding a new
      browser-history entry for every key press.
    */
    if (searchParams.has('q')) {
      if (value.trim()) {
        setSearchParams(
          {
            q: value,
          },
          {
            replace: true,
          },
        )
      } else {
        setSearchParams(
          {},
          {
            replace: true,
          },
        )
      }
    }
  }

  function handleCategoryClick(
    category: BrowseCategory,
  ) {
    /*
      replace defaults to false, so this creates a real
      history entry. Browser Back returns to /discover.
    */
    setSearchParams({
      q: category.query,
    })

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  function handleBackToBrowse() {
    setSearchQuery('')

    setSearchParams(
      {},
      {
        replace: true,
      },
    )

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  function handlePlayTrack(
    track: Track,
    sourceQueue: Track[],
  ) {
    if (!track.previewUrl) {
      return
    }

    if (currentTrack?.id === track.id) {
      togglePlay()
      return
    }

    const playableQueue =
      sourceQueue.filter((queueTrack) =>
        Boolean(queueTrack.previewUrl),
      )

    playTrack(track, playableQueue)
  }

  return (
    <main className="min-h-screen overflow-x-hidden px-5 py-8 pb-40 md:px-8 lg:px-12">
      <section className="mx-auto max-w-7xl">
        <header>
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-[var(--accent)]">
            Discover
          </p>

          <h1 className="mt-2 text-4xl font-bold text-white md:text-5xl">
            Find your next sound
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55 md:text-base">
            Browse moods and genres, discover real
            artists and play available catalogue
            previews.
          </p>
        </header>

        <div className="sticky top-0 z-20 -mx-3 mt-8 rounded-3xl border border-white/10 bg-black/50 p-3 shadow-2xl shadow-black/30 backdrop-blur-2xl">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-white/40"
              size={21}
            />

            <input
              type="search"
              value={searchQuery}
              onChange={(event) => {
                handleSearchChange(
                  event.target.value,
                )
              }}
              placeholder="Search songs, artists and albums..."
              className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.07] pl-14 pr-14 text-white outline-none transition placeholder:text-white/35 focus:border-[var(--accent)] focus:bg-white/[0.1] focus:ring-4 focus:ring-[var(--accent-soft)]"
            />

            {isSearching ? (
              <LoaderCircle
                className="absolute right-5 top-1/2 -translate-y-1/2 animate-spin text-[var(--accent)]"
                size={21}
              />
            ) : (
              searchQuery.length > 0 && (
                <button
                  type="button"
                  onClick={handleBackToBrowse}
                  aria-label="Clear search"
                  className="absolute right-4 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-white/45 transition hover:bg-white/10 hover:text-white"
                >
                  <X size={18} />
                </button>
              )
            )}
          </div>
        </div>

        {hasSearchQuery ? (
          <SearchResults
            query={searchQuery}
            tracks={tracks}
            artists={artists}
            isLoading={isSearching}
            error={searchError}
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            isLiked={isLiked}
            onPlayTrack={handlePlayTrack}
            onToggleLike={toggleLike}
            onBackToBrowse={
              handleBackToBrowse
            }
          />
        ) : (
          <div className="mt-10 space-y-14">
            <section>
              <SectionHeading
                eyebrow="Explore"
                title="Start browsing"
                description="Choose a category to instantly search its real music catalogue."
              />

              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {browseCategories.map(
                  (category) => {
                    const Icon =
                      category.icon

                    return (
                      <button
                        key={category.title}
                        type="button"
                        onClick={() => {
                          handleCategoryClick(
                            category,
                          )
                        }}
                        className="group relative min-h-44 overflow-hidden rounded-3xl border border-white/10 p-6 text-left shadow-xl shadow-black/20 transition hover:-translate-y-1 hover:border-white/25 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                        style={{
                          background:
                            category.background,
                        }}
                      >
                        <div className="absolute -bottom-8 -right-7 flex size-32 rotate-12 items-center justify-center rounded-3xl border border-white/20 bg-black/15 shadow-2xl backdrop-blur-xl transition duration-300 group-hover:rotate-6 group-hover:scale-110">
                          <Icon
                            className="text-white/85"
                            size={54}
                          />
                        </div>

                        <div className="relative z-10 max-w-[70%]">
                          <h2 className="text-2xl font-bold text-white">
                            {category.title}
                          </h2>

                          <p className="mt-2 text-sm leading-5 text-white/70">
                            {
                              category.description
                            }
                          </p>
                        </div>

                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/20" />
                      </button>
                    )
                  },
                )}
              </div>
            </section>

            <section>
              <SectionHeading
                eyebrow="Made for your trail"
                title="Quick picks"
                description="A changing mix of playable discoveries from across the catalogue."
              />

              {isQuickPicksLoading && (
                <LoadingPanel message="Preparing your quick picks..." />
              )}

              {!isQuickPicksLoading &&
                quickPicksError && (
                  <ErrorPanel
                    title="Quick picks unavailable"
                    message={quickPicksError}
                  />
                )}

              {!isQuickPicksLoading &&
                !quickPicksError &&
                quickPicks.length > 0 && (
                  <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                    {quickPicks.map(
                      (track) => (
                        <TrackCard
                          key={track.id}
                          track={track}
                          queue={quickPicks}
                          currentTrack={
                            currentTrack
                          }
                          isPlaying={isPlaying}
                          liked={isLiked(
                            track.id,
                          )}
                          onPlay={
                            handlePlayTrack
                          }
                          onToggleLike={
                            toggleLike
                          }
                        />
                      ),
                    )}
                  </div>
                )}
            </section>

            {recentPlayerTracks.length > 0 && (
              <section>
                <SectionHeading
                  eyebrow="Continue listening"
                  title="Recently in your player"
                  description="Return to tracks from your current listening trail."
                />

                <div className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.045] shadow-xl shadow-black/20 backdrop-blur-2xl">
                  {recentPlayerTracks.map(
                    (track, index) => {
                      const active =
                        currentTrack?.id ===
                        track.id

                      const activePlaying =
                        active && isPlaying

                      return (
                        <article
                          key={track.id}
                          className={`group flex items-center gap-4 border-b border-white/10 px-4 py-3 transition last:border-b-0 md:px-5 ${
                            active
                              ? 'bg-[var(--accent-soft)]'
                              : 'hover:bg-white/[0.06]'
                          }`}
                        >
                          <span className="w-5 shrink-0 text-center text-sm text-white/30">
                            {index + 1}
                          </span>

                          <button
                            type="button"
                            onClick={() => {
                              handlePlayTrack(
                                track,
                                recentPlayerTracks,
                              )
                            }}
                            className="relative size-14 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/10"
                            aria-label={
                              activePlaying
                                ? `Pause ${track.title}`
                                : `Play ${track.title}`
                            }
                          >
                            {track.artworkUrl ? (
                              <img
                                src={
                                  track.artworkUrl
                                }
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <Music2
                                  className="text-white/30"
                                  size={22}
                                />
                              </div>
                            )}

                            <span className="absolute inset-0 flex items-center justify-center bg-black/55 opacity-0 transition group-hover:opacity-100">
                              {activePlaying ? (
                                <Pause
                                  className="fill-white text-white"
                                  size={20}
                                />
                              ) : (
                                <Play
                                  className="fill-white text-white"
                                  size={20}
                                />
                              )}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              handlePlayTrack(
                                track,
                                recentPlayerTracks,
                              )
                            }}
                            className="min-w-0 flex-1 text-left"
                          >
                            <p
                              className={`truncate font-semibold ${
                                active
                                  ? 'text-[var(--accent)]'
                                  : 'text-white'
                              }`}
                            >
                              {track.title}
                            </p>

                            <p className="mt-1 truncate text-sm text-white/50">
                              {track.artistName}

                              <span className="mx-2 text-white/20">
                                •
                              </span>

                              {track.albumTitle}
                            </p>
                          </button>

                          <span className="hidden shrink-0 text-sm tabular-nums text-white/35 sm:block">
                            {formatDuration(
                              track.durationSec,
                            )}
                          </span>

                          <button
                            type="button"
                            onClick={() => {
                              toggleLike(track)
                            }}
                            aria-label={
                              isLiked(track.id)
                                ? `Unlike ${track.title}`
                                : `Like ${track.title}`
                            }
                            className={`flex size-10 shrink-0 items-center justify-center rounded-full border transition ${
                              isLiked(track.id)
                                ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
                                : 'border-transparent text-white/40 hover:border-white/10 hover:bg-white/10 hover:text-white'
                            }`}
                          >
                            <Heart
                              size={17}
                              className={
                                isLiked(
                                  track.id,
                                )
                                  ? 'fill-current'
                                  : ''
                              }
                            />
                          </button>
                        </article>
                      )
                    },
                  )}
                </div>
              </section>
            )}
          </div>
        )}
      </section>
    </main>
  )
}

interface SearchResultsProps {
  query: string
  tracks: Track[]
  artists: SoundTrailArtist[]
  isLoading: boolean
  error: string | null
  currentTrack: Track | null
  isPlaying: boolean
  isLiked: (trackId: string) => boolean
  onPlayTrack: (
    track: Track,
    queue: Track[],
  ) => void
  onToggleLike: (track: Track) => void
  onBackToBrowse: () => void
}

function SearchResults({
  query,
  tracks,
  artists,
  isLoading,
  error,
  currentTrack,
  isPlaying,
  isLiked,
  onPlayTrack,
  onToggleLike,
  onBackToBrowse,
}: SearchResultsProps) {
  const hasResults =
    tracks.length > 0 ||
    artists.length > 0

  return (
    <div className="mt-8">
      <button
        type="button"
        onClick={onBackToBrowse}
        className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-white/60 transition hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
      >
        <ArrowLeft size={17} />
        Back to browsing
      </button>

      {isLoading && !hasResults && (
        <LoadingPanel
          message={`Searching for “${query.trim()}”...`}
        />
      )}

      {error && (
        <ErrorPanel
          title="Search failed"
          message={error}
        />
      )}

      {!isLoading &&
        !error &&
        !hasResults && (
          <div className="flex min-h-72 flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.03] px-6 text-center backdrop-blur-xl">
            <UserRound
              className="text-white/25"
              size={42}
            />

            <h2 className="mt-5 text-xl font-semibold text-white">
              No results found
            </h2>

            <p className="mt-2 max-w-md text-sm text-white/50">
              Try another song title, artist
              name or genre.
            </p>
          </div>
        )}

      {!error && hasResults && (
        <div className="space-y-14">
          {tracks.length > 0 && (
            <section>
              <SectionHeading
                eyebrow="Songs"
                title={`Results for “${query.trim()}”`}
                description={`${tracks.length} playable catalogue results`}
              />

              <div className="mt-6 grid gap-3 lg:grid-cols-2">
                {tracks.map((track) => {
                  const active =
                    currentTrack?.id ===
                    track.id

                  const activePlaying =
                    active && isPlaying

                  return (
                    <article
                      key={track.id}
                      className={`group flex min-w-0 items-center gap-4 rounded-2xl border p-3 shadow-lg shadow-black/10 backdrop-blur-xl transition ${
                        active
                          ? 'border-[var(--accent)] bg-[var(--accent-soft)]'
                          : 'border-white/10 bg-white/[0.045] hover:border-white/20 hover:bg-white/[0.075]'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          onPlayTrack(
                            track,
                            tracks,
                          )
                        }}
                        className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-white/10"
                        aria-label={
                          activePlaying
                            ? `Pause ${track.title}`
                            : `Play ${track.title}`
                        }
                      >
                        {track.artworkUrl ? (
                          <img
                            src={
                              track.artworkUrl
                            }
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Music2
                              className="text-white/30"
                              size={24}
                            />
                          </div>
                        )}

                        <span className="absolute inset-0 flex items-center justify-center bg-black/55 opacity-0 transition group-hover:opacity-100">
                          {activePlaying ? (
                            <Pause
                              className="fill-white text-white"
                              size={23}
                            />
                          ) : (
                            <Play
                              className="fill-white text-white"
                              size={23}
                            />
                          )}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onPlayTrack(
                            track,
                            tracks,
                          )
                        }}
                        className="min-w-0 flex-1 text-left"
                      >
                        <h3
                          className={`truncate font-semibold ${
                            active
                              ? 'text-[var(--accent)]'
                              : 'text-white'
                          }`}
                        >
                          {track.title}
                        </h3>

                        <p className="mt-1 truncate text-sm text-white/55">
                          {track.artistName}
                        </p>

                        <p className="mt-1 truncate text-xs text-white/35">
                          {track.albumTitle}
                        </p>
                      </button>

                      <div className="flex shrink-0 flex-col items-end gap-2">
                        <span className="text-xs tabular-nums text-white/35">
                          {formatDuration(
                            track.durationSec,
                          )}
                        </span>

                        <button
                          type="button"
                          onClick={() => {
                            onToggleLike(track)
                          }}
                          aria-label={
                            isLiked(track.id)
                              ? `Unlike ${track.title}`
                              : `Like ${track.title}`
                          }
                          className={`flex size-9 items-center justify-center rounded-full border transition ${
                            isLiked(track.id)
                              ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
                              : 'border-transparent text-white/40 hover:border-white/10 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <Heart
                            size={16}
                            className={
                              isLiked(track.id)
                                ? 'fill-current'
                                : ''
                            }
                          />
                        </button>
                      </div>
                    </article>
                  )
                })}
              </div>
            </section>
          )}

          {artists.length > 0 && (
            <section>
              <SectionHeading
                eyebrow="Artists"
                title="Artist profiles"
                description={`${artists.length} matching MusicBrainz profiles`}
              />

              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {artists.map((artist) => {
                  const artistLocation =
                    artist.area?.name ??
                    artist.country ??
                    'Location unavailable'

                  return (
                    <Link
                      key={artist.id}
                      to={`/artist/${artist.id}`}
                      className="group rounded-3xl border border-white/10 bg-white/[0.045] p-5 shadow-xl shadow-black/10 backdrop-blur-xl transition hover:-translate-y-1 hover:border-[var(--accent)] hover:bg-white/[0.075] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex size-14 shrink-0 items-center justify-center rounded-full border border-white/15 bg-[var(--accent-soft)] text-lg font-bold text-[var(--accent)] shadow-[0_0_24px_var(--accent-glow)]">
                          {getArtistInitials(
                            artist.name,
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-lg font-semibold text-white">
                            {artist.name}
                          </h3>

                          <p className="mt-1 text-sm text-white/45">
                            {artist.type ??
                              'Artist'}
                          </p>
                        </div>

                        {typeof artist.score ===
                          'number' && (
                          <span className="shrink-0 rounded-full bg-[var(--accent-soft)] px-2.5 py-1 text-xs font-medium text-[var(--accent)]">
                            {artist.score}%
                          </span>
                        )}
                      </div>

                      <div className="mt-5 flex items-center gap-2 text-sm text-white/50">
                        <MapPin size={16} />

                        <span className="truncate">
                          {artistLocation}
                        </span>
                      </div>

                      {artist.disambiguation && (
                        <p className="mt-3 line-clamp-2 text-sm leading-5 text-white/40">
                          {
                            artist.disambiguation
                          }
                        </p>
                      )}
                    </Link>
                  )
                })}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}

interface TrackCardProps {
  track: Track
  queue: Track[]
  currentTrack: Track | null
  isPlaying: boolean
  liked: boolean
  onPlay: (
    track: Track,
    queue: Track[],
  ) => void
  onToggleLike: (track: Track) => void
}

function TrackCard({
  track,
  queue,
  currentTrack,
  isPlaying,
  liked,
  onPlay,
  onToggleLike,
}: TrackCardProps) {
  const active =
    currentTrack?.id === track.id

  const activePlaying =
    active && isPlaying

  return (
    <article
      className={`group min-w-0 rounded-3xl border p-3 shadow-xl shadow-black/20 backdrop-blur-xl transition hover:-translate-y-1 ${
        active
          ? 'border-[var(--accent)] bg-[var(--accent-soft)]'
          : 'border-white/10 bg-white/[0.045] hover:border-white/20 hover:bg-white/[0.08]'
      }`}
    >
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-white/10">
        {track.artworkUrl ? (
          <img
            src={track.artworkUrl}
            alt={`${track.albumTitle} artwork`}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Music2
              className="text-white/25"
              size={40}
            />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10" />

        <button
          type="button"
          onClick={() => {
            onToggleLike(track)
          }}
          aria-label={
            liked
              ? `Unlike ${track.title}`
              : `Like ${track.title}`
          }
          className={`absolute right-3 top-3 flex size-9 items-center justify-center rounded-full border backdrop-blur-xl transition ${
            liked
              ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
              : 'border-white/15 bg-black/35 text-white/70 hover:bg-black/60 hover:text-white'
          }`}
        >
          <Heart
            size={16}
            className={
              liked ? 'fill-current' : ''
            }
          />
        </button>

        <button
          type="button"
          onClick={() => {
            onPlay(track, queue)
          }}
          aria-label={
            activePlaying
              ? `Pause ${track.title}`
              : `Play ${track.title}`
          }
          className="absolute bottom-3 right-3 flex size-11 translate-y-2 items-center justify-center rounded-full bg-[var(--accent)] text-white opacity-0 shadow-[0_0_24px_var(--accent-glow)] transition group-hover:translate-y-0 group-hover:opacity-100 focus-visible:translate-y-0 focus-visible:opacity-100"
        >
          {activePlaying ? (
            <Pause
              className="fill-current"
              size={19}
            />
          ) : (
            <Play
              className="ml-0.5 fill-current"
              size={19}
            />
          )}
        </button>
      </div>

      <button
        type="button"
        onClick={() => {
          onPlay(track, queue)
        }}
        className="mt-4 block w-full min-w-0 text-left"
      >
        <h3
          className={`truncate font-semibold ${
            active
              ? 'text-[var(--accent)]'
              : 'text-white'
          }`}
        >
          {track.title}
        </h3>

        <p className="mt-1 truncate text-sm text-white/50">
          {track.artistName}
        </p>

        <p className="mt-1 truncate text-xs text-white/30">
          {track.albumTitle}
        </p>
      </button>
    </article>
  )
}

interface SectionHeadingProps {
  eyebrow: string
  title: string
  description: string
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: SectionHeadingProps) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.22em] text-[var(--accent)]">
        {eyebrow}
      </p>

      <h2 className="mt-2 text-2xl font-bold text-white md:text-3xl">
        {title}
      </h2>

      <p className="mt-2 text-sm text-white/45">
        {description}
      </p>
    </div>
  )
}

function LoadingPanel({
  message,
}: {
  message: string
}) {
  return (
    <div className="mt-6 flex min-h-56 flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/[0.035] backdrop-blur-2xl">
      <LoaderCircle
        className="animate-spin text-[var(--accent)]"
        size={34}
      />

      <p className="mt-4 text-sm text-white/50">
        {message}
      </p>
    </div>
  )
}

function ErrorPanel({
  title,
  message,
}: {
  title: string
  message: string
}) {
  return (
    <div
      role="alert"
      className="mt-6 flex items-start gap-3 rounded-3xl border border-red-400/20 bg-red-500/10 p-5 text-red-200 backdrop-blur-xl"
    >
      <AlertCircle
        className="mt-0.5 shrink-0"
        size={20}
      />

      <div>
        <h2 className="font-semibold">
          {title}
        </h2>

        <p className="mt-1 text-sm text-red-200/70">
          {message}
        </p>
      </div>
    </div>
  )
}