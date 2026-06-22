import {
  useEffect,
  useState,
  type FormEvent,
} from 'react'

import {
  Check,
  ListMusic,
  LoaderCircle,
  Plus,
  X,
} from 'lucide-react'

import { usePlaylistStore } from '@/features/playlists/playlist-store'
import type { Track } from '@/types/track'

interface AddToPlaylistDialogProps {
  track: Track | null
  open: boolean
  onClose: () => void
}

export function AddToPlaylistDialog({
  track,
  open,
  onClose,
}: AddToPlaylistDialogProps) {
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

  const addTrackToPlaylist =
    usePlaylistStore(
      (state) =>
        state.addTrackToPlaylist,
    )

  const clearError = usePlaylistStore(
    (state) => state.clearError,
  )

  const [
    showCreateForm,
    setShowCreateForm,
  ] = useState(false)

  const [
    newPlaylistName,
    setNewPlaylistName,
  ] = useState('')

  const [
    newPlaylistDescription,
    setNewPlaylistDescription,
  ] = useState('')

  useEffect(() => {
    if (!open) {
      return
    }

    clearError()
    void loadPlaylists()
  }, [
    open,
    clearError,
    loadPlaylists,
  ])

  useEffect(() => {
    if (!open) {
      return
    }

    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener(
      'keydown',
      handleKeyDown,
    )

    const previousOverflow =
      document.body.style.overflow

    document.body.style.overflow =
      'hidden'

    return () => {
      document.removeEventListener(
        'keydown',
        handleKeyDown,
      )

      document.body.style.overflow =
        previousOverflow
    }
  }, [open, onClose])

  function closeDialog() {
    if (isMutating) {
      return
    }

    clearError()
    setShowCreateForm(false)
    setNewPlaylistName('')
    setNewPlaylistDescription('')
    onClose()
  }

  async function handleAddToPlaylist(
    playlistId: string,
  ) {
    if (!track || isMutating) {
      return
    }

    const added =
      await addTrackToPlaylist(
        playlistId,
        track,
      )

    if (added) {
      closeDialog()
    }
  }

  async function handleCreatePlaylist(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    if (!track || isMutating) {
      return
    }

    const trimmedName =
      newPlaylistName.trim()

    if (!trimmedName) {
      return
    }

    const playlist =
      await createPlaylist({
        name: trimmedName,
        description:
          newPlaylistDescription.trim(),
      })

    if (!playlist) {
      return
    }

    const added =
      await addTrackToPlaylist(
        playlist.id,
        track,
      )

    if (added) {
      closeDialog()
    }
  }

  if (!open || !track) {
    return null
  }

  return (
    <div
      role="presentation"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          closeDialog()
        }
      }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 py-8 backdrop-blur-md"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-to-playlist-title"
        className="flex max-h-[85dvh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-white/15 bg-[#111116] shadow-2xl shadow-black/60"
      >
        <header className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--accent)]">
              Save track
            </p>

            <h2
              id="add-to-playlist-title"
              className="mt-1 text-xl font-bold text-white"
            >
              Add to playlist
            </h2>

            <p className="mt-2 truncate text-sm text-white/45">
              {track.title} —{' '}
              {track.artistName}
            </p>
          </div>

          <button
            type="button"
            onClick={closeDialog}
            disabled={isMutating}
            aria-label="Close add to playlist dialog"
            className="flex size-10 shrink-0 items-center justify-center rounded-full border border-white/10 text-white/50 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <X size={18} />
          </button>
        </header>

        <div className="overflow-y-auto p-5">
          {error && (
            <div
              role="alert"
              className="mb-4 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200"
            >
              {error}
            </div>
          )}

          {isLoading &&
          playlists.length === 0 ? (
            <div className="flex min-h-44 flex-col items-center justify-center">
              <LoaderCircle className="size-8 animate-spin text-[var(--accent)]" />

              <p className="mt-3 text-sm text-white/45">
                Loading playlists...
              </p>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  clearError()

                  setShowCreateForm(
                    (currentValue) =>
                      !currentValue,
                  )
                }}
                className="flex w-full items-center gap-3 rounded-2xl border border-dashed border-[var(--accent)]/50 bg-[var(--accent-soft)] px-4 py-4 text-left text-[var(--accent)] transition hover:border-[var(--accent)] hover:brightness-110"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-[var(--accent)]/40">
                  <Plus size={20} />
                </span>

                <span className="font-semibold">
                  Create new playlist
                </span>
              </button>

              {showCreateForm && (
                <form
                  onSubmit={
                    handleCreatePlaylist
                  }
                  className="mt-4 rounded-2xl border border-white/10 bg-white/[0.035] p-4"
                >
                  <label
                    htmlFor="dialog-playlist-name"
                    className="text-sm font-medium text-white/60"
                  >
                    Playlist name
                  </label>

                  <input
                    id="dialog-playlist-name"
                    type="text"
                    autoFocus
                    value={newPlaylistName}
                    onChange={(event) => {
                      setNewPlaylistName(
                        event.target.value,
                      )
                    }}
                    maxLength={60}
                    placeholder="My playlist"
                    className="mt-2 w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-white outline-none placeholder:text-white/25 focus:border-[var(--accent)]"
                  />

                  <label
                    htmlFor="dialog-playlist-description"
                    className="mt-4 block text-sm font-medium text-white/60"
                  >
                    Description
                  </label>

                  <textarea
                    id="dialog-playlist-description"
                    value={
                      newPlaylistDescription
                    }
                    onChange={(event) => {
                      setNewPlaylistDescription(
                        event.target.value,
                      )
                    }}
                    maxLength={240}
                    rows={2}
                    placeholder="Optional description"
                    className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-white outline-none placeholder:text-white/25 focus:border-[var(--accent)]"
                  />

                  <div className="mt-4 flex gap-3">
                    <button
                      type="submit"
                      disabled={
                        !newPlaylistName.trim() ||
                        isMutating
                      }
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white shadow-[0_0_18px_var(--accent-glow)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {isMutating ? (
                        <LoaderCircle className="size-4 animate-spin" />
                      ) : (
                        <Plus size={16} />
                      )}

                      Create and add
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        clearError()
                        setShowCreateForm(false)
                      }}
                      disabled={isMutating}
                      className="rounded-xl border border-white/10 px-4 py-3 text-sm text-white/60 transition hover:bg-white/10 hover:text-white disabled:opacity-40"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              <div className="mt-5">
                <h3 className="px-1 text-xs font-medium uppercase tracking-[0.16em] text-white/35">
                  Your playlists
                </h3>

                {playlists.length === 0 ? (
                  <div className="mt-3 rounded-2xl border border-dashed border-white/10 px-5 py-8 text-center">
                    <ListMusic className="mx-auto size-8 text-white/20" />

                    <p className="mt-3 text-sm text-white/45">
                      You have no playlists yet.
                    </p>
                  </div>
                ) : (
                  <div className="mt-3 space-y-2">
                    {playlists.map(
                      (playlist) => {
                        const alreadyAdded =
                          playlist.tracks.some(
                            (
                              playlistTrack,
                            ) =>
                              playlistTrack.id ===
                              track.id,
                          )

                        return (
                          <button
                            key={playlist.id}
                            type="button"
                            onClick={() => {
                              void handleAddToPlaylist(
                                playlist.id,
                              )
                            }}
                            disabled={
                              alreadyAdded ||
                              isMutating
                            }
                            className="group flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 text-left transition hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] disabled:cursor-not-allowed disabled:opacity-55"
                          >
                            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/35 group-hover:text-[var(--accent)]">
                              {alreadyAdded ? (
                                <Check size={19} />
                              ) : (
                                <ListMusic
                                  size={19}
                                />
                              )}
                            </span>

                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-semibold text-white">
                                {playlist.name}
                              </span>

                              <span className="mt-1 block text-xs text-white/35">
                                {
                                  playlist.tracks
                                    .length
                                }{' '}
                                {playlist.tracks
                                  .length === 1
                                  ? 'track'
                                  : 'tracks'}
                              </span>
                            </span>

                            <span className="shrink-0 text-xs font-medium text-white/40">
                              {alreadyAdded
                                ? 'Added'
                                : 'Add'}
                            </span>
                          </button>
                        )
                      },
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  )
}