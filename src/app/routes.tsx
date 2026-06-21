import { createBrowserRouter } from 'react-router-dom'

import { AppShell } from '@/components/layout/AppShell'

import { ArtistDetailsPage } from '@/pages/ArtistDetailsPage'
import { DiscoverPage } from '@/pages/DiscoverPage'
import { HomePage } from '@/pages/HomePage'
import { InsightsPage } from '@/pages/InsightsPage'
import { JournalPage } from '@/pages/JournalPage'
import { LikedSongsPage } from '@/pages/LikedSongsPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { PlaylistsPage } from '@/pages/PlaylistsPage'
import { SettingsPage } from '@/pages/SettingsPage'

export const router = createBrowserRouter([
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
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
])