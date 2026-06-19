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
  /*
    Keeps the mock player progress moving while a track
    is marked as playing.
  */
  useSimulatedPlayback()

  /*
    Runs once when the application loads.

    It reads the saved theme from localStorage
    and applies it to the root HTML element.
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