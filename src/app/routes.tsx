import { createBrowserRouter } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'

import { HomePage } from '@/pages/HomePage'
import { DiscoverPage } from '@/pages/DiscoverPage'
import { JournalPage } from '@/pages/JournalPage'
import { AIDJPage } from '@/pages/AIDJPage'
import { InsightsPage } from '@/pages/InsightsPage'
import { LikedSongsPage } from '@/pages/LikedSongsPage'
import { PlaylistsPage } from '@/pages/PlaylistsPage'
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
      }

    ],
  },
])