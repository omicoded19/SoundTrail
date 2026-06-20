import { createBrowserRouter } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'

import { HomePage } from '@/pages/HomePage'
import { DiscoverPage } from '@/pages/DiscoverPage'
import { ArtistDetailsPage } from '@/pages/ArtistDetailsPage'
import { JournalPage } from '@/pages/JournalPage'
import { AIDJPage } from '@/pages/AIDJPage'
import { InsightsPage } from '@/pages/InsightsPage'
import { LikedSongsPage } from '@/pages/LikedSongsPage'
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
        path: 'ai-dj',
        element: <AIDJPage />,
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
])