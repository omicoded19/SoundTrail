import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from 'react'

import {
  AlertCircle,
  Check,
  Heart,
  ListMusic,
  LoaderCircle,
  Music2,
  Pause,
  Pencil,
  Play,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  X,
} from 'lucide-react'

import { Link } from 'react-router-dom'

import { usePlayerStore } from '@/features/player/player-store'
import { usePlaylistStore } from '@/features/playlists/playlist-store'
import { formatDuration } from '@/lib/format'
import type { Track } from '@/types/track'

function getUniqueTracks(
  tracks: Track[],
): Track[] {
  const trackMap =
    new Map<string, Track>()

  for (const track of tracks) {
    trackMap.set(track.id, track)
  }

  return [...trackMap.values()]
}

export function PlaylistsPage() {
  const currentTrack = usePlayerStore(
    (state) => state.currentTrack,
  )

  const isPlaying = usePlayerStore(
    (state) => state.isPlaying,
  )

  const likedTracks = usePlayerStore(
    (state) => state.likedTracks,
  )

  const playTrack = usePlayerStore(
    (state) => state.playTrack,
  )

  const togglePlay = usePlayerStore(
    (state) => state.togglePlay,
  )

  const playlists = usePlaylistStore(
    (state) => state.playlists,
  )

  const isLoading = usePlaylistStore(
    (state) => state.isLoading,
  )

  const isMutating = usePlaylistStore(
    (state) => state.isMutating,
  )

  const error = usePlaylistStore(
    (state) => state.error,
  )

  const loadPlaylists = usePlaylistStore(
    (state) => state.loadPlaylists,
  )

  const createPlaylist = usePlaylistStore(
    (state) => state.createPlaylist,
  )

  const updatePlaylist = usePlaylistStore(
    (state) => state.updatePlaylist,
  )

  const deletePlaylist = usePlaylistStore(
    (state) => state.deletePlaylist,
  )

  const addTrackToPlaylist =
    usePlaylistStore(
      (state) =>
        state.addTrackToPlaylist,
    )

  const removeTrackFromPlaylist =
    usePlaylistStore(
      (state) =>
        state.removeTrackFromPlaylist,
    )

  const clearError = usePlaylistStore(
    (state) => state.clearError,
  )

  const [
    activePlaylistId,
    setActivePlaylistId,
  ] = useState<string | null>(null)

  const [playlistName, setPlaylistName] =
    useState('')

  const [
    playlistDescription,
    setPlaylistDescription,
  ] = useState('')

  const [
    selectedTrackId,
    setSelectedTrackId,
  ] = useState('')

  const [isEditing, setIsEditing] =
    useState(false)

  const [editName, setEditName] =
    useState('')

  const [
    editDescription,
    setEditDescription,
  ] = useState('')

  useEffect(() => {
    void loadPlaylists()
  }, [loadPlaylists])

  useEffect(() => {
    if (playlists.length === 0) {
      setActivePlaylistId(null)
      return
    }

    const activePlaylistStillExists =
      playlists.some(
        (playlist) =>
          playlist.id ===
          activePlaylistId,
      )

    if (!activePlaylistStillExists) {
      setActivePlaylistId(
        playlists[0].id,
      )
    }
  }, [
    playlists,
    activePlaylistId,
  ])

  const activePlaylist =
    useMemo(
      () =>
        playlists.find(
          (playlist) =>
            playlist.id ===
            activePlaylistId,
        ) ?? null,
      [
        playlists,
        activePlaylistId,
      ],
    )

  const personalLibrary =
    useMemo(
      () =>
        getUniqueTracks([
          ...(currentTrack
            ? [currentTrack]
            : []),
          ...likedTracks,
        ]),
      [
        currentTrack,
        likedTracks,
      ],
    )

  const availableTracks =
    useMemo(() => {
      if (!activePlaylist) {
        return []
      }

      return personalLibrary.filter(
        (track) =>
          !activePlaylist.tracks.some(
            (playlistTrack) =>
              playlistTrack.id ===
              track.id,
          ),
      )
    }, [
      activePlaylist,
      personalLibrary,
    ])

  const playablePlaylistTracks =
    useMemo(
      () =>
        activePlaylist?.tracks.filter(
          (track) =>
            Boolean(track.previewUrl),
        ) ?? [],
      [activePlaylist],
    )

  async function handleCreatePlaylist(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    const trimmedName =
      playlistName.trim()

    if (!trimmedName) {
      return
    }

    const playlist =
      await createPlaylist({
        name: trimmedName,
        description:
          playlistDescription.trim(),
      })

    if (!playlist) {
      return
    }

    setActivePlaylistId(
      playlist.id,
    )

    setPlaylistName('')
    setPlaylistDescription('')
    setSelectedTrackId('')
  }

  function beginEditing() {
    if (!activePlaylist) {
      return
    }

    clearError()

    setEditName(
      activePlaylist.name,
    )

    setEditDescription(
      activePlaylist.description,
    )

    setIsEditing(true)
  }

  function cancelEditing() {
    setIsEditing(false)
    setEditName('')
    setEditDescription('')
  }

  async function handleSavePlaylist() {
    if (!activePlaylist) {
      return
    }

    const trimmedName =
      editName.trim()

    if (!trimmedName) {
      return
    }

    const updatedPlaylist =
      await updatePlaylist(
        activePlaylist.id,
        {
          name: trimmedName,
          description:
            editDescription.trim(),
        },
      )

    if (updatedPlaylist) {
      setIsEditing(false)
    }
  }

  async function handleDeletePlaylist() {
    if (!activePlaylist) {
      return
    }

    const shouldDelete =
      window.confirm(
        `Delete "${activePlaylist.name}"? This cannot be undone.`,
      )

    if (!shouldDelete) {
      return
    }

    const deleted =
      await deletePlaylist(
        activePlaylist.id,
      )

    if (!deleted) {
      return
    }

    const nextPlaylist =
      playlists.find(
        (playlist) =>
          playlist.id !==
          activePlaylist.id,
      )

    setActivePlaylistId(
      nextPlaylist?.id ?? null,
    )

    setSelectedTrackId('')
    setIsEditing(false)
  }

  async function handleAddTrack() {
    if (
      !activePlaylist ||
      !selectedTrackId
    ) {
      return
    }

    const selectedTrack =
      personalLibrary.find(
        (track) =>
          track.id ===
          selectedTrackId,
      )

    if (!selectedTrack) {
      return
    }

    const added =
      await addTrackToPlaylist(
        activePlaylist.id,
        selectedTrack,
      )

    if (added) {
      setSelectedTrackId('')
    }
  }

  async function handleRemoveTrack(
    trackId: string,
  ) {
    if (!activePlaylist) {
      return
    }

    await removeTrackFromPlaylist(
      activePlaylist.id,
      trackId,
    )
  }

  function handlePlayPlaylist() {
    const firstTrack =
      playablePlaylistTracks[0]

    if (!firstTrack) {
      return
    }

    playTrack(
      firstTrack,
      playablePlaylistTracks,
    )
  }

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

    playTrack(
      track,
      playablePlaylistTracks,
    )
  }

  function handleSelectPlaylist(
    playlistId: string,
  ) {
    clearError()

    setActivePlaylistId(
      playlistId,
    )

    setSelectedTrackId('')
    setIsEditing(false)
  }

  function handleRetry() {
    void loadPlaylists()
  }

  return (
    <main className="min-h-screen px-5 py-8 pb-40 md:px-8 lg:px-12">
      <section className="mx-auto max-w-7xl">
        <header>
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-[var(--accent)]">
            Your library
          </p>

          <div className="mt-3 flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl border border-[var(--accent)] bg-[var(--accent-soft)] shadow-[0_0_24px_var(--accent-glow)]">
              <ListMusic className="size-6 text-[var(--accent)]" />
            </div>

            <h1 className="text-4xl font-bold text-white md:text-5xl">
              Playlists
            </h1>
          </div>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/50">
            Create personal collections and save your
            favourite SoundTrail discoveries to your
            account.
          </p>
        </header>

        {error && (
          <div
            role="alert"
            className="mt-7 flex flex-col gap-4 rounded-3xl border border-red-400/20 bg-red-500/10 p-5 text-red-200 sm:flex-row sm:items-center"
          >
            <div className="flex flex-1 items-start gap-3">
              <AlertCircle
                className="mt-0.5 shrink-0"
                size={20}
              />

              <div>
                <h2 className="font-semibold">
                  Playlist action failed
                </h2>

                <p className="mt-1 text-sm text-red-200/70">
                  {error}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRetry}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 rounded-xl border border-red-300/20 bg-red-400/10 px-4 py-2 text-sm font-medium transition hover:bg-red-400/20 disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={
                  isLoading
                    ? 'animate-spin'
                    : ''
                }
              />

              Retry
            </button>
          </div>
        )}

        <div className="mt-9 grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="space-y-5">
            <form
              onSubmit={
                handleCreatePlaylist
              }
              className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/20 backdrop-blur-xl"
            >
              <div className="flex items-center gap-2">
                <Plus
                  className="text-[var(--accent)]"
                  size={19}
                />

                <h2 className="font-semibold text-white">
                  New playlist
                </h2>
              </div>

              <label
                htmlFor="playlist-name"
                className="mt-5 block text-sm font-medium text-white/60"
              >
                Name
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
                maxLength={60}
                placeholder="Night Drive"
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-white/25 focus:border-[var(--accent)]"
              />

              <label
                htmlFor="playlist-description"
                className="mt-4 block text-sm font-medium text-white/60"
              >
                Description
              </label>

              <textarea
                id="playlist-description"
                value={
                  playlistDescription
                }
                onChange={(event) => {
                  setPlaylistDescription(
                    event.target.value,
                  )
                }}
                maxLength={240}
                rows={3}
                placeholder="Songs for late-night coding..."
                className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-white/25 focus:border-[var(--accent)]"
              />

              <button
                type="submit"
                disabled={
                  !playlistName.trim() ||
                  isMutating
                }
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-3 font-semibold text-white shadow-[0_0_20px_var(--accent-glow)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isMutating ? (
                  <LoaderCircle className="size-5 animate-spin" />
                ) : (
                  <Plus className="size-5" />
                )}

                Create playlist
              </button>
            </form>

            <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-3 backdrop-blur-xl">
              <div className="flex items-center justify-between px-3 py-2">
                <h2 className="text-sm font-semibold text-white/70">
                  Your playlists
                </h2>

                <span className="text-xs text-white/35">
                  {playlists.length}
                </span>
              </div>

              {isLoading &&
              playlists.length === 0 ? (
                <div className="flex min-h-32 items-center justify-center">
                  <LoaderCircle className="animate-spin text-[var(--accent)]" />
                </div>
              ) : playlists.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm text-white/40">
                  No playlists created yet.
                </p>
              ) : (
                <div className="space-y-1">
                  {playlists.map(
                    (playlist) => {
                      const isActive =
                        playlist.id ===
                        activePlaylistId

                      return (
                        <button
                          key={playlist.id}
                          type="button"
                          onClick={() => {
                            handleSelectPlaylist(
                              playlist.id,
                            )
                          }}
                          className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${
                            isActive
                              ? 'bg-[var(--accent-soft)] text-white'
                              : 'text-white/55 hover:bg-white/[0.05] hover:text-white'
                          }`}
                        >
                          <div
                            className={`flex size-10 shrink-0 items-center justify-center rounded-xl border ${
                              isActive
                                ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
                                : 'border-white/10 bg-white/[0.04] text-white/35'
                            }`}
                          >
                            <ListMusic size={18} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">
                              {playlist.name}
                            </p>

                            <p className="mt-0.5 text-xs text-white/35">
                              {playlist.tracks.length}{' '}
                              {playlist.tracks.length ===
                              1
                                ? 'track'
                                : 'tracks'}
                            </p>
                          </div>
                        </button>
                      )
                    },
                  )}
                </div>
              )}
            </section>
          </aside>

          <section>
            {!activePlaylist ? (
              <div className="flex min-h-96 flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.025] px-6 text-center">
                <div className="flex size-16 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
                  <ListMusic
                    className="text-white/25"
                    size={30}
                  />
                </div>

                <h2 className="mt-5 text-xl font-semibold text-white">
                  No playlist selected
                </h2>

                <p className="mt-2 max-w-md text-sm leading-6 text-white/45">
                  Create your first playlist using the
                  form and start adding songs.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-xl shadow-black/20 backdrop-blur-xl">
                <header className="border-b border-white/10 p-6 md:p-8">
                  {isEditing ? (
                    <div>
                      <label
                        htmlFor="edit-playlist-name"
                        className="text-sm font-medium text-white/60"
                      >
                        Playlist name
                      </label>

                      <input
                        id="edit-playlist-name"
                        value={editName}
                        onChange={(event) => {
                          setEditName(
                            event.target.value,
                          )
                        }}
                        maxLength={60}
                        className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-xl font-semibold text-white outline-none focus:border-[var(--accent)]"
                      />

                      <label
                        htmlFor="edit-playlist-description"
                        className="mt-4 block text-sm font-medium text-white/60"
                      >
                        Description
                      </label>

                      <textarea
                        id="edit-playlist-description"
                        value={editDescription}
                        onChange={(event) => {
                          setEditDescription(
                            event.target.value,
                          )
                        }}
                        maxLength={240}
                        rows={3}
                        className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-[var(--accent)]"
                      />

                      <div className="mt-4 flex gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            void handleSavePlaylist()
                          }}
                          disabled={
                            !editName.trim() ||
                            isMutating
                          }
                          className="flex items-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
                        >
                          {isMutating ? (
                            <LoaderCircle className="size-4 animate-spin" />
                          ) : (
                            <Save size={16} />
                          )}

                          Save
                        </button>

                        <button
                          type="button"
                          onClick={cancelEditing}
                          disabled={isMutating}
                          className="flex items-center gap-2 rounded-xl border border-white/10 px-5 py-2.5 text-sm font-medium text-white/60 transition hover:bg-white/5 hover:text-white"
                        >
                          <X size={16} />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
                      <div className="min-w-0">
                        <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--accent)]">
                          Playlist
                        </p>

                        <h2 className="mt-2 truncate text-3xl font-bold text-white md:text-4xl">
                          {activePlaylist.name}
                        </h2>

                        {activePlaylist.description && (
                          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/50">
                            {activePlaylist.description}
                          </p>
                        )}

                        <p className="mt-3 text-sm text-white/35">
                          {activePlaylist.tracks.length}{' '}
                          {activePlaylist.tracks.length ===
                          1
                            ? 'track'
                            : 'tracks'}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-3">
                        <button
                          type="button"
                          onClick={beginEditing}
                          disabled={isMutating}
                          aria-label="Edit playlist"
                          className="flex size-11 items-center justify-center rounded-full border border-white/10 text-white/50 transition hover:bg-white/10 hover:text-white disabled:opacity-40"
                        >
                          <Pencil size={18} />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            void handleDeletePlaylist()
                          }}
                          disabled={isMutating}
                          aria-label="Delete playlist"
                          className="flex size-11 items-center justify-center rounded-full border border-white/10 text-white/50 transition hover:border-red-400/20 hover:bg-red-500/10 hover:text-red-300 disabled:opacity-40"
                        >
                          <Trash2 size={18} />
                        </button>

                        <button
                          type="button"
                          onClick={handlePlayPlaylist}
                          disabled={
                            playablePlaylistTracks.length ===
                              0 ||
                            isMutating
                          }
                          className="flex items-center gap-2 rounded-full bg-[var(--accent)] px-6 py-3 font-semibold text-white shadow-[0_0_22px_var(--accent-glow)] transition hover:scale-105 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
                        >
                          <Play
                            className="fill-current"
                            size={18}
                          />

                          Play all
                        </button>
                      </div>
                    </div>
                  )}
                </header>

                <div className="p-5 md:p-7">
                  <div className="rounded-2xl border border-white/10 bg-black/15 p-4">
                    <div className="flex items-center gap-2">
                      <Plus
                        className="text-[var(--accent)]"
                        size={18}
                      />

                      <h3 className="font-semibold text-white">
                        Add from your library
                      </h3>
                    </div>

                    <p className="mt-1 text-xs text-white/40">
                      Current and liked songs appear here.
                    </p>

                    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                      <select
                        value={selectedTrackId}
                        onChange={(event) => {
                          setSelectedTrackId(
                            event.target.value,
                          )
                        }}
                        disabled={
                          availableTracks.length ===
                            0 ||
                          isMutating
                        }
                        className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#171717] px-4 py-3 text-white outline-none focus:border-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="">
                          {availableTracks.length > 0
                            ? 'Select a track'
                            : 'No available tracks'}
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
                        onClick={() => {
                          void handleAddTrack()
                        }}
                        disabled={
                          !selectedTrackId ||
                          isMutating
                        }
                        className="flex items-center justify-center gap-2 rounded-xl border border-white/10 px-5 py-3 font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {isMutating ? (
                          <LoaderCircle className="size-5 animate-spin" />
                        ) : (
                          <Plus className="size-5" />
                        )}

                        Add track
                      </button>
                    </div>

                    {personalLibrary.length === 0 && (
                      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-white/45">
                        <Heart size={16} />

                        <span>
                          Like or play a song first.
                        </span>

                        <Link
                          to="/discover"
                          className="font-medium text-[var(--accent)] hover:underline"
                        >
                          Discover music
                        </Link>
                      </div>
                    )}
                  </div>

                  {activePlaylist.tracks.length ===
                  0 ? (
                    <div className="mt-7 flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 text-center">
                      <Music2
                        className="text-white/20"
                        size={38}
                      />

                      <h3 className="mt-4 font-semibold text-white">
                        This playlist is empty
                      </h3>

                      <p className="mt-2 text-sm text-white/40">
                        Select a song above to add it.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-7 overflow-hidden rounded-2xl border border-white/10">
                      <div className="hidden grid-cols-[40px_56px_minmax(0,1.4fr)_minmax(0,1fr)_90px_44px] items-center gap-4 border-b border-white/10 px-4 py-3 text-xs uppercase tracking-[0.14em] text-white/30 md:grid">
                        <span>#</span>
                        <span />
                        <span>Title</span>
                        <span>Album</span>
                        <span>Duration</span>
                        <span />
                      </div>

                      {activePlaylist.tracks.map(
                        (track, index) => {
                          const canPlay =
                            Boolean(
                              track.previewUrl,
                            )

                          const isActive =
                            currentTrack?.id ===
                            track.id

                          const isActivePlaying =
                            isActive &&
                            isPlaying

                          return (
                            <article
                              key={track.id}
                              className={`group flex items-center gap-4 border-b border-white/10 px-4 py-4 transition last:border-b-0 md:grid md:grid-cols-[40px_56px_minmax(0,1.4fr)_minmax(0,1fr)_90px_44px] ${
                                isActive
                                  ? 'bg-[var(--accent-soft)]'
                                  : 'hover:bg-white/[0.05]'
                              }`}
                            >
                              <span
                                className={`hidden text-sm md:block ${
                                  isActive
                                    ? 'text-[var(--accent)]'
                                    : 'text-white/30'
                                }`}
                              >
                                {isActivePlaying ? (
                                  <Check size={16} />
                                ) : (
                                  index + 1
                                )}
                              </span>

                              <button
                                type="button"
                                onClick={() => {
                                  handlePlayTrack(
                                    track,
                                  )
                                }}
                                disabled={!canPlay}
                                aria-label={
                                  canPlay
                                    ? isActivePlaying
                                      ? `Pause ${track.title}`
                                      : `Play ${track.title}`
                                    : `Preview unavailable for ${track.title}`
                                }
                                className="relative size-12 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {track.artworkUrl ? (
                                  <img
                                    src={
                                      track.artworkUrl
                                    }
                                    alt={`${track.albumTitle} artwork`}
                                    loading="lazy"
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center">
                                    <Music2
                                      className="text-white/25"
                                      size={20}
                                    />
                                  </div>
                                )}

                                {canPlay && (
                                  <span className="absolute inset-0 flex items-center justify-center bg-black/55 opacity-0 transition group-hover:opacity-100">
                                    {isActivePlaying ? (
                                      <Pause
                                        className="fill-white text-white"
                                        size={18}
                                      />
                                    ) : (
                                      <Play
                                        className="fill-white text-white"
                                        size={18}
                                      />
                                    )}
                                  </span>
                                )}
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  handlePlayTrack(
                                    track,
                                  )
                                }}
                                disabled={!canPlay}
                                className="min-w-0 flex-1 text-left disabled:cursor-default"
                              >
                                <p
                                  className={`truncate font-medium ${
                                    isActive
                                      ? 'text-[var(--accent)]'
                                      : 'text-white'
                                  }`}
                                >
                                  {track.title}
                                </p>

                                <p className="mt-1 truncate text-sm text-white/45">
                                  {track.artistName}
                                </p>

                                {!canPlay && (
                                  <p className="mt-1 text-xs text-amber-300/60">
                                    Preview unavailable
                                  </p>
                                )}
                              </button>

                              <p className="hidden truncate text-sm text-white/40 md:block">
                                {track.albumTitle}
                              </p>

                              <span className="hidden text-sm tabular-nums text-white/35 md:block">
                                {formatDuration(
                                  track.durationSec,
                                )}
                              </span>

                              <button
                                type="button"
                                onClick={() => {
                                  void handleRemoveTrack(
                                    track.id,
                                  )
                                }}
                                disabled={isMutating}
                                aria-label={`Remove ${track.title} from playlist`}
                                className="flex size-10 shrink-0 items-center justify-center rounded-full text-white/35 transition hover:bg-red-500/10 hover:text-red-300 disabled:opacity-40"
                              >
                                <Trash2 size={17} />
                              </button>
                            </article>
                          )
                        },
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  )
}