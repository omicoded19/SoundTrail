import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { useAuthStore } from '@/features/auth/auth-store'

import {
  addLikedSong as addLikedSongRequest,
  getLikedSongs as getLikedSongsRequest,
  removeLikedSong as removeLikedSongRequest,
} from '@/services/liked-songs-api'

import type { Track } from '@/types/track'

export type RepeatMode =
  | 'off'
  | 'all'
  | 'one'

interface PlayerState {
  currentTrack: Track | null
  queue: Track[]
  queueIndex: number
  isPlaying: boolean
  isShuffle: boolean
  repeatMode: RepeatMode
  progress: number
  volume: number

  likedTrackIds: string[]
  likedTracks: Track[]
  isLikedSongsLoading: boolean
  likedSongsError: string | null

  isQueueOpen: boolean

  playTrack: (
    track: Track,
    queue?: Track[],
  ) => void

  togglePlay: () => void
  pause: () => void
  resume: () => void
  next: () => void
  previous: () => void
  seek: (time: number) => void
  setVolume: (volume: number) => void
  toggleShuffle: () => void
  cycleRepeat: () => void

  loadLikedSongs: () => Promise<void>

  toggleLike: (
    track?: Track,
  ) => Promise<void>

  clearLikedSongs: () => void

  isLiked: (
    trackId: string,
  ) => boolean

  toggleQueue: () => void
  closeQueue: () => void
  tickProgress: () => void
}

function pickRandomIndex(
  queue: Track[],
  currentIndex: number,
): number {
  if (queue.length <= 1) {
    return currentIndex
  }

  let nextIndex =
    currentIndex

  while (
    nextIndex === currentIndex
  ) {
    nextIndex = Math.floor(
      Math.random() *
        queue.length,
    )
  }

  return nextIndex
}

function getUniqueTracks(
  tracks: Track[],
): Track[] {
  const trackMap =
    new Map<string, Track>()

  for (const track of tracks) {
    trackMap.set(
      track.id,
      track,
    )
  }

  return [...trackMap.values()]
}

export const usePlayerStore =
  create<PlayerState>()(
    persist(
      (set, get) => ({
        currentTrack: null,
        queue: [],
        queueIndex: -1,
        isPlaying: false,
        isShuffle: false,
        repeatMode: 'off',
        progress: 0,
        volume: 0.75,

        likedTrackIds: [],
        likedTracks: [],
        isLikedSongsLoading: false,
        likedSongsError: null,

        isQueueOpen: false,

        playTrack: (
          track,
          queue,
        ) => {
          const activeQueue =
            queue &&
            queue.length > 0
              ? queue
              : [track]

          const foundIndex =
            activeQueue.findIndex(
              (queueTrack) =>
                queueTrack.id ===
                track.id,
            )

          set({
            currentTrack: track,
            queue:
              activeQueue,
            queueIndex:
              foundIndex >= 0
                ? foundIndex
                : 0,
            progress: 0,
            isPlaying: true,
          })
        },

        togglePlay: () => {
          const {
            isPlaying,
            currentTrack,
          } = get()

          if (!currentTrack) {
            return
          }

          set({
            isPlaying:
              !isPlaying,
          })
        },

        pause: () => {
          set({
            isPlaying: false,
          })
        },

        resume: () => {
          if (
            !get().currentTrack
          ) {
            return
          }

          set({
            isPlaying: true,
          })
        },

        next: () => {
          const {
            queue,
            queueIndex,
            isShuffle,
            repeatMode,
            currentTrack,
          } = get()

          if (
            queue.length === 0 ||
            !currentTrack
          ) {
            return
          }

          if (
            repeatMode === 'one'
          ) {
            set({
              progress: 0,
              isPlaying: true,
            })

            return
          }

          let nextIndex: number

          if (isShuffle) {
            nextIndex =
              pickRandomIndex(
                queue,
                queueIndex,
              )
          } else if (
            queueIndex <
            queue.length - 1
          ) {
            nextIndex =
              queueIndex + 1
          } else if (
            repeatMode === 'all'
          ) {
            nextIndex = 0
          } else {
            set({
              isPlaying: false,
            })

            return
          }

          set({
            queueIndex:
              nextIndex,

            currentTrack:
              queue[nextIndex],

            progress: 0,
            isPlaying: true,
          })
        },

        previous: () => {
          const {
            queue,
            queueIndex,
            progress,
            currentTrack,
          } = get()

          if (
            queue.length === 0 ||
            !currentTrack
          ) {
            return
          }

          if (progress > 3) {
            set({
              progress: 0,
            })

            return
          }

          const previousIndex =
            queueIndex > 0
              ? queueIndex - 1
              : queue.length - 1

          set({
            queueIndex:
              previousIndex,

            currentTrack:
              queue[
                previousIndex
              ],

            progress: 0,
            isPlaying: true,
          })
        },

        seek: (time) => {
          const {
            currentTrack,
          } = get()

          if (!currentTrack) {
            return
          }

          const clampedTime =
            Math.max(
              0,
              Math.min(
                time,
                currentTrack.durationSec,
              ),
            )

          set({
            progress:
              clampedTime,
          })
        },

        setVolume: (
          volume,
        ) => {
          const clampedVolume =
            Math.max(
              0,
              Math.min(
                1,
                volume,
              ),
            )

          set({
            volume:
              clampedVolume,
          })
        },

        toggleShuffle: () => {
          set((state) => ({
            isShuffle:
              !state.isShuffle,
          }))
        },

        cycleRepeat: () => {
          const modes: RepeatMode[] =
            [
              'off',
              'all',
              'one',
            ]

          const currentMode =
            get().repeatMode

          const nextMode =
            modes[
              (modes.indexOf(
                currentMode,
              ) +
                1) %
                modes.length
            ]

          set({
            repeatMode:
              nextMode,
          })
        },

        loadLikedSongs:
          async () => {
            const token =
              useAuthStore.getState()
                .token

            if (!token) {
              set({
                likedTrackIds: [],
                likedTracks: [],
                isLikedSongsLoading:
                  false,
                likedSongsError:
                  null,
              })

              return
            }

            set({
              isLikedSongsLoading:
                true,
              likedSongsError:
                null,
            })

            try {
              const tracks =
                await getLikedSongsRequest(
                  token,
                )

              const uniqueTracks =
                getUniqueTracks(
                  tracks,
                )

              set({
                likedTracks:
                  uniqueTracks,

                likedTrackIds:
                  uniqueTracks.map(
                    (track) =>
                      track.id,
                  ),

                isLikedSongsLoading:
                  false,

                likedSongsError:
                  null,
              })
            } catch (error) {
              console.error(
                'Loading liked songs failed:',
                error,
              )

              set({
                isLikedSongsLoading:
                  false,

                likedSongsError:
                  error instanceof
                  Error
                    ? error.message
                    : 'Unable to load liked songs.',
              })
            }
          },

        toggleLike:
          async (track) => {
            const selectedTrack =
              track ??
              get().currentTrack

            if (!selectedTrack) {
              return
            }

            const {
              likedTrackIds,
              likedTracks,
            } = get()

            const alreadyLiked =
              likedTrackIds.includes(
                selectedTrack.id,
              )

            const previousTrackIds =
              [...likedTrackIds]

            const previousTracks =
              [...likedTracks]

            if (alreadyLiked) {
              set({
                likedTrackIds:
                  likedTrackIds.filter(
                    (trackId) =>
                      trackId !==
                      selectedTrack.id,
                  ),

                likedTracks:
                  likedTracks.filter(
                    (likedTrack) =>
                      likedTrack.id !==
                      selectedTrack.id,
                  ),

                likedSongsError:
                  null,
              })
            } else {
              const nextTracks =
                getUniqueTracks([
                  ...likedTracks,
                  selectedTrack,
                ])

              set({
                likedTracks:
                  nextTracks,

                likedTrackIds:
                  nextTracks.map(
                    (likedTrack) =>
                      likedTrack.id,
                  ),

                likedSongsError:
                  null,
              })
            }

            const token =
              useAuthStore.getState()
                .token

            /*
              Logged-out users can still
              temporarily like songs locally.
              After login, MongoDB becomes
              the source of truth.
            */
            if (!token) {
              return
            }

            try {
              if (alreadyLiked) {
                await removeLikedSongRequest(
                  token,
                  selectedTrack.id,
                )
              } else {
                await addLikedSongRequest(
                  token,
                  selectedTrack,
                )
              }
            } catch (error) {
              console.error(
                'Updating liked song failed:',
                error,
              )

              /*
                Restore the previous state
                when the server request fails.
              */
              set({
                likedTrackIds:
                  previousTrackIds,

                likedTracks:
                  previousTracks,

                likedSongsError:
                  error instanceof
                  Error
                    ? error.message
                    : 'Unable to update liked songs.',
              })
            }
          },

        clearLikedSongs: () => {
          set({
            likedTrackIds: [],
            likedTracks: [],
            isLikedSongsLoading:
              false,
            likedSongsError: null,
          })
        },

        isLiked: (
          trackId,
        ) => {
          return get().likedTrackIds.includes(
            trackId,
          )
        },

        toggleQueue: () => {
          set((state) => ({
            isQueueOpen:
              !state.isQueueOpen,
          }))
        },

        closeQueue: () => {
          set({
            isQueueOpen:
              false,
          })
        },

        tickProgress: () => {
          const {
            isPlaying,
            currentTrack,
            progress,
            repeatMode,
            next,
          } = get()

          if (
            !isPlaying ||
            !currentTrack
          ) {
            return
          }

          if (
            progress >=
            currentTrack.durationSec
          ) {
            if (
              repeatMode ===
              'one'
            ) {
              set({
                progress: 0,
              })
            } else {
              next()
            }

            return
          }

          set({
            progress:
              progress + 1,
          })
        },
      }),

      {
        name:
          'soundtrail-player',

        partialize: (
          state,
        ) => ({
          currentTrack:
            state.currentTrack,

          queue:
            state.queue,

          queueIndex:
            state.queueIndex,

          /*
            Browsers normally prevent
            automatic playback after a
            page refresh.
          */
          isPlaying: false,

          progress: 0,

          isShuffle:
            state.isShuffle,

          repeatMode:
            state.repeatMode,

          likedTrackIds:
            state.likedTrackIds,

          likedTracks:
            state.likedTracks,

          volume:
            state.volume,
        }),
      },
    ),
  )