import { useState } from 'react'
import { Headphones, Play, Sparkles } from 'lucide-react'

import { tracks } from '@/data'
import { usePlayerStore } from '@/features/player/player-store'

type MoodId = 'focus' | 'energy' | 'calm' | 'warm'

type Mood = {
  id: MoodId
  title: string
  description: string
  artistIds: string[]
  gradient: string
}

const moods: Mood[] = [
  {
    id: 'focus',
    title: 'Deep Focus',
    description: 'Atmospheric music for studying and coding.',
    artistIds: ['luna-vale', 'echo-finch'],
    gradient: 'from-indigo-500/30 to-purple-500/10',
  },
  {
    id: 'energy',
    title: 'High Energy',
    description: 'Fast, bright tracks to raise your energy.',
    artistIds: ['kairo-nova', 'mira-sol'],
    gradient: 'from-lime-500/30 to-orange-500/10',
  },
  {
    id: 'calm',
    title: 'Slow Evening',
    description: 'Gentle music for relaxing after a long day.',
    artistIds: ['echo-finch', 'luna-vale'],
    gradient: 'from-blue-500/30 to-indigo-500/10',
  },
  {
    id: 'warm',
    title: 'Golden Hour',
    description: 'Warm and colourful tracks for sunset listening.',
    artistIds: ['mira-sol', 'luna-vale'],
    gradient: 'from-orange-500/30 to-pink-500/10',
  },
]

export function AIDJPage() {
  /*
    Stores which mood the user has selected.

    The page begins with the Focus mood selected.
  */
  const [selectedMoodId, setSelectedMoodId] =
    useState<MoodId>('focus')

  /*
    Get the playTrack function from the existing player store.
  */
  const playTrack = usePlayerStore((state) => state.playTrack)

  /*
    Find the complete mood object using its ID.
  */
  const selectedMood =
    moods.find((mood) => mood.id === selectedMoodId) ?? moods[0]

  /*
    Keep tracks whose artist belongs to the selected mood.

    slice(0, 6) limits the generated queue to six tracks.
  */
  const generatedTracks = tracks
    .filter((track) =>
      selectedMood.artistIds.includes(track.artistId),
    )
    .slice(0, 6)

  /*
    Start the first generated track and pass the complete
    generated track list to the player as its queue.
  */
  const handlePlayMix = () => {
    const firstTrack = generatedTracks[0]

    if (firstTrack) {
      playTrack(firstTrack, generatedTracks)
    }
  }

  return (
    <div className="min-h-screen space-y-10 p-8 pb-32">
      <header>
        <div className="flex items-center gap-3">
          <Sparkles className="h-8 w-8 text-pink-400" />

          <h1 className="text-5xl font-bold text-white">
            AI DJ
          </h1>
        </div>

        <p className="mt-3 max-w-2xl text-white/60">
          Choose how you feel and SoundTrail will create a
          personalised listening queue.
        </p>
      </header>

      {/* Mood selection cards */}
      <section>
        <h2 className="mb-5 text-2xl font-semibold text-white">
          What is your mood?
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {moods.map((mood) => {
            const isSelected = selectedMoodId === mood.id

            return (
              <button
                key={mood.id}
                type="button"
                onClick={() => setSelectedMoodId(mood.id)}
                className={`rounded-2xl border bg-gradient-to-br p-5 text-left transition ${mood.gradient} ${
                  isSelected
                    ? 'border-white/50 ring-2 ring-white/20'
                    : 'border-white/10 hover:-translate-y-1 hover:border-white/30'
                }`}
              >
                <Headphones className="mb-8 h-6 w-6 text-white/70" />

                <h3 className="text-lg font-semibold text-white">
                  {mood.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-white/50">
                  {mood.description}
                </p>
              </button>
            )
          })}
        </div>
      </section>

      {/* Generated playlist */}
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-pink-300">
              Generated for you
            </p>

            <h2 className="mt-2 text-3xl font-bold text-white">
              {selectedMood.title}
            </h2>

            <p className="mt-2 text-white/50">
              {generatedTracks.length} tracks selected for this mood
            </p>
          </div>

          <button
            type="button"
            onClick={handlePlayMix}
            disabled={generatedTracks.length === 0}
            className="flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-black transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Play className="h-5 w-5 fill-current" />
            Play mix
          </button>
        </div>

        <div className="mt-7 divide-y divide-white/10">
          {generatedTracks.map((track, index) => (
            <button
              key={track.id}
              type="button"
              onClick={() => playTrack(track, generatedTracks)}
              className="flex w-full items-center gap-4 px-2 py-4 text-left transition hover:bg-white/5"
            >
              <span className="w-5 text-sm text-white/30">
                {index + 1}
              </span>

              <img
                src={track.artworkUrl}
                alt={track.albumTitle}
                className="h-12 w-12 rounded-lg object-cover"
              />

              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-white">
                  {track.title}
                </p>

                <p className="truncate text-sm text-white/50">
                  {track.artistName}
                </p>
              </div>

              <Play className="h-4 w-4 text-white/40" />
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}