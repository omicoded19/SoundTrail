import {
  useEffect,
  useState,
  type FormEvent,
} from 'react'

import {
  ListMusic,
  Music2,
  Play,
  Plus,
  Trash2,
  X,
} from 'lucide-react'

import { tracks as mockTracks } from '@/data'
import { usePlayerStore } from '@/features/player/player-store'
import type { Track } from '@/types/track'

type Playlist = {
  id: string
  name: string
  tracks: Track[]
}

/*
  This type is used while reading playlists saved
  by both the old and new SoundTrail versions.
*/
type SavedPlaylist = {
  id?: unknown
  name?: unknown
  trackIds?: unknown
  tracks?: unknown
}

const STORAGE_KEY = 'soundtrail-playlists'

/*
  Check whether a value loaded from localStorage
  contains the minimum required Track properties.
*/
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

/*
  Load saved playlists.

  This also converts older playlists that stored only
  track IDs into the new complete-track format.
*/
function loadPlaylists(): Playlist[] {
  const savedPlaylists =
    localStorage.getItem(STORAGE_KEY)

  if (!savedPlaylists) {
    return []
  }

  try {
    const parsedValue: unknown =
      JSON.parse(savedPlaylists)

    if (!Array.isArray(parsedValue)) {
      return []
    }

    return parsedValue
      .map((value): Playlist | null => {
        if (!value || typeof value !== 'object') {
          return null
        }

        const savedPlaylist =
          value as SavedPlaylist

        if (
          typeof savedPlaylist.id !== 'string' ||
          typeof savedPlaylist.name !== 'string'
        ) {
          return null
        }

        /*
          New playlist format.
        */
        if (Array.isArray(savedPlaylist.tracks)) {
          return {
            id: savedPlaylist.id,
            name: savedPlaylist.name,
            tracks:
              savedPlaylist.tracks.filter(isTrack),
          }
        }

        /*
          Old playlist format.

          Older playlists contained only mock track IDs.
        */
        const oldTrackIds = Array.isArray(
          savedPlaylist.trackIds,
        )
          ? savedPlaylist.trackIds.filter(
              (trackId): trackId is string =>
                typeof trackId === 'string',
            )
          : []

        const migratedTracks = oldTrackIds
          .map((trackId) =>
            mockTracks.find(
              (track) => track.id === trackId,
            ),
          )
          .filter(
            (track): track is Track =>
              track !== undefined,
          )

        return {
          id: savedPlaylist.id,
          name: savedPlaylist.name,
          tracks: migratedTracks,
        }
      })
      .filter(
        (playlist): playlist is Playlist =>
          playlist !== null,
      )
  } catch {
    return []
  }
}

/*
  Remove duplicate tracks from a collection.
*/
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

export function PlaylistsPage() {
  const currentTrack = usePlayerStore(
    (state) => state.currentTrack,
  )

  const likedTracks = usePlayerStore(
    (state) => state.likedTracks,
  )

  const playTrack = usePlayerStore(
    (state) => state.playTrack,
  )

  const [playlistName, setPlaylistName] =
    useState('')

  const [
    selectedTrackId,
    setSelectedTrackId,
  ] = useState('')

  const [playlists, setPlaylists] =
    useState<Playlist[]>(loadPlaylists)

  const [
    activePlaylistId,
    setActivePlaylistId,
  ] = useState<string | null>(
    () => playlists[0]?.id ?? null,
  )

  /*
    Save complete playlist data whenever it changes.
  */
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(playlists),
    )
  }, [playlists])

  const activePlaylist = playlists.find(
    (playlist) =>
      playlist.id === activePlaylistId,
  )

  const playlistTracks =
    activePlaylist?.tracks ?? []

  /*
    A song is available for playlists when:

    1. It is currently selected in the player.
    2. It has been added to Liked Songs.
  */
  const personalLibrary = getUniqueTracks([
    ...(currentTrack ? [currentTrack] : []),
    ...likedTracks,
  ])

  /*
    Hide songs already added to the selected playlist.
  */
  const availableTracks = activePlaylist
    ? personalLibrary.filter(
        (track) =>
          !activePlaylist.tracks.some(
            (playlistTrack) =>
              playlistTrack.id === track.id,
          ),
      )
    : []

  /*
    Only playable previews enter the player queue.
  */
  const playablePlaylistTracks =
    playlistTracks.filter(
      (track) => Boolean(track.previewUrl),
    )

  function handleCreatePlaylist(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    const trimmedName = playlistName.trim()

    if (!trimmedName) {
      return
    }

    const newPlaylist: Playlist = {
      id: crypto.randomUUID(),
      name: trimmedName,
      tracks: [],
    }

    setPlaylists((currentPlaylists) => [
      ...currentPlaylists,
      newPlaylist,
    ])

    setActivePlaylistId(newPlaylist.id)
    setPlaylistName('')
    setSelectedTrackId('')
  }

  function handleAddTrack() {
    if (!activePlaylist || !selectedTrackId) {
      return
    }

    const selectedTrack = personalLibrary.find(
      (track) =>
        track.id === selectedTrackId,
    )

    if (!selectedTrack) {
      return
    }

    setPlaylists((currentPlaylists) =>
      currentPlaylists.map((playlist) => {
        if (
          playlist.id !== activePlaylist.id
        ) {
          return playlist
        }

        const alreadyAdded =
          playlist.tracks.some(
            (track) =>
              track.id === selectedTrack.id,
          )

        if (alreadyAdded) {
          return playlist
        }

        return {
          ...playlist,
          tracks: [
            ...playlist.tracks,
            selectedTrack,
          ],
        }
      }),
    )

    setSelectedTrackId('')
  }

  function handleRemoveTrack(trackId: string) {
    if (!activePlaylist) {
      return
    }

    setPlaylists((currentPlaylists) =>
      currentPlaylists.map((playlist) =>
        playlist.id === activePlaylist.id
          ? {
              ...playlist,

              tracks:
                playlist.tracks.filter(
                  (track) =>
                    track.id !== trackId,
                ),
            }
          : playlist,
      ),
    )
  }

  function handleDeletePlaylist() {
    if (!activePlaylist) {
      return
    }

    const remainingPlaylists =
      playlists.filter(
        (playlist) =>
          playlist.id !== activePlaylist.id,
      )

    setPlaylists(remainingPlaylists)

    setActivePlaylistId(
      remainingPlaylists[0]?.id ?? null,
    )

    setSelectedTrackId('')
  }

  function handlePlayPlaylist() {
    const firstTrack =
      playablePlaylistTracks[0]

    if (firstTrack) {
      playTrack(
        firstTrack,
        playablePlaylistTracks,
      )
    }
  }

  function handlePlayTrack(track: Track) {
    if (!track.previewUrl) {
      return
    }

    playTrack(
      track,
      playablePlaylistTracks,
    )
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
          Organise real searched tracks into personal
          collections.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
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
              onChange={(event) => {
                setPlaylistName(
                  event.target.value,
                )
              }}
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
                playlist.id ===
                activePlaylistId

              return (
                <button
                  key={playlist.id}
                  type="button"
                  onClick={() => {
                    setActivePlaylistId(
                      playlist.id,
                    )

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
                    {playlist.tracks.length}
                  </span>
                </button>
              )
            })}
          </div>
        </aside>

        <main>
          {!activePlaylist ? (
            <div className="rounded-3xl border border-dashed border-white/10 p-12 text-center">
              <ListMusic className="mx-auto h-12 w-12 text-white/20" />

              <h2 className="mt-5 text-xl font-semibold text-white">
                No playlists yet
              </h2>

              <p className="mt-2 text-sm text-white/50">
                Create your first playlist using the
                form.
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
                    onClick={
                      handleDeletePlaylist
                    }
                    className="rounded-full border border-white/10 p-3 text-white/50 transition hover:bg-white/10 hover:text-red-300"
                    aria-label="Delete playlist"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>

                  <button
                    type="button"
                    onClick={
                      handlePlayPlaylist
                    }
                    disabled={
                      playablePlaylistTracks.length ===
                      0
                    }
                    className="flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-black transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Play className="h-5 w-5 fill-current" />
                    Play all
                  </button>
                </div>
              </header>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <select
                  value={selectedTrackId}
                  onChange={(event) => {
                    setSelectedTrackId(
                      event.target.value,
                    )
                  }}
                  disabled={
                    availableTracks.length === 0
                  }
                  className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#171717] px-4 py-3 text-white outline-none focus:border-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">
                    {availableTracks.length > 0
                      ? 'Select a liked or current track'
                      : 'Like or play a song first'}
                  </option>

                  {availableTracks.map(
                    (track) => (
                      <option
                        key={track.id}
                        value={track.id}
                      >
                        {track.title} —{' '}
                        {track.artistName}
                      </option>
                    ),
                  )}
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

              {personalLibrary.length === 0 && (
                <p className="mt-3 text-sm text-white/40">
                  Search for a song in Discover,
                  play or like it, and it will become
                  available here.
                </p>
              )}

              {playlistTracks.length === 0 ? (
                <div className="mt-8 rounded-2xl border border-dashed border-white/10 p-10 text-center">
                  <Music2 className="mx-auto h-10 w-10 text-white/20" />

                  <p className="mt-4 text-white/50">
                    This playlist is empty. Add a
                    track above.
                  </p>
                </div>
              ) : (
                <div className="mt-8 divide-y divide-white/10">
                  {playlistTracks.map(
                    (track, index) => {
                      const canPlay =
                        Boolean(
                          track.previewUrl,
                        )

                      return (
                        <div
                          key={track.id}
                          className="flex items-center gap-4 py-4"
                        >
                          <span className="w-5 text-sm text-white/30">
                            {index + 1}
                          </span>

                          <button
                            type="button"
                            onClick={() => {
                              handlePlayTrack(
                                track,
                              )
                            }}
                            disabled={!canPlay}
                            className="shrink-0 disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label={
                              canPlay
                                ? `Play ${track.title}`
                                : `Preview unavailable for ${track.title}`
                            }
                          >
                            <img
                              src={
                                track.artworkUrl
                              }
                              alt={
                                track.albumTitle
                              }
                              className="h-12 w-12 rounded-lg object-cover"
                            />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              handlePlayTrack(
                                track,
                              )
                            }}
                            disabled={!canPlay}
                            className="min-w-0 flex-1 text-left disabled:cursor-not-allowed"
                          >
                            <p className="truncate font-medium text-white">
                              {track.title}
                            </p>

                            <p className="truncate text-sm text-white/50">
                              {
                                track.artistName
                              }
                            </p>

                            <p className="mt-1 text-xs text-white/30">
                              {canPlay
                                ? '30-second preview'
                                : 'Preview unavailable'}
                            </p>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              handleRemoveTrack(
                                track.id,
                              )
                            }}
                            className="rounded-lg p-2 text-white/40 transition hover:bg-white/10 hover:text-red-300"
                            aria-label={`Remove ${track.title}`}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      )
                    },
                  )}
                </div>
              )}
            </section>
          )}
        </main>
      </div>
    </div>
  )
}