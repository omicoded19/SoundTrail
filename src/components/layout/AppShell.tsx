import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'

import { Sidebar } from './Sidebar'
import { MobileNav } from './MobileNav'
import { BottomMusicPlayer } from '@/components/player/BottomMusicPlayer'

import { useSimulatedPlayback } from '@/features/player/useSimulatedPlayback'

import {
  applyAccentTheme,
  getSavedAccentTheme,
} from '@/features/theme/theme'

export function AppShell() {
  useSimulatedPlayback()

  /*
    Load and apply the saved accent colour when
    the application first opens.
  */
  useEffect(() => {
    const savedTheme = getSavedAccentTheme()

    applyAccentTheme(savedTheme)
  }, [])

  return (
    <div className="min-h-screen overflow-x-hidden bg-[var(--background)] text-[var(--text)]">
      <Sidebar />

      <main className="min-h-screen overflow-x-hidden pb-[calc(136px+64px+env(safe-area-inset-bottom))] lg:ml-60 lg:pb-[calc(96px+env(safe-area-inset-bottom))]">
        <Outlet />
      </main>

      <BottomMusicPlayer />
      <MobileNav />
    </div>
  )
}