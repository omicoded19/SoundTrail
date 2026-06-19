import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { MobileNav } from './MobileNav'
import { BottomMusicPlayer } from '@/components/player/BottomMusicPlayer'
import { useSimulatedPlayback } from '@/features/player/useSimulatedPlayback'

export function AppShell() {
  useSimulatedPlayback()

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0a0a0a]">
      <Sidebar />
      <main className="min-h-screen overflow-x-hidden pb-[calc(136px+64px+env(safe-area-inset-bottom))] lg:ml-60 lg:pb-[calc(96px+env(safe-area-inset-bottom))]">
        <Outlet />
      </main>
      <BottomMusicPlayer />
      <MobileNav />
    </div>
  )
}
