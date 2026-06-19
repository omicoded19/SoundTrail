export const SIDEBAR_WIDTH = 240
export const PLAYER_HEIGHT = 88
export const MOBILE_NAV_HEIGHT = 64
export const MOBILE_PLAYER_HEIGHT = 72

export type ArtistTab = 'overview' | 'related' | 'albums' | 'about'

export const ARTIST_TABS: { id: ArtistTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'related', label: 'Related' },
  { id: 'albums', label: 'Albums' },
  { id: 'about', label: 'About' },
]

export const NAV_ITEMS: {
  to: string
  label: string
  mobileLabel: string
  disabled?: boolean
}[] = [
  { to: '/', label: 'Home', mobileLabel: 'Home' },
  { to: '/discover', label: 'Discover', mobileLabel: 'Discover' },
  { to: '/journal', label: 'Journal', mobileLabel: 'Journal' },
  { to: '/ai-dj', label: 'AI DJ', mobileLabel: 'AI DJ' },
  { to: '/insights', label: 'Insights', mobileLabel: 'Insights' },
]