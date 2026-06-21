import { useMemo } from 'react'

import {
  Clock3,
  Heart,
  ListMusic,
  Music2,
  Play,
  Users,
} from 'lucide-react'

import { Link } from 'react-router-dom'

import { usePlayerStore } from '@/features/player/player-store'
import { formatDuration } from '@/lib/format'

import type { Track } from '@/types/track'

type SavedPlaylist = {
  id: string
  name: string
  tracks: Track[]
}

type ArtistStat = {
  name: string
  trackCount: number
  percentage: number
  artworkUrl: string
}

const PLAYLIST_STORAGE_KEY =
  'soundtrail-playlists'

function isTrack(value: unknown): value is Track {
  if (!value || typeof value !== 'object') {
    return false
  }

  const track = value as Partial<Track>

  return (
    typeof track.id === 'string' &&
    typeof track.title === 'string' &&
    typeof track.artistName === 'string' &&
    typeof track.albumTitle === 'string' &&
    typeof track.artworkUrl === 'string' &&
    typeof track.durationSec === 'number'
  )
}

function loadPlaylists(): SavedPlaylist[] {
  const savedValue = localStorage.getItem(
    PLAYLIST_STORAGE_KEY,
  )

  if (!savedValue) {
    return []
  }

  try {
    const parsedValue: unknown =
      JSON.parse(savedValue)

    if (!Array.isArray(parsedValue)) {
      return []
    }

    return parsedValue
      .map((value): SavedPlaylist | null => {
        if (
          !value ||
          typeof value !== 'object'
        ) {
          return null
        }

        const playlist = value as {
          id?: unknown
          name?: unknown
          tracks?: unknown
        }

        if (
          typeof playlist.id !== 'string' ||
          typeof playlist.name !== 'string'
        ) {
          return null
        }

        const tracks = Array.isArray(
          playlist.tracks,
        )
          ? playlist.tracks.filter(isTrack)
          : []

        return {
          id: playlist.id,
          name: playlist.name,
          tracks,
        }
      })
      .filter(
        (
          playlist,
        ): playlist is SavedPlaylist => {
          return playlist !== null
        },
      )
  } catch {
    return []
  }
}

function getUniqueTracks(
  tracks: Track[],
): Track[] {
  const uniqueTracks =
    new Map<string, Track>()

  for (const track of tracks) {
    uniqueTracks.set(track.id, track)
  }

  return [...uniqueTracks.values()]
}

function splitArtistCredits(
  artistName: string,
): string[] {
  return artistName
    .split(
      /\s*(?:&|,|feat\.?|featuring|with|\bx\b)\s*/i,
    )
    .map((name) => name.trim())
    .filter(Boolean)
}

function createArtistStats(
  tracks: Track[],
): ArtistStat[] {
  const artistMap = new Map<
    string,
    {
      name: string
      trackIds: Set<string>
      artworkUrl: string
    }
  >()

  for (const track of tracks) {
    const artistNames =
      splitArtistCredits(track.artistName)

    for (const artistName of artistNames) {
      const key = artistName.toLowerCase()

      const existingArtist =
        artistMap.get(key)

      if (existingArtist) {
        existingArtist.trackIds.add(track.id)

        if (
          !existingArtist.artworkUrl &&
          track.artworkUrl
        ) {
          existingArtist.artworkUrl =
            track.artworkUrl
        }

        continue
      }

      artistMap.set(key, {
        name: artistName,
        trackIds: new Set([track.id]),
        artworkUrl: track.artworkUrl,
      })
    }
  }

  const artists = [
    ...artistMap.values(),
  ]

  const totalArtistTrackCount =
    artists.reduce((total, artist) => {
      return total + artist.trackIds.size
    }, 0)

  return artists
    .map((artist) => {
      const trackCount =
        artist.trackIds.size

      const percentage =
        totalArtistTrackCount > 0
          ? Math.round(
              (trackCount /
                totalArtistTrackCount) *
                100,
            )
          : 0

      return {
        name: artist.name,
        trackCount,
        percentage,
        artworkUrl: artist.artworkUrl,
      }
    })
    .sort((firstArtist, secondArtist) => {
      return (
        secondArtist.trackCount -
        firstArtist.trackCount
      )
    })
}

function formatLibraryDuration(
  durationSec: number,
): string {
  const totalMinutes = Math.round(
    durationSec / 60,
  )

  if (totalMinutes < 60) {
    return `${totalMinutes} min`
  }

  const hours = Math.floor(
    totalMinutes / 60,
  )

  const minutes = totalMinutes % 60

  return minutes > 0
    ? `${hours}h ${minutes}m`
    : `${hours}h`
}

export function InsightsPage() {
  const likedTracks = usePlayerStore(
    (state) => state.likedTracks,
  )

  const playTrack = usePlayerStore(
    (state) => state.playTrack,
  )

  const playlists = useMemo(
    () => loadPlaylists(),
    [],
  )

  const playlistTracks = useMemo(() => {
    return playlists.flatMap(
      (playlist) => playlist.tracks,
    )
  }, [playlists])

  const libraryTracks = useMemo(() => {
    return getUniqueTracks([
      ...likedTracks,
      ...playlistTracks,
    ])
  }, [likedTracks, playlistTracks])

  const playableLibraryTracks =
    useMemo(() => {
      return libraryTracks.filter(
        (track) =>
          Boolean(track.previewUrl),
      )
    }, [libraryTracks])

  const artistStats = useMemo(() => {
    return createArtistStats(
      libraryTracks,
    ).slice(0, 6)
  }, [libraryTracks])

  const longestTracks = useMemo(() => {
    return [...libraryTracks]
      .sort(
        (firstTrack, secondTrack) => {
          return (
            secondTrack.durationSec -
            firstTrack.durationSec
          )
        },
      )
      .slice(0, 5)
  }, [libraryTracks])

  const totalDurationSec =
    libraryTracks.reduce(
      (total, track) => {
        return total + track.durationSec
      },
      0,
    )

  const uniqueAlbumCount = new Set(
    libraryTracks.map((track) => {
      return (
        track.albumId ||
        `${track.artistName}-${track.albumTitle}`
      )
    }),
  ).size

  const totalPlaylistEntries =
    playlists.reduce(
      (total, playlist) => {
        return (
          total + playlist.tracks.length
        )
      },
      0,
    )

  const statCards = [
    {
      label: 'Liked songs',
      value: likedTracks.length,
      icon: Heart,
    },
    {
      label: 'Playlists',
      value: playlists.length,
      icon: ListMusic,
    },
    {
      label: 'Saved tracks',
      value: libraryTracks.length,
      icon: Music2,
    },
    {
      label: 'Library time',
      value: formatLibraryDuration(
        totalDurationSec,
      ),
      icon: Clock3,
    },
  ]

  function handlePlayTrack(track: Track) {
    if (!track.previewUrl) {
      return
    }

    playTrack(
      track,
      playableLibraryTracks,
    )
  }

  return (
    <main className="min-h-screen space-y-10 p-8 pb-32">
      <header>
        <div className="flex items-center gap-3">
          <Music2 className="h-8 w-8 text-[var(--accent)]" />

          <h1 className="text-5xl font-bold text-white">
            Insights
          </h1>
        </div>

        <p className="mt-3 max-w-2xl text-white/60">
          Statistics generated from your real liked
          songs and playlists.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon

          return (
            <article
              key={stat.label}
              className="rounded-2xl border border-white/10 bg-white/5 p-5"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-white/50">
                  {stat.label}
                </p>

                <Icon className="h-5 w-5 text-[var(--accent)]" />
              </div>

              <p className="mt-5 text-3xl font-bold text-white">
                {stat.value}
              </p>
            </article>
          )
        })}
      </section>

      {libraryTracks.length === 0 ? (
        <section className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-12 text-center">
          <Music2 className="mx-auto h-12 w-12 text-white/20" />

          <h2 className="mt-5 text-xl font-semibold text-white">
            No library data yet
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/50">
            Like songs or add tracks to playlists.
            Your statistics will then appear here.
          </p>

          <Link
            to="/discover"
            className="mt-7 inline-flex items-center rounded-full bg-[var(--accent)] px-6 py-3 font-semibold text-white transition hover:opacity-90"
          >
            Discover music
          </Link>
        </section>
      ) : (
        <>
          <section className="grid gap-8 xl:grid-cols-2">
            <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div>
                <h2 className="text-2xl font-semibold text-white">
                  Top artists
                </h2>

                <p className="mt-1 text-sm text-white/50">
                  Based on your liked songs and
                  playlist tracks.
                </p>
              </div>

              <div className="mt-7 space-y-6">
                {artistStats.map((artist) => (
                  <div key={artist.name}>
                    <div className="mb-2 flex items-center justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        {artist.artworkUrl ? (
                          <img
                            src={artist.artworkUrl}
                            alt=""
                            className="h-10 w-10 shrink-0 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)]">
                            <Users className="h-5 w-5 text-[var(--accent)]" />
                          </div>
                        )}

                        <div className="min-w-0">
                          <p className="truncate font-medium text-white">
                            {artist.name}
                          </p>

                          <p className="text-xs text-white/40">
                            {artist.trackCount}{' '}
                            {artist.trackCount === 1
                              ? 'track'
                              : 'tracks'}
                          </p>
                        </div>
                      </div>

                      <p className="shrink-0 text-sm text-white/50">
                        {artist.percentage}%
                      </p>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-[var(--accent)] transition-all"
                        style={{
                          width: `${artist.percentage}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div>
                <h2 className="text-2xl font-semibold text-white">
                  Longest saved tracks
                </h2>

                <p className="mt-1 text-sm text-white/50">
                  Ranked using catalogue duration.
                </p>
              </div>

              <div className="mt-6 divide-y divide-white/10">
                {longestTracks.map(
                  (track, index) => (
                    <button
                      key={track.id}
                      type="button"
                      onClick={() => {
                        handlePlayTrack(track)
                      }}
                      disabled={!track.previewUrl}
                      className="group flex w-full items-center gap-4 rounded-xl px-2 py-4 text-left transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <span className="w-5 text-sm text-white/30">
                        {index + 1}
                      </span>

                      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg">
                        <img
                          src={track.artworkUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />

                        <div className="absolute inset-0 flex items-center justify-center bg-black/55 opacity-0 transition group-hover:opacity-100">
                          <Play className="h-4 w-4 fill-white text-white" />
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-white">
                          {track.title}
                        </p>

                        <p className="truncate text-sm text-white/50">
                          {track.artistName}
                        </p>
                      </div>

                      <span className="shrink-0 text-sm text-white/40">
                        {formatDuration(
                          track.durationSec,
                        )}
                      </span>
                    </button>
                  ),
                )}
              </div>
            </article>
          </section>

          <section className="grid gap-8 xl:grid-cols-[1fr_1.3fr]">
            <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-2xl font-semibold text-white">
                Library overview
              </h2>

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between rounded-xl bg-black/20 px-4 py-3">
                  <span className="text-white/55">
                    Unique albums
                  </span>

                  <span className="font-semibold text-white">
                    {uniqueAlbumCount}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-black/20 px-4 py-3">
                  <span className="text-white/55">
                    Recognised artists
                  </span>

                  <span className="font-semibold text-white">
                    {artistStats.length}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-black/20 px-4 py-3">
                  <span className="text-white/55">
                    Playlist entries
                  </span>

                  <span className="font-semibold text-white">
                    {totalPlaylistEntries}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-black/20 px-4 py-3">
                  <span className="text-white/55">
                    Playable previews
                  </span>

                  <span className="font-semibold text-white">
                    {
                      playableLibraryTracks.length
                    }
                  </span>
                </div>
              </div>
            </article>

            <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-2xl font-semibold text-white">
                Playlist breakdown
              </h2>

              {playlists.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-white/10 p-8 text-center">
                  <ListMusic className="mx-auto h-10 w-10 text-white/20" />

                  <p className="mt-4 text-sm text-white/50">
                    No playlists have been created.
                  </p>
                </div>
              ) : (
                <div className="mt-6 space-y-3">
                  {playlists.map((playlist) => (
                    <div
                      key={playlist.id}
                      className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-4 py-4"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-white">
                          {playlist.name}
                        </p>

                        <p className="mt-1 text-xs text-white/40">
                          {
                            playlist.tracks.filter(
                              (track) =>
                                Boolean(
                                  track.previewUrl,
                                ),
                            ).length
                          }{' '}
                          playable previews
                        </p>
                      </div>

                      <span className="ml-4 shrink-0 rounded-full bg-[var(--accent-soft)] px-3 py-1 text-sm font-medium text-[var(--accent)]">
                        {playlist.tracks.length}{' '}
                        {playlist.tracks.length === 1
                          ? 'track'
                          : 'tracks'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </article>
          </section>
        </>
      )}
    </main>
  )
}