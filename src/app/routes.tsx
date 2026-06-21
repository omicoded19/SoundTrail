import { createBrowserRouter } from 'react-router-dom'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AppShell } from '@/components/layout/AppShell'

import { ArtistDetailsPage } from '@/pages/ArtistDetailsPage'
import { DiscoverPage } from '@/pages/DiscoverPage'
import { HomePage } from '@/pages/HomePage'
import { InsightsPage } from '@/pages/InsightsPage'
import { JournalPage } from '@/pages/JournalPage'
import { LikedSongsPage } from '@/pages/LikedSongsPage'
import { LoginPage } from '@/pages/LoginPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { PlaylistsPage } from '@/pages/PlaylistsPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { SettingsPage } from '@/pages/SettingsPage'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/',
    element: <AppShell />,

    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'discover',
        element: <DiscoverPage />,
      },
      {
        path: 'artist/:artistId',
        element: <ArtistDetailsPage />,
      },

      {
        element: <ProtectedRoute />,

        children: [
          {
            path: 'journal',
            element: <JournalPage />,
          },
          {
            path: 'insights',
            element: <InsightsPage />,
          },
          {
            path: 'liked',
            element: <LikedSongsPage />,
          },
          {
            path: 'playlists',
            element: <PlaylistsPage />,
          },
          {
            path: 'settings',
            element: <SettingsPage />,
          },
        ],
      },

      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
])