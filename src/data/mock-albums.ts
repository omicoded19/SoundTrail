import type { Album } from '@/types/album'

export const albums: Album[] = [
  {
    id: 'lv-album-starlight',
    title: 'Starlight Sessions',
    artistId: 'luna-vale',
    coverUrl:
      'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&h=400&fit=crop',
    releaseYear: 2024,
    trackIds: ['lv-midnight-garden', 'lv-velvet-echo', 'lv-silver-thread'],
  },
  {
    id: 'lv-album-echo-chamber',
    title: 'Echo Chamber',
    artistId: 'luna-vale',
    coverUrl:
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop',
    releaseYear: 2023,
    trackIds: ['lv-paper-moon', 'lv-neon-tide'],
  },
  {
    id: 'kn-album-frequency',
    title: 'Frequency',
    artistId: 'kairo-nova',
    coverUrl:
      'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=400&h=400&fit=crop',
    releaseYear: 2025,
    trackIds: ['kn-pulse-wave', 'kn-amber-circuit', 'kn-static-bloom'],
  },
  {
    id: 'kn-album-signal-fire',
    title: 'Signal Fire',
    artistId: 'kairo-nova',
    coverUrl:
      'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=400&fit=crop',
    releaseYear: 2023,
    trackIds: ['kn-gravity-lift', 'kn-chrome-dawn'],
  },
  {
    id: 'ms-album-horizon',
    title: 'Horizon Lines',
    artistId: 'mira-sol',
    coverUrl:
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
    releaseYear: 2024,
    trackIds: ['ms-golden-hour', 'ms-cinnamon-sky', 'ms-sunlit-verge'],
  },
  {
    id: 'ms-album-warmth',
    title: 'Warmth',
    artistId: 'mira-sol',
    coverUrl:
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop',
    releaseYear: 2022,
    trackIds: ['ms-ember-dance', 'ms-terra-cotta'],
  },
  {
    id: 'ef-album-distant-shore',
    title: 'Distant Shore',
    artistId: 'echo-finch',
    coverUrl:
      'https://images.unsplash.com/photo-1459749411175-04bf5132e985?w=400&h=400&fit=crop',
    releaseYear: 2024,
    trackIds: ['ef-parallel-lines', 'ef-ghost-refrain', 'ef-quiet-storm'],
  },
  {
    id: 'ef-album-film-reel',
    title: 'Film Reel',
    artistId: 'echo-finch',
    coverUrl:
      'https://images.unsplash.com/photo-1514320291840-755a9c9639bd?w=400&h=400&fit=crop',
    releaseYear: 2023,
    trackIds: ['ef-indigo-valley', 'ef-faded-postcard'],
  },
]
