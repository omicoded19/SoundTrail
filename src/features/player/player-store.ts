import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { Track } from '@/types/track'

export type RepeatMode = 'off' | 'all' | 'one'

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
  isQueueOpen: boolean

  playTrack: (track: Track, queue?: Track[]) => void
  togglePlay: () => void
  pause: () => void
  resume: () => void
  next: () => void
  previous: () => void
  seek: (time: number) => void
  setVolume: (volume: number) => void
  toggleShuffle: () => void
  cycleRepeat: () => void
  toggleLike: (trackId?: string) => void
  isLiked: (trackId: string) => boolean
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

  let nextIndex = currentIndex

  while (nextIndex === currentIndex) {
    nextIndex = Math.floor(Math.random() * queue.length)
  }

  return nextIndex
}

export const usePlayerStore = create<PlayerState>()(
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
      isQueueOpen: false,

      playTrack: (track, queue) => {
        const activeQueue = queue ?? get().queue

        const queueIndex = activeQueue.findIndex(
          (queueTrack) => queueTrack.id === track.id,
        )

        set({
          currentTrack: track,
          queue:
            activeQueue.length > 0
              ? activeQueue
              : [track],
          queueIndex: queueIndex >= 0 ? queueIndex : 0,
          progress: 0,
          isPlaying: true,
        })
      },

      togglePlay: () => {
        const { isPlaying, currentTrack } = get()

        if (!currentTrack) {
          return
        }

        set({
          isPlaying: !isPlaying,
        })
      },

      pause: () => {
        set({
          isPlaying: false,
        })
      },

      resume: () => {
        if (get().currentTrack) {
          set({
            isPlaying: true,
          })
        }
      },

      next: () => {
        const {
          queue,
          queueIndex,
          isShuffle,
          repeatMode,
          currentTrack,
        } = get()

        if (queue.length === 0 || !currentTrack) {
          return
        }

        if (repeatMode === 'one') {
          set({
            progress: 0,
            isPlaying: true,
          })

          return
        }

        let nextIndex: number

        if (isShuffle) {
          nextIndex = pickRandomIndex(queue, queueIndex)
        } else if (queueIndex < queue.length - 1) {
          nextIndex = queueIndex + 1
        } else if (repeatMode === 'all') {
          nextIndex = 0
        } else {
          set({
            isPlaying: false,
          })

          return
        }

        set({
          queueIndex: nextIndex,
          currentTrack: queue[nextIndex],
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

        if (queue.length === 0 || !currentTrack) {
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
          queueIndex: previousIndex,
          currentTrack: queue[previousIndex],
          progress: 0,
          isPlaying: true,
        })
      },

      seek: (time) => {
        const { currentTrack } = get()

        if (!currentTrack) {
          return
        }

        const clampedTime = Math.max(
          0,
          Math.min(time, currentTrack.durationSec),
        )

        set({
          progress: clampedTime,
        })
      },

      setVolume: (volume) => {
        const clampedVolume = Math.max(
          0,
          Math.min(1, volume),
        )

        set({
          volume: clampedVolume,
        })
      },

      toggleShuffle: () => {
        set((state) => ({
          isShuffle: !state.isShuffle,
        }))
      },

      cycleRepeat: () => {
        const repeatModes: RepeatMode[] = [
          'off',
          'all',
          'one',
        ]

        const currentMode = get().repeatMode

        const nextMode =
          repeatModes[
            (repeatModes.indexOf(currentMode) + 1) %
              repeatModes.length
          ]

        set({
          repeatMode: nextMode,
        })
      },

      toggleLike: (trackId) => {
        const id =
          trackId ?? get().currentTrack?.id

        if (!id) {
          return
        }

        set((state) => ({
          likedTrackIds: state.likedTrackIds.includes(id)
            ? state.likedTrackIds.filter(
                (likedId) => likedId !== id,
              )
            : [...state.likedTrackIds, id],
        }))
      },

      isLiked: (trackId) => {
        return get().likedTrackIds.includes(trackId)
      },

      toggleQueue: () => {
        set((state) => ({
          isQueueOpen: !state.isQueueOpen,
        }))
      },

      closeQueue: () => {
        set({
          isQueueOpen: false,
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

        if (!isPlaying || !currentTrack) {
          return
        }

        if (progress >= currentTrack.durationSec) {
          if (repeatMode === 'one') {
            set({
              progress: 0,
            })
          } else {
            next()
          }
        } else {
          set({
            progress: progress + 1,
          })
        }
      },
    }),

    {
      name: 'soundtrail-player',

      // Only these values remain after refreshing the browser.
      partialize: (state) => ({
        likedTrackIds: state.likedTrackIds,
        volume: state.volume,
      }),
    },
  ),
)