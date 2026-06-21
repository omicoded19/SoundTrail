import {
  useEffect,
  useLayoutEffect,
} from 'react'

import { RouterProvider } from 'react-router-dom'

import { router } from '@/app/routes'
import { useAuthStore } from '@/features/auth/auth-store'

import {
  applyAccentTheme,
  getSavedAccentTheme,
} from '@/features/theme/theme'

export default function App() {
  const restoreSession = useAuthStore(
    (state) => state.restoreSession,
  )

  useLayoutEffect(() => {
    const savedTheme =
      getSavedAccentTheme()

    applyAccentTheme(savedTheme)
  }, [])

  useEffect(() => {
    restoreSession()
  }, [restoreSession])

  return (
    <RouterProvider router={router} />
  )
}