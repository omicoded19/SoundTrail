import type { Artist } from '@/types/artist'

export const artists: Artist[] = [
  {
    id: 'luna-vale',
    name: 'Luna Vale',
    portraitUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&h=1000&fit=crop&crop=face',
    accentColor: '#E879A9',
    accentColorDark: '#BE185D',
    bio: 'Luna Vale blends ethereal synth-pop with confessional lyricism. Her sound drifts between midnight introspection and sunrise optimism — a catalogue built for late-night headphones and golden-hour walks alike.',
    relatedArtistIds: ['kairo-nova', 'mira-sol', 'echo-finch'],
    popularTrackIds: [
      'lv-midnight-garden',
      'lv-velvet-echo',
      'lv-paper-moon',
      'lv-neon-tide',
      'lv-silver-thread',
    ],
    albumIds: ['lv-album-starlight', 'lv-album-echo-chamber'],
  },
  {
    id: 'kairo-nova',
    name: 'Kairo Nova',
    portraitUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1000&fit=crop&crop=face',
    accentColor: '#84CC16',
    accentColorDark: '#4D7C0F',
    bio: 'Kairo Nova pushes boundary-less electronic production — crisp beats, warm basslines, and hooks that stick. A fixture of festival main stages and boutique headphone sessions worldwide.',
    relatedArtistIds: ['luna-vale', 'echo-finch', 'mira-sol'],
    popularTrackIds: [
      'kn-pulse-wave',
      'kn-amber-circuit',
      'kn-gravity-lift',
      'kn-chrome-dawn',
      'kn-static-bloom',
    ],
    albumIds: ['kn-album-frequency', 'kn-album-signal-fire'],
  },
  {
    id: 'mira-sol',
    name: 'Mira Sol',
    portraitUrl:
      'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&h=1000&fit=crop&crop=face',
    accentColor: '#F97316',
    accentColorDark: '#C2410C',
    bio: 'Mira Sol fuses Latin rhythms with modern R&B sensibilities. Her voice carries warmth and fire in equal measure — music for dancing alone in the kitchen or sharing with a crowded room.',
    relatedArtistIds: ['echo-finch', 'luna-vale', 'kairo-nova'],
    popularTrackIds: [
      'ms-golden-hour',
      'ms-cinnamon-sky',
      'ms-ember-dance',
      'ms-terra-cotta',
      'ms-sunlit-verge',
    ],
    albumIds: ['ms-album-horizon', 'ms-album-warmth'],
  },
  {
    id: 'echo-finch',
    name: 'Echo Finch',
    portraitUrl:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&h=1000&fit=crop&crop=face',
    accentColor: '#6366F1',
    accentColorDark: '#4338CA',
    bio: 'Echo Finch crafts cinematic indie rock with layered guitars and whispered intimacy. Each record feels like a short film — narrative arcs, quiet crescendos, and endings that linger.',
    relatedArtistIds: ['mira-sol', 'kairo-nova', 'luna-vale'],
    popularTrackIds: [
      'ef-parallel-lines',
      'ef-ghost-refrain',
      'ef-indigo-valley',
      'ef-faded-postcard',
      'ef-quiet-storm',
    ],
    albumIds: ['ef-album-distant-shore', 'ef-album-film-reel'],
  },
]

export const DEFAULT_ARTIST_ID = 'luna-vale'
