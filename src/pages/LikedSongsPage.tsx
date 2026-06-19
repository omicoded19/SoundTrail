import { Heart, Play, Trash2 } from 'lucide-react'

import { tracks } from '@/data'
import { usePlayerStore } from '@/features/player/player-store'

export function LikedSongsPage() {
  const likedTrackIds = usePlayerStore(
    (state) => state.likedTrackIds,
  )

  const playTrack = usePlayerStore(
    (state) => state.playTrack,
  )

  const toggleLike = usePlayerStore(
    (state) => state.toggleLike,
  )

  const likedTracks = tracks.filter((track) =>
    likedTrackIds.includes(track.id),
  )

  const handlePlayAll = () => {
    const firstTrack = likedTracks[0]

    if (firstTrack) {
      playTrack(firstTrack, likedTracks)
    }
  }

  return (
    <div className="min-h-screen p-8 pb-32">
      <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-3">
            <Heart className="h-8 w-8 fill-pink-400 text-pink-400" />

            <h1 className="text-5xl font-bold text-white">
              Liked Songs
            </h1>
          </div>

          <p className="mt-3 text-white/60">
            {likedTracks.length} saved tracks
          </p>
        </div>

        <button
          type="button"
          onClick={handlePlayAll}
          disabled={likedTracks.length === 0}
          className="flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-black transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Play className="h-5 w-5 fill-current" />
          Play all
        </button>
      </header>

      {likedTracks.length === 0 ? (
        <section className="mt-12 rounded-3xl border border-dashed border-white/10 p-12 text-center">
          <Heart className="mx-auto h-12 w-12 text-white/20" />

          <h2 className="mt-5 text-xl font-semibold text-white">
            No liked songs yet
          </h2>

          <p className="mt-2 text-sm text-white/50">
            Press the heart button in the player to save a track.
          </p>
        </section>
      ) : (
        <section className="mt-10 overflow-hidden rounded-3xl border border-white/10 bg-white/5">
          {likedTracks.map((track, index) => (
            <div
              key={track.id}
              className="flex items-center gap-4 border-b border-white/10 px-5 py-4 last:border-b-0 hover:bg-white/5"
            >
              <span className="w-6 text-sm text-white/30">
                {index + 1}
              </span>

              <button
                type="button"
                onClick={() => playTrack(track, likedTracks)}
                className="shrink-0"
                aria-label={`Play ${track.title}`}
              >
                <img
                  src={track.artworkUrl}
                  alt={track.albumTitle}
                  className="h-12 w-12 rounded-lg object-cover"
                />
              </button>

              <button
                type="button"
                onClick={() => playTrack(track, likedTracks)}
                className="min-w-0 flex-1 text-left"
              >
                <p className="truncate font-medium text-white">
                  {track.title}
                </p>

                <p className="truncate text-sm text-white/50">
                  {track.artistName}
                </p>
              </button>

              <button
                type="button"
                onClick={() => toggleLike(track.id)}
                aria-label={`Remove ${track.title} from liked songs`}
                className="rounded-lg p-2 text-white/40 transition hover:bg-white/10 hover:text-red-300"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </section>
      )}
    </div>
  )
}