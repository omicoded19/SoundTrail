import { useEffect } from 'react'
import { usePlayerStore } from './player-store'

export function useSimulatedPlayback() {
  const isPlaying = usePlayerStore((s) => s.isPlaying)
  const currentTrack = usePlayerStore((s) => s.currentTrack)
  const tickProgress = usePlayerStore((s) => s.tickProgress)

  useEffect(() => {
    if (!isPlaying || !currentTrack) return

    const interval = window.setInterval(() => {
      tickProgress()
    }, 1000)

    return () => window.clearInterval(interval)
  }, [isPlaying, currentTrack?.id, tickProgress])
}
