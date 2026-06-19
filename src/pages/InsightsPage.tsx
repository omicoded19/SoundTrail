import {
  Clock3,
  Disc3,
  LibraryBig,
  Music2,
  Play,
  Users,
} from 'lucide-react'

import { albums, artists, tracks } from '@/data'
import { usePlayerStore } from '@/features/player/player-store'

/*
  Converts seconds into a readable duration.

  Example:
  243 seconds becomes "4:03".
*/
function formatDuration(durationSec: number) {
  const minutes = Math.floor(durationSec / 60)
  const seconds = durationSec % 60

  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export function InsightsPage() {
  const playTrack = usePlayerStore(
    (state) => state.playTrack,
  )

  /*
    Add the duration of every track together.
  */
  const totalDurationSec = tracks.reduce(
    (total, track) => total + track.durationSec,
    0,
  )

  const totalMinutes = Math.round(totalDurationSec / 60)

  /*
    Create statistics for every artist.

    We count how many tracks belong to that artist
    and calculate their percentage of the catalogue.
  */
  const artistStats = artists.map((artist) => {
    const artistTrackCount = tracks.filter(
      (track) => track.artistId === artist.id,
    ).length

    const percentage =
      tracks.length > 0
        ? Math.round(
            (artistTrackCount / tracks.length) * 100,
          )
        : 0

    return {
      ...artist,
      trackCount: artistTrackCount,
      percentage,
    }
  })

  /*
    We copy tracks before sorting.

    sort() changes the original array, so [...tracks]
    protects the imported data.
  */
  const longestTracks = [...tracks]
    .sort((firstTrack, secondTrack) => {
      return (
        secondTrack.durationSec -
        firstTrack.durationSec
      )
    })
    .slice(0, 5)

  /*
    Sort albums from newest to oldest.
  */
  const newestAlbums = [...albums]
    .sort((firstAlbum, secondAlbum) => {
      return (
        secondAlbum.releaseYear -
        firstAlbum.releaseYear
      )
    })
    .slice(0, 4)

  const statCards = [
    {
      label: 'Artists',
      value: artists.length,
      icon: Users,
    },
    {
      label: 'Albums',
      value: albums.length,
      icon: LibraryBig,
    },
    {
      label: 'Tracks',
      value: tracks.length,
      icon: Music2,
    },
    {
      label: 'Music available',
      value: `${totalMinutes} min`,
      icon: Clock3,
    },
  ]

  return (
    <div className="min-h-screen space-y-10 p-8 pb-32">
      <header>
        <div className="flex items-center gap-3">
          <Disc3 className="h-8 w-8 text-[var(--accent)]" />

          <h1 className="text-5xl font-bold text-white">
            Insights
          </h1>
        </div>

        <p className="mt-3 max-w-2xl text-white/60">
          Explore patterns and statistics from your current
          SoundTrail music catalogue.
        </p>
      </header>

      {/* Main statistics */}
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

      <section className="grid gap-8 xl:grid-cols-2">
        {/* Artist distribution */}
        <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div>
            <h2 className="text-2xl font-semibold text-white">
              Artist distribution
            </h2>

            <p className="mt-1 text-sm text-white/50">
              How the current catalogue is divided between
              artists.
            </p>
          </div>

          <div className="mt-7 space-y-6">
            {artistStats.map((artist) => (
              <div key={artist.id}>
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={artist.portraitUrl}
                      alt={artist.name}
                      className="h-9 w-9 rounded-full object-cover"
                    />

                    <div>
                      <p className="font-medium text-white">
                        {artist.name}
                      </p>

                      <p className="text-xs text-white/40">
                        {artist.trackCount} tracks
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-white/50">
                    {artist.percentage}%
                  </p>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${artist.percentage}%`,
                      backgroundColor:
                        artist.accentColor,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>

        {/* Longest tracks */}
        <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div>
            <h2 className="text-2xl font-semibold text-white">
              Longest tracks
            </h2>

            <p className="mt-1 text-sm text-white/50">
              The longest songs currently available.
            </p>
          </div>

          <div className="mt-6 divide-y divide-white/10">
            {longestTracks.map((track, index) => (
              <button
                key={track.id}
                type="button"
                onClick={() =>
                  playTrack(track, tracks)
                }
                className="flex w-full items-center gap-4 rounded-xl px-2 py-4 text-left transition hover:bg-white/5"
              >
                <span className="w-5 text-sm text-white/30">
                  {index + 1}
                </span>

                <img
                  src={track.artworkUrl}
                  alt={track.albumTitle}
                  className="h-11 w-11 rounded-lg object-cover"
                />

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

                <Play className="h-4 w-4 text-white/40" />
              </button>
            ))}
          </div>
        </article>
      </section>

      {/* New releases */}
      <section>
        <div>
          <h2 className="text-2xl font-semibold text-white">
            Newest releases
          </h2>

          <p className="mt-1 text-sm text-white/50">
            The latest albums in the current catalogue.
          </p>
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {newestAlbums.map((album) => {
            const albumArtist = artists.find(
              (artist) =>
                artist.id === album.artistId,
            )

            return (
              <article
                key={album.id}
                className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition hover:-translate-y-1 hover:bg-white/10"
              >
                <img
                  src={album.coverUrl}
                  alt={album.title}
                  className="aspect-square w-full object-cover"
                />

                <div className="p-4">
                  <h3 className="font-semibold text-white">
                    {album.title}
                  </h3>

                  <p className="mt-1 text-sm text-white/50">
                    {albumArtist?.name}
                  </p>

                  <p className="mt-3 text-xs text-white/30">
                    Released {album.releaseYear}
                  </p>
                </div>
              </article>
            )
          })}
        </div>
      </section>
    </div>
  )
}