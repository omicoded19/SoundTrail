import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  AlertCircle,
  Disc3,
  ExternalLink,
  Heart,
  LoaderCircle,
  Music2,
  Pause,
  Play,
  Search,
} from 'lucide-react'

import { Link } from 'react-router-dom'

import { usePlayerStore } from '@/features/player/player-store'
import { formatDuration } from '@/lib/format'
import { searchTracks } from '@/services/api'
import type { Track } from '@/types/track'

type ArtistAlbum = {
  id: string
  title: string
  artworkUrl: string
  tracks: Track[]
}

function normalizeArtistName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
}

function splitArtistCredits(name: string) {
  return name
    .split(
      /\s*(?:&|,|feat\.?|featuring|with|\bx\b)\s*/i,
    )
    .map((artist) => artist.trim())
    .filter(Boolean)
}

function getQueueArtistName(
  currentTrack: Track,
  queue: Track[],
) {
  const tracksToCheck =
    queue.length > 0
      ? queue
      : [currentTrack]

  const artistCounts = new Map<
    string,
    {
      name: string
      count: number
      lastSeen: number
    }
  >()

  let position = 0

  for (const track of tracksToCheck) {
    const trackArtists =
      splitArtistCredits(track.artistName)

    for (const artistName of trackArtists) {
      const normalizedName =
        normalizeArtistName(artistName)

      if (!normalizedName) {
        continue
      }

      const existingArtist =
        artistCounts.get(normalizedName)

      if (existingArtist) {
        artistCounts.set(normalizedName, {
          ...existingArtist,
          count: existingArtist.count + 1,
          lastSeen: position,
        })
      } else {
        artistCounts.set(normalizedName, {
          name: artistName,
          count: 1,
          lastSeen: position,
        })
      }

      position += 1
    }
  }

  const rankedArtists = [
    ...artistCounts.values(),
  ].sort((firstArtist, secondArtist) => {
    if (
      secondArtist.count !== firstArtist.count
    ) {
      return (
        secondArtist.count -
        firstArtist.count
      )
    }

    return (
      secondArtist.lastSeen -
      firstArtist.lastSeen
    )
  })

  return (
    rankedArtists[0]?.name ??
    currentTrack.artistName
  )
}

function getUniqueTracks(tracks: Track[]) {
  const uniqueTracks =
    new Map<string, Track>()

  for (const track of tracks) {
    uniqueTracks.set(track.id, track)
  }

  return [...uniqueTracks.values()]
}

export function HomePage() {
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

  const [artistTracks, setArtistTracks] =
    useState<Track[]>([])

  const [isLoading, setIsLoading] =
    useState(false)

  const [error, setError] =
    useState<string | null>(null)

  const exploredArtistName = useMemo(() => {
    if (!currentTrack) {
      return ''
    }

    return getQueueArtistName(
      currentTrack,
      queue,
    )
  }, [currentTrack, queue])

  useEffect(() => {
    if (!exploredArtistName) {
      return
    }

    const controller =
      new AbortController()

    const normalizedExploredArtist =
      normalizeArtistName(
        exploredArtistName,
      )

    async function loadArtistSongs() {
      /*
        Wait until the effect setup completes before
        changing React state.
      */
      await Promise.resolve()

      if (controller.signal.aborted) {
        return
      }

      setArtistTracks([])
      setError(null)
      setIsLoading(true)

      try {
        const results = await searchTracks(
          exploredArtistName,
          controller.signal,
        )

        const matchingTracks = results.filter(
          (track) => {
            const resultArtistName =
              normalizeArtistName(
                track.artistName,
              )

            return resultArtistName.includes(
              normalizedExploredArtist,
            )
          },
        )

        const tracksToDisplay =
          matchingTracks.length > 0
            ? matchingTracks
            : results

        setArtistTracks(
          getUniqueTracks(
            tracksToDisplay,
          ).slice(0, 20),
        )
      } catch (requestError) {
        if (
          requestError instanceof DOMException &&
          requestError.name === 'AbortError'
        ) {
          return
        }

        console.error(
          'Home artist search failed:',
          requestError,
        )

        setArtistTracks([])

        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Could not load more songs from this artist.',
        )
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    void loadArtistSongs()

    return () => {
      controller.abort()
    }
  }, [exploredArtistName])

  const displayedArtistTracks =
    useMemo(() => {
      if (!currentTrack) {
        return artistTracks
      }

      return getUniqueTracks([
        currentTrack,
        ...artistTracks,
      ])
    }, [currentTrack, artistTracks])

  const albums =
    useMemo<ArtistAlbum[]>(() => {
      const albumMap =
        new Map<string, ArtistAlbum>()

      for (
        const track of
        displayedArtistTracks
      ) {
        const albumKey =
          track.albumId ||
          `${track.artistName}-${track.albumTitle}`

        const existingAlbum =
          albumMap.get(albumKey)

        if (existingAlbum) {
          existingAlbum.tracks.push(track)
          continue
        }

        albumMap.set(albumKey, {
          id: albumKey,

          title:
            track.albumTitle ||
            'Unknown album',

          artworkUrl:
            track.artworkUrl,

          tracks: [track],
        })
      }

      return [
        ...albumMap.values(),
      ].slice(0, 8)
    }, [displayedArtistTracks])

  function handlePlayTrack(
    track: Track,
  ) {
    if (!track.previewUrl) {
      return
    }

    if (
      currentTrack?.id === track.id
    ) {
      togglePlay()
      return
    }

    const playableQueue =
      displayedArtistTracks.filter(
        (trackItem) =>
          Boolean(
            trackItem.previewUrl,
          ),
      )

    playTrack(
      track,
      playableQueue,
    )
  }

  function handlePlayAlbum(
    album: ArtistAlbum,
  ) {
    const playableTracks =
      album.tracks.filter((track) =>
        Boolean(track.previewUrl),
      )

    const firstTrack =
      playableTracks[0]

    if (firstTrack) {
      playTrack(
        firstTrack,
        playableTracks,
      )
    }
  }

  if (!currentTrack) {
    return (
      <main className="flex min-h-[calc(100dvh-200px)] items-center justify-center overflow-hidden px-6 py-8 lg:h-[calc(100dvh-96px)] lg:min-h-0">
        <section className="w-full max-w-2xl rounded-3xl border border-white/10 bg-white/[0.04] p-10 text-center shadow-2xl shadow-black/30 backdrop-blur-2xl">
          <div className="mx-auto flex size-20 items-center justify-center rounded-full border border-[var(--accent)] bg-[var(--accent-soft)] shadow-[0_0_30px_var(--accent-glow)]">
            <Music2
              className="text-[var(--accent)]"
              size={36}
            />
          </div>

          <p className="mt-7 text-sm font-medium uppercase tracking-[0.22em] text-[var(--accent)]">
            SoundTrail
          </p>

          <h1 className="mt-3 text-4xl font-bold text-white md:text-5xl">
            Start your music trail
          </h1>

          <p className="mx-auto mt-4 max-w-lg leading-7 text-white/55">
            Search for a real song or artist.
            Once you start playing a preview,
            this page will show that artist,
            their songs and albums.
          </p>

          <Link
            to="/discover"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-6 py-3 font-semibold text-white shadow-[0_0_24px_var(--accent-glow)] transition hover:brightness-110"
          >
            <Search size={19} />
            Discover music
          </Link>
        </section>
      </main>
    )
  }

  const liked =
    isLiked(currentTrack.id)

  const displayedTracks =
    displayedArtistTracks.slice(
      0,
      10,
    )

  return (
    <main className="relative min-h-[calc(100dvh-200px)] overflow-hidden lg:h-[calc(100dvh-96px)] lg:min-h-0">
      <div className="absolute inset-0">
        {currentTrack.artworkUrl && (
          <img
            src={
              currentTrack.artworkUrl
            }
            alt=""
            aria-hidden="true"
            className="h-full w-full scale-110 object-cover opacity-35 blur-3xl"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/75 to-[#101010]" />

        <div className="absolute inset-0 bg-gradient-to-t from-[#101010] via-transparent to-black/30" />

        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-20"
          style={{
            background:
              'radial-gradient(circle at 34% 34%, var(--accent-glow), transparent 34%)',
          }}
        />
      </div>

      <div className="relative z-10 grid min-h-[calc(100dvh-200px)] lg:h-full lg:min-h-0 lg:grid-cols-[minmax(340px,0.9fr)_minmax(500px,1.1fr)]">
        <section className="flex min-h-[520px] items-center justify-center overflow-hidden border-r border-white/10 bg-white/[0.025] p-7 shadow-[18px_0_50px_rgba(0,0,0,0.2)] backdrop-blur-2xl backdrop-saturate-150 md:p-10 lg:h-full lg:min-h-0 lg:p-10 xl:p-12">
          <div className="w-full max-w-xl">
            <div className="aspect-square w-full max-w-sm overflow-hidden rounded-3xl border border-white/15 bg-white/10 shadow-2xl shadow-black/50 xl:max-w-md">
              {currentTrack.artworkUrl ? (
                <img
                  src={
                    currentTrack.artworkUrl
                  }
                  alt={`${currentTrack.albumTitle} artwork`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Music2
                    className="text-white/30"
                    size={70}
                  />
                </div>
              )}
            </div>

            <p className="mt-6 text-xs font-medium uppercase tracking-[0.22em] text-[var(--accent)]">
              Now exploring
            </p>

            <h1 className="mt-2 line-clamp-2 text-4xl font-bold leading-[0.95] text-white xl:text-5xl">
              {exploredArtistName}
            </h1>

            <p className="mt-3 line-clamp-2 text-sm text-white/60">
              {currentTrack.title}

              <span className="mx-2 text-white/25">
                •
              </span>

              {currentTrack.albumTitle}
            </p>

            <div className="mt-5 flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  handlePlayTrack(
                    currentTrack,
                  )
                }}
                disabled={
                  !currentTrack.previewUrl
                }
                aria-label={
                  isPlaying
                    ? `Pause ${currentTrack.title}`
                    : `Play ${currentTrack.title}`
                }
                className="flex size-12 items-center justify-center rounded-full bg-[var(--accent)] text-white shadow-[0_0_24px_var(--accent-glow)] transition hover:scale-105 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPlaying ? (
                  <Pause
                    className="fill-current"
                    size={21}
                  />
                ) : (
                  <Play
                    className="ml-0.5 fill-current"
                    size={21}
                  />
                )}
              </button>

              <button
                type="button"
                onClick={() =>
                  toggleLike()
                }
                aria-label={
                  liked
                    ? `Unlike ${currentTrack.title}`
                    : `Like ${currentTrack.title}`
                }
                className={`flex size-11 items-center justify-center rounded-full border transition ${
                  liked
                    ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)] shadow-[0_0_18px_var(--accent-glow)]'
                    : 'border-white/20 bg-black/20 text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Heart
                  size={19}
                  className={
                    liked
                      ? 'fill-current'
                      : ''
                  }
                />
              </button>

              {currentTrack.externalUrl && (
                <a
                  href={
                    currentTrack.externalUrl
                  }
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Open ${currentTrack.title} externally`}
                  className="flex size-11 items-center justify-center rounded-full border border-white/20 bg-black/20 text-white/70 transition hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
                >
                  <ExternalLink
                    size={18}
                  />
                </a>
              )}
            </div>

            <p className="mt-4 text-xs text-white/35">
              30-second catalogue preview
            </p>
          </div>
        </section>

        <section className="border-t border-white/10 bg-black/30 p-6 shadow-[inset_1px_0_0_rgba(255,255,255,0.08)] backdrop-blur-[30px] backdrop-saturate-150 md:p-9 lg:h-full lg:min-h-0 lg:overflow-y-auto lg:border-l lg:border-t-0 lg:p-9 xl:p-10">
          <div className="mx-auto max-w-3xl">
            <header>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--accent)]">
                Artist overview
              </p>

              <h2 className="mt-2 text-2xl font-bold text-white">
                Popular songs
              </h2>
            </header>

            {isLoading && (
              <div className="flex min-h-48 flex-col items-center justify-center">
                <LoaderCircle
                  className="animate-spin text-[var(--accent)]"
                  size={32}
                />

                <p className="mt-4 text-sm text-white/50">
                  Loading songs by{' '}
                  {exploredArtistName}...
                </p>
              </div>
            )}

            {!isLoading && error && (
              <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-400/20 bg-amber-500/10 p-4 text-amber-200 backdrop-blur-xl">
                <AlertCircle
                  className="mt-0.5 shrink-0"
                  size={19}
                />

                <div>
                  <p className="font-semibold">
                    More songs could not be
                    loaded
                  </p>

                  <p className="mt-1 text-sm text-amber-200/70">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {!isLoading &&
              displayedTracks.length > 0 && (
                <div className="mt-5 divide-y divide-white/10">
                  {displayedTracks.map(
                    (
                      track,
                      index,
                    ) => {
                      const isActive =
                        currentTrack.id ===
                        track.id

                      const isActivePlaying =
                        isActive &&
                        isPlaying

                      return (
                        <article
                          key={track.id}
                          className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 transition ${
                            isActive
                              ? 'bg-[var(--accent-soft)]'
                              : 'hover:bg-white/[0.06]'
                          }`}
                        >
                          <span className="w-5 text-center text-xs tabular-nums text-white/35">
                            {index + 1}
                          </span>

                          <button
                            type="button"
                            onClick={() => {
                              handlePlayTrack(
                                track,
                              )
                            }}
                            disabled={
                              !track.previewUrl
                            }
                            aria-label={
                              isActivePlaying
                                ? `Pause ${track.title}`
                                : `Play ${track.title}`
                            }
                            className="relative size-11 shrink-0 overflow-hidden rounded-lg disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <img
                              src={
                                track.artworkUrl
                              }
                              alt=""
                              className="h-full w-full object-cover"
                            />

                            <span className="absolute inset-0 flex items-center justify-center bg-black/55 opacity-0 transition group-hover:opacity-100">
                              {isActivePlaying ? (
                                <Pause
                                  className="fill-white text-white"
                                  size={17}
                                />
                              ) : (
                                <Play
                                  className="fill-white text-white"
                                  size={17}
                                />
                              )}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              handlePlayTrack(
                                track,
                              )
                            }}
                            disabled={
                              !track.previewUrl
                            }
                            className="min-w-0 flex-1 text-left disabled:cursor-not-allowed"
                          >
                            <p
                              className={`truncate text-sm font-medium ${
                                isActive
                                  ? 'text-[var(--accent)]'
                                  : 'text-white'
                              }`}
                            >
                              {track.title}
                            </p>

                            <p className="mt-0.5 truncate text-xs text-white/45">
                              {
                                track.albumTitle
                              }
                            </p>
                          </button>

                          <span className="shrink-0 text-xs tabular-nums text-white/35">
                            {formatDuration(
                              track.durationSec,
                            )}
                          </span>
                        </article>
                      )
                    },
                  )}
                </div>
              )}

            {!isLoading &&
              displayedTracks.length ===
                0 && (
                <div className="mt-6 rounded-2xl border border-dashed border-white/10 p-8 text-center">
                  <Music2 className="mx-auto text-white/25" />

                  <p className="mt-4 text-sm text-white/50">
                    No additional songs were
                    found.
                  </p>
                </div>
              )}

            <section className="mt-9 pb-5">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--accent)]">
                    Discography
                  </p>

                  <h2 className="mt-2 text-2xl font-bold text-white">
                    Albums
                  </h2>
                </div>

                <span className="text-xs text-white/35">
                  {albums.length} found
                </span>
              </div>

              {albums.length > 0 ? (
                <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {albums.map((album) => (
                    <button
                      key={album.id}
                      type="button"
                      onClick={() => {
                        handlePlayAlbum(
                          album,
                        )
                      }}
                      className="group min-w-0 rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-left shadow-lg shadow-black/15 backdrop-blur-xl transition hover:-translate-y-1 hover:border-[var(--accent)] hover:bg-white/[0.08]"
                    >
                      <div className="aspect-square overflow-hidden rounded-xl bg-white/10">
                        {album.artworkUrl ? (
                          <img
                            src={
                              album.artworkUrl
                            }
                            alt={`${album.title} artwork`}
                            loading="lazy"
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Disc3
                              className="text-white/25"
                              size={32}
                            />
                          </div>
                        )}
                      </div>

                      <p className="mt-3 truncate text-sm font-semibold text-white">
                        {album.title}
                      </p>

                      <p className="mt-1 text-xs text-white/40">
                        {album.tracks.length}{' '}

                        {album.tracks.length ===
                        1
                          ? 'song'
                          : 'songs'}
                      </p>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="mt-5 rounded-2xl border border-dashed border-white/10 p-8 text-center">
                  <Disc3 className="mx-auto text-white/25" />

                  <p className="mt-4 text-sm text-white/50">
                    No album information
                    available.
                  </p>
                </div>
              )}
            </section>
          </div>
        </section>
      </div>
    </main>
  )
}