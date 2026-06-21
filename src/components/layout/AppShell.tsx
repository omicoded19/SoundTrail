import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'

import { BottomMusicPlayer } from '@/components/player/BottomMusicPlayer'
import { useGlobalPlayerShortcuts } from '@/features/player/useGlobalPlayerShortcuts'

import {
  applyAccentTheme,
  getSavedAccentTheme,
} from '@/features/theme/theme'

import { MobileNav } from './MobileNav'
import { Sidebar } from './Sidebar'

export function AppShell() {
  useGlobalPlayerShortcuts()

  useEffect(() => {
    const savedTheme =
      getSavedAccentTheme()

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