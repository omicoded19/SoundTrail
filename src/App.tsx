import {
  useEffect,
  useLayoutEffect,
} from 'react'

import { RouterProvider } from 'react-router-dom'

import { router } from '@/app/routes'
import { useAuthStore } from '@/features/auth/auth-store'
import { usePlayerStore } from '@/features/player/player-store'
import { usePlaylistStore } from '@/features/playlists/playlist-store'

import {
  applyAccentTheme,
  getSavedAccentTheme,
} from '@/features/theme/theme'

export default function App() {
  const token = useAuthStore(
    (state) => state.token,
  )

  const restoreSession =
    useAuthStore(
      (state) =>
        state.restoreSession,
    )

  const loadLikedSongs =
    usePlayerStore(
      (state) =>
        state.loadLikedSongs,
    )

  const clearLikedSongs =
    usePlayerStore(
      (state) =>
        state.clearLikedSongs,
    )

  const loadPlaylists =
    usePlaylistStore(
      (state) =>
        state.loadPlaylists,
    )

  const clearPlaylists =
    usePlaylistStore(
      (state) =>
        state.clearPlaylists,
    )

  useLayoutEffect(() => {
    const savedTheme =
      getSavedAccentTheme()

    applyAccentTheme(
      savedTheme,
    )
  }, [])

  useEffect(() => {
    void restoreSession()
  }, [restoreSession])

  useEffect(() => {
    if (token) {
      void loadLikedSongs()
      void loadPlaylists()

      return
    }

    clearLikedSongs()
    clearPlaylists()
  }, [
    token,
    loadLikedSongs,
    clearLikedSongs,
    loadPlaylists,
    clearPlaylists,
  ])

  return (
    <RouterProvider
      router={router}
    />
  )
}