import { create } from 'zustand'
import { DEFAULT_ARTIST_ID } from '@/data'

interface ArtistState {
  activeArtistId: string
  activeTab: 'overview' | 'related' | 'albums' | 'about'
  setActiveArtistId: (id: string) => void
  setActiveTab: (tab: 'overview' | 'related' | 'albums' | 'about') => void
}

export const useArtistStore = create<ArtistState>((set) => ({
  activeArtistId: DEFAULT_ARTIST_ID,
  activeTab: 'overview',
  setActiveArtistId: (id) => set({ activeArtistId: id, activeTab: 'overview' }),
  setActiveTab: (tab) => set({ activeTab: tab }),
}))
