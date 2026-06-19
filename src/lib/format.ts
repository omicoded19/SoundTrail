export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function formatProgress(current: number, total: number): string {
  return `${formatDuration(current)} / ${formatDuration(total)}`
}
