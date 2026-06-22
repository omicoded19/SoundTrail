import { create } from 'zustand'

import { useAuthStore } from '@/features/auth/auth-store'

import {
  addTrackToPlaylist as addTrackToPlaylistRequest,
  createPlaylist as createPlaylistRequest,
  deletePlaylist as deletePlaylistRequest,
  getPlaylist as getPlaylistRequest,
  getPlaylists as getPlaylistsRequest,
  removeTrackFromPlaylist as removeTrackFromPlaylistRequest,
  updatePlaylist as updatePlaylistRequest,
  type CreatePlaylistInput,
  type SoundTrailPlaylist,
  type UpdatePlaylistInput,
} from '@/services/playlists-api'

import type { Track } from '@/types/track'

interface PlaylistState {
  playlists: SoundTrailPlaylist[]
  selectedPlaylist:
    | SoundTrailPlaylist
    | null

  isLoading: boolean
  isMutating: boolean
  error: string | null

  loadPlaylists: () => Promise<void>

  loadPlaylist: (
    playlistId: string,
  ) => Promise<
    SoundTrailPlaylist | null
  >

  createPlaylist: (
    input: CreatePlaylistInput,
  ) => Promise<
    SoundTrailPlaylist | null
  >

  updatePlaylist: (
    playlistId: string,
    input: UpdatePlaylistInput,
  ) => Promise<
    SoundTrailPlaylist | null
  >

  deletePlaylist: (
    playlistId: string,
  ) => Promise<boolean>

  addTrackToPlaylist: (
    playlistId: string,
    track: Track,
  ) => Promise<boolean>

  removeTrackFromPlaylist: (
    playlistId: string,
    trackId: string,
  ) => Promise<boolean>

  clearSelectedPlaylist: () => void
  clearPlaylists: () => void
  clearError: () => void
}

function getErrorMessage(
  error: unknown,
  fallback: string,
) {
  return error instanceof Error
    ? error.message
    : fallback
}

export const usePlaylistStore =
  create<PlaylistState>(
    (set, get) => ({
      playlists: [],
      selectedPlaylist: null,
      isLoading: false,
      isMutating: false,
      error: null,

      async loadPlaylists() {
        const token =
          useAuthStore.getState().token

        if (!token) {
          set({
            playlists: [],
            selectedPlaylist: null,
            isLoading: false,
            error: null,
          })

          return
        }

        set({
          isLoading: true,
          error: null,
        })

        try {
          const playlists =
            await getPlaylistsRequest(
              token,
            )

          const currentSelectedId =
            get().selectedPlaylist?.id

          const updatedSelected =
            currentSelectedId
              ? playlists.find(
                  (playlist) =>
                    playlist.id ===
                    currentSelectedId,
                ) ??
                get().selectedPlaylist
              : null

          set({
            playlists,
            selectedPlaylist:
              updatedSelected,
            isLoading: false,
            error: null,
          })
        } catch (error) {
          console.error(
            'Loading playlists failed:',
            error,
          )

          set({
            isLoading: false,
            error: getErrorMessage(
              error,
              'Unable to load playlists.',
            ),
          })
        }
      },

      async loadPlaylist(
        playlistId,
      ) {
        const token =
          useAuthStore.getState().token

        if (!token) {
          set({
            selectedPlaylist: null,
            error:
              'You must be logged in to open a playlist.',
          })

          return null
        }

        set({
          isLoading: true,
          error: null,
        })

        try {
          const playlist =
            await getPlaylistRequest(
              token,
              playlistId,
            )

          set((state) => ({
            selectedPlaylist:
              playlist,

            playlists:
              state.playlists.some(
                (item) =>
                  item.id ===
                  playlist.id,
              )
                ? state.playlists.map(
                    (item) =>
                      item.id ===
                      playlist.id
                        ? playlist
                        : item,
                  )
                : [
                    playlist,
                    ...state.playlists,
                  ],

            isLoading: false,
            error: null,
          }))

          return playlist
        } catch (error) {
          console.error(
            'Loading playlist failed:',
            error,
          )

          set({
            selectedPlaylist: null,
            isLoading: false,
            error: getErrorMessage(
              error,
              'Unable to load the playlist.',
            ),
          })

          return null
        }
      },

      async createPlaylist(input) {
        const token =
          useAuthStore.getState().token

        if (!token) {
          set({
            error:
              'You must be logged in to create a playlist.',
          })

          return null
        }

        set({
          isMutating: true,
          error: null,
        })

        try {
          const playlist =
            await createPlaylistRequest(
              token,
              input,
            )

          set((state) => ({
            playlists: [
              playlist,
              ...state.playlists.filter(
                (item) =>
                  item.id !==
                  playlist.id,
              ),
            ],

            selectedPlaylist:
              playlist,

            isMutating: false,
            error: null,
          }))

          return playlist
        } catch (error) {
          console.error(
            'Creating playlist failed:',
            error,
          )

          set({
            isMutating: false,
            error: getErrorMessage(
              error,
              'Unable to create the playlist.',
            ),
          })

          return null
        }
      },

      async updatePlaylist(
        playlistId,
        input,
      ) {
        const token =
          useAuthStore.getState().token

        if (!token) {
          set({
            error:
              'You must be logged in to update a playlist.',
          })

          return null
        }

        set({
          isMutating: true,
          error: null,
        })

        try {
          const playlist =
            await updatePlaylistRequest(
              token,
              playlistId,
              input,
            )

          set((state) => ({
            playlists:
              state.playlists.map(
                (item) =>
                  item.id ===
                  playlist.id
                    ? playlist
                    : item,
              ),

            selectedPlaylist:
              state.selectedPlaylist
                ?.id === playlist.id
                ? playlist
                : state.selectedPlaylist,

            isMutating: false,
            error: null,
          }))

          return playlist
        } catch (error) {
          console.error(
            'Updating playlist failed:',
            error,
          )

          set({
            isMutating: false,
            error: getErrorMessage(
              error,
              'Unable to update the playlist.',
            ),
          })

          return null
        }
      },

      async deletePlaylist(
        playlistId,
      ) {
        const token =
          useAuthStore.getState().token

        if (!token) {
          set({
            error:
              'You must be logged in to delete a playlist.',
          })

          return false
        }

        set({
          isMutating: true,
          error: null,
        })

        try {
          await deletePlaylistRequest(
            token,
            playlistId,
          )

          set((state) => ({
            playlists:
              state.playlists.filter(
                (playlist) =>
                  playlist.id !==
                  playlistId,
              ),

            selectedPlaylist:
              state.selectedPlaylist
                ?.id === playlistId
                ? null
                : state.selectedPlaylist,

            isMutating: false,
            error: null,
          }))

          return true
        } catch (error) {
          console.error(
            'Deleting playlist failed:',
            error,
          )

          set({
            isMutating: false,
            error: getErrorMessage(
              error,
              'Unable to delete the playlist.',
            ),
          })

          return false
        }
      },

      async addTrackToPlaylist(
        playlistId,
        track,
      ) {
        const token =
          useAuthStore.getState().token

        if (!token) {
          set({
            error:
              'You must be logged in to add songs to a playlist.',
          })

          return false
        }

        set({
          isMutating: true,
          error: null,
        })

        try {
          const playlist =
            await addTrackToPlaylistRequest(
              token,
              playlistId,
              track,
            )

          set((state) => ({
            playlists:
              state.playlists.map(
                (item) =>
                  item.id ===
                  playlist.id
                    ? playlist
                    : item,
              ),

            selectedPlaylist:
              state.selectedPlaylist
                ?.id === playlist.id
                ? playlist
                : state.selectedPlaylist,

            isMutating: false,
            error: null,
          }))

          return true
        } catch (error) {
          console.error(
            'Adding track to playlist failed:',
            error,
          )

          set({
            isMutating: false,
            error: getErrorMessage(
              error,
              'Unable to add the song to the playlist.',
            ),
          })

          return false
        }
      },

      async removeTrackFromPlaylist(
        playlistId,
        trackId,
      ) {
        const token =
          useAuthStore.getState().token

        if (!token) {
          set({
            error:
              'You must be logged in to remove songs from a playlist.',
          })

          return false
        }

        set({
          isMutating: true,
          error: null,
        })

        try {
          const playlist =
            await removeTrackFromPlaylistRequest(
              token,
              playlistId,
              trackId,
            )

          set((state) => ({
            playlists:
              state.playlists.map(
                (item) =>
                  item.id ===
                  playlist.id
                    ? playlist
                    : item,
              ),

            selectedPlaylist:
              state.selectedPlaylist
                ?.id === playlist.id
                ? playlist
                : state.selectedPlaylist,

            isMutating: false,
            error: null,
          }))

          return true
        } catch (error) {
          console.error(
            'Removing track from playlist failed:',
            error,
          )

          set({
            isMutating: false,
            error: getErrorMessage(
              error,
              'Unable to remove the song from the playlist.',
            ),
          })

          return false
        }
      },

      clearSelectedPlaylist() {
        set({
          selectedPlaylist: null,
        })
      },

      clearPlaylists() {
        set({
          playlists: [],
          selectedPlaylist: null,
          isLoading: false,
          isMutating: false,
          error: null,
        })
      },

      clearError() {
        set({
          error: null,
        })
      },
    }),
  )