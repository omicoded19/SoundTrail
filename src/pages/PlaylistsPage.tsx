import {
  useEffect,
  useState,
  type SubmitEvent,
} from 'react'

import {
  ListMusic,
  Play,
  Plus,
  Trash2,
  X,
} from 'lucide-react'

import { tracks } from '@/data'
import { usePlayerStore } from '@/features/player/player-store'
import type { Track } from '@/types/track'

type Playlist = {
  id: string
  name: string
  trackIds: string[]
}

const STORAGE_KEY = 'soundtrail-playlists'

export function PlaylistsPage() {
  const playTrack = usePlayerStore(
    (state) => state.playTrack,
  )

  const [playlistName, setPlaylistName] = useState('')

  const [selectedTrackId, setSelectedTrackId] =
    useState('')

  /*
    Load saved playlists from localStorage when
    the page first opens.
  */
  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    const savedPlaylists = localStorage.getItem(STORAGE_KEY)

    if (!savedPlaylists) {
      return []
    }

    try {
      const parsedPlaylists = JSON.parse(savedPlaylists)

      return Array.isArray(parsedPlaylists)
        ? parsedPlaylists
        : []
    } catch {
      return []
    }
  })

  /*
    Select the first saved playlist initially.

    If there are no playlists, the value will be null.
  */
  const [activePlaylistId, setActivePlaylistId] = useState<
    string | null
  >(() => playlists[0]?.id ?? null)

  /*
    Save playlists whenever the playlists array changes.
  */
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(playlists),
    )
  }, [playlists])

  /*
    Find the currently selected playlist.
  */
  const activePlaylist = playlists.find(
    (playlist) => playlist.id === activePlaylistId,
  )

  /*
    Convert the selected playlist's track IDs
    into complete track objects.
  */
  const playlistTracks = activePlaylist
    ? activePlaylist.trackIds
        .map((trackId) =>
          tracks.find((track) => track.id === trackId),
        )
        .filter((track): track is Track => Boolean(track))
    : []

  /*
    Hide tracks that are already inside
    the selected playlist.
  */
  const availableTracks = activePlaylist
    ? tracks.filter(
        (track) =>
          !activePlaylist.trackIds.includes(track.id),
      )
    : []

  const handleCreatePlaylist = (
    event: SubmitEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    const trimmedName = playlistName.trim()

    if (!trimmedName) {
      return
    }

    const newPlaylist: Playlist = {
      id: crypto.randomUUID(),
      name: trimmedName,
      trackIds: [],
    }

    setPlaylists((currentPlaylists) => [
      ...currentPlaylists,
      newPlaylist,
    ])

    /*
      Immediately select the newly created playlist.
    */
    setActivePlaylistId(newPlaylist.id)

    setPlaylistName('')
    setSelectedTrackId('')
  }

  const handleAddTrack = () => {
    if (!activePlaylist || !selectedTrackId) {
      return
    }

    setPlaylists((currentPlaylists) =>
      currentPlaylists.map((playlist) =>
        playlist.id === activePlaylist.id
          ? {
              ...playlist,
              trackIds: [
                ...playlist.trackIds,
                selectedTrackId,
              ],
            }
          : playlist,
      ),
    )

    setSelectedTrackId('')
  }

  const handleRemoveTrack = (trackId: string) => {
    if (!activePlaylist) {
      return
    }

    setPlaylists((currentPlaylists) =>
      currentPlaylists.map((playlist) =>
        playlist.id === activePlaylist.id
          ? {
              ...playlist,
              trackIds: playlist.trackIds.filter(
                (id) => id !== trackId,
              ),
            }
          : playlist,
      ),
    )
  }

  const handleDeletePlaylist = () => {
    if (!activePlaylist) {
      return
    }

    /*
      Remove the selected playlist.
    */
    const remainingPlaylists = playlists.filter(
      (playlist) => playlist.id !== activePlaylist.id,
    )

    setPlaylists(remainingPlaylists)

    /*
      Select the first remaining playlist.

      If no playlists remain, select null.
    */
    setActivePlaylistId(
      remainingPlaylists[0]?.id ?? null,
    )

    setSelectedTrackId('')
  }

  const handlePlayPlaylist = () => {
    const firstTrack = playlistTracks[0]

    if (firstTrack) {
      playTrack(firstTrack, playlistTracks)
    }
  }

  return (
    <div className="min-h-screen space-y-10 p-8 pb-32">
      <header>
        <div className="flex items-center gap-3">
          <ListMusic className="h-8 w-8 text-[var(--accent)]" />

          <h1 className="text-5xl font-bold text-white">
            Playlists
          </h1>
        </div>

        <p className="mt-3 text-white/60">
          Organise your favourite tracks into personal
          collections.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
        {/* Playlist sidebar */}
        <aside className="space-y-5">
          <form
            onSubmit={handleCreatePlaylist}
            className="rounded-2xl border border-white/10 bg-white/5 p-5"
          >
            <label
              htmlFor="playlist-name"
              className="text-sm font-medium text-white/70"
            >
              New playlist
            </label>

            <input
              id="playlist-name"
              type="text"
              value={playlistName}
              onChange={(event) =>
                setPlaylistName(event.target.value)
              }
              placeholder="Night Drive"
              className="mt-3 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-[var(--accent)]"
            />

            <button
              type="submit"
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 font-semibold text-black transition hover:bg-white/90"
            >
              <Plus className="h-5 w-5" />
              Create playlist
            </button>
          </form>

          <div className="space-y-2">
            {playlists.map((playlist) => {
              const isActive =
                playlist.id === activePlaylistId

              return (
                <button
                  key={playlist.id}
                  type="button"
                  onClick={() => {
                    setActivePlaylistId(playlist.id)
                    setSelectedTrackId('')
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition ${
                    isActive
                      ? 'bg-white/10 text-white'
                      : 'text-white/60 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span className="truncate font-medium">
                    {playlist.name}
                  </span>

                  <span className="text-xs text-white/30">
                    {playlist.trackIds.length}
                  </span>
                </button>
              )
            })}
          </div>
        </aside>

        {/* Selected playlist */}
        <main>
          {!activePlaylist ? (
            <div className="rounded-3xl border border-dashed border-white/10 p-12 text-center">
              <ListMusic className="mx-auto h-12 w-12 text-white/20" />

              <h2 className="mt-5 text-xl font-semibold text-white">
                No playlists yet
              </h2>

              <p className="mt-2 text-sm text-white/50">
                Create your first playlist using the form.
              </p>
            </div>
          ) : (
            <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                <div>
                  <p className="text-sm uppercase tracking-[0.18em] text-white/40">
                    Playlist
                  </p>

                  <h2 className="mt-2 text-3xl font-bold text-white">
                    {activePlaylist.name}
                  </h2>

                  <p className="mt-1 text-sm text-white/50">
                    {playlistTracks.length} tracks
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleDeletePlaylist}
                    className="rounded-full border border-white/10 p-3 text-white/50 transition hover:bg-white/10 hover:text-red-300"
                    aria-label="Delete playlist"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>

                  <button
                    type="button"
                    onClick={handlePlayPlaylist}
                    disabled={playlistTracks.length === 0}
                    className="flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-black transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Play className="h-5 w-5 fill-current" />
                    Play all
                  </button>
                </div>
              </header>

              {/* Add track */}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <select
                  value={selectedTrackId}
                  onChange={(event) =>
                    setSelectedTrackId(event.target.value)
                  }
                  className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#171717] px-4 py-3 text-white outline-none focus:border-[var(--accent)]"
                >
                  <option value="">Select a track</option>

                  {availableTracks.map((track) => (
                    <option
                      key={track.id}
                      value={track.id}
                    >
                      {track.title} — {track.artistName}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={handleAddTrack}
                  disabled={!selectedTrackId}
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/10 px-5 py-3 font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Plus className="h-5 w-5" />
                  Add track
                </button>
              </div>

              {/* Playlist tracks */}
              {playlistTracks.length === 0 ? (
                <div className="mt-8 rounded-2xl border border-dashed border-white/10 p-10 text-center">
                  <p className="text-white/50">
                    This playlist is empty. Add a track above.
                  </p>
                </div>
              ) : (
                <div className="mt-8 divide-y divide-white/10">
                  {playlistTracks.map((track, index) => (
                    <div
                      key={track.id}
                      className="flex items-center gap-4 py-4"
                    >
                      <span className="w-5 text-sm text-white/30">
                        {index + 1}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          playTrack(track, playlistTracks)
                        }
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
                        onClick={() =>
                          playTrack(track, playlistTracks)
                        }
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
                        onClick={() =>
                          handleRemoveTrack(track.id)
                        }
                        className="rounded-lg p-2 text-white/40 transition hover:bg-white/10 hover:text-red-300"
                        aria-label={`Remove ${track.title}`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </main>
      </div>
    </div>
  )
}