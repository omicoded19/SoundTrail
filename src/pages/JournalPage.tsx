import { useEffect, useState } from 'react'
import { BookOpen, Plus, Trash2 } from 'lucide-react'

type JournalEntry = {
  id: string
  song: string
  artist: string
  note: string
  createdAt: string
}

export function JournalPage() {
  // Values currently typed inside the form
  const [song, setSong] = useState('')
  const [artist, setArtist] = useState('')
  const [note, setNote] = useState('')

  // Load previously saved entries when the page first opens
  const [entries, setEntries] = useState<JournalEntry[]>(() => {
    const savedEntries = localStorage.getItem('soundtrail-journal')

    if (!savedEntries) {
      return []
    }

    try {
      return JSON.parse(savedEntries)
    } catch {
      return []
    }
  })

  // Save entries whenever the entries array changes
  useEffect(() => {
    localStorage.setItem(
      'soundtrail-journal',
      JSON.stringify(entries),
    )
  }, [entries])

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    // Do not create an entry if required fields are empty
    if (!song.trim() || !artist.trim() || !note.trim()) {
      return
    }

    const newEntry: JournalEntry = {
      id: crypto.randomUUID(),
      song: song.trim(),
      artist: artist.trim(),
      note: note.trim(),
      createdAt: new Date().toLocaleDateString(),
    }

    // Put the newest entry at the beginning
    setEntries((currentEntries) => [
      newEntry,
      ...currentEntries,
    ])

    // Clear the form
    setSong('')
    setArtist('')
    setNote('')
  }

  const handleDeleteEntry = (entryId: string) => {
    setEntries((currentEntries) =>
      currentEntries.filter((entry) => entry.id !== entryId),
    )
  }

  return (
    <div className="min-h-screen space-y-10 p-8 pb-32">
      <header>
        <div className="flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-pink-400" />

          <h1 className="text-5xl font-bold text-white">
            Journal
          </h1>
        </div>

        <p className="mt-3 text-white/60">
          Save the songs, moments and feelings you want to remember.
        </p>
      </header>

      <section className="grid gap-8 xl:grid-cols-[420px_1fr]">
        {/* New journal entry form */}
        <form
          onSubmit={handleSubmit}
          className="h-fit space-y-5 rounded-2xl border border-white/10 bg-white/5 p-6"
        >
          <div>
            <h2 className="text-xl font-semibold text-white">
              New entry
            </h2>

            <p className="mt-1 text-sm text-white/50">
              Write down what a song made you feel.
            </p>
          </div>

          <div>
            <label
              htmlFor="song"
              className="mb-2 block text-sm font-medium text-white/70"
            >
              Song
            </label>

            <input
              id="song"
              type="text"
              value={song}
              onChange={(event) => setSong(event.target.value)}
              placeholder="Paper Moon"
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-pink-500"
            />
          </div>

          <div>
            <label
              htmlFor="artist"
              className="mb-2 block text-sm font-medium text-white/70"
            >
              Artist
            </label>

            <input
              id="artist"
              type="text"
              value={artist}
              onChange={(event) => setArtist(event.target.value)}
              placeholder="Luna Vale"
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-pink-500"
            />
          </div>

          <div>
            <label
              htmlFor="note"
              className="mb-2 block text-sm font-medium text-white/70"
            >
              Your thoughts
            </label>

            <textarea
              id="note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="This song reminds me of..."
              rows={5}
              className="w-full resize-none rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-pink-500"
            />
          </div>

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 font-semibold text-black transition hover:bg-white/90"
          >
            <Plus className="h-5 w-5" />
            Add entry
          </button>
        </form>

        {/* Saved journal entries */}
        <div>
          <h2 className="mb-5 text-2xl font-semibold text-white">
            Your entries
          </h2>

          {entries.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center">
              <BookOpen className="mx-auto h-10 w-10 text-white/30" />

              <p className="mt-4 font-medium text-white">
                No journal entries yet
              </p>

              <p className="mt-1 text-sm text-white/50">
                Add your first listening memory using the form.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {entries.map((entry) => (
                <article
                  key={entry.id}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {entry.song}
                      </h3>

                      <p className="text-sm text-pink-300">
                        {entry.artist}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteEntry(entry.id)}
                      aria-label={`Delete ${entry.song} entry`}
                      className="rounded-lg p-2 text-white/40 transition hover:bg-white/10 hover:text-white"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <p className="mt-4 leading-7 text-white/70">
                    {entry.note}
                  </p>

                  <p className="mt-4 text-xs text-white/30">
                    {entry.createdAt}
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}