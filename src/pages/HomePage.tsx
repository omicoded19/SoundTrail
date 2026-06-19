import { motion } from 'motion/react'

import { ArtistHero } from '../components/artist/ArtistHero'
import { ArtistTabs } from '../components/artist/ArtistTabs'
import { RelatedArtistsRow } from '../components/artist/RelatedArtistsRow'
import { TrackList } from '../components/catalog/TrackList'
import { AlbumGrid } from '../components/catalog/AlbumGrid'

import { useArtistStore } from '../features/artist/artist-store'
import { usePlayerStore } from '../features/player/player-store'

import {
  getArtistById,
  getTracksByArtist,
  getAlbumsByArtist,
  getRelatedArtists,
  getTrackById,
} from '../data'

export function HomePage() {
  /*
    We read values from the artist store.

    activeArtistId:
    Tells us which artist is currently selected.

    activeTab:
    Tells us whether the user is viewing Overview,
    Albums, Related, or About.
  */
  const activeArtistId = useArtistStore((state) => state.activeArtistId)
  const activeTab = useArtistStore((state) => state.activeTab)

  /*
    These are functions from the store.

    We use them to update the currently selected artist
    and the currently selected tab.
  */
  const setActiveArtistId = useArtistStore(
    (state) => state.setActiveArtistId,
  )

  const setActiveTab = useArtistStore(
    (state) => state.setActiveTab,
  )

  /*
    playTrack comes from the player store.

    It changes the currently playing track and starts playback.
  */
  const playTrack = usePlayerStore((state) => state.playTrack)

  /*
    Find the complete artist object using the selected artist ID.
  */
  const artist = getArtistById(activeArtistId)

  /*
    This is a safety check.

    If the artist does not exist, render nothing instead
    of crashing the application.
  */
  if (!artist) {
    return null
  }

  /*
    Get all data connected to the selected artist.
  */
  const tracks = getTracksByArtist(activeArtistId)
  const albums = getAlbumsByArtist(activeArtistId)
  const relatedArtists = getRelatedArtists(activeArtistId)

  /*
    This function runs when the user clicks a track.

    The selected track becomes the current track, and
    the complete artist track list becomes the queue.
  */
  const handlePlayTrack = (track: (typeof tracks)[0]) => {
    playTrack(track, tracks)
  }

  /*
    When an album is clicked, we find its first track
    and begin playing it.
  */
  const handleSelectAlbum = (albumId: string) => {
    const selectedAlbum = albums.find(
      (album) => album.id === albumId,
    )

    const firstTrackId = selectedAlbum?.trackIds[0]

    const firstTrack = firstTrackId
      ? getTrackById(firstTrackId)
      : undefined

    if (firstTrack) {
      playTrack(firstTrack, tracks)
    }
  }

  return (
    /*
      motion.div works like a normal div, but it can animate.

      Here the page background changes whenever the selected
      artist changes.
    */
    <motion.div
      className="min-h-screen overflow-x-hidden"
      animate={{
        background: `
          linear-gradient(
            115deg,
            ${artist.accentColor} 0%,
            ${artist.accentColorDark} 48%,
            #101010 100%
          )
        `,
      }}
      transition={{
        duration: 0.5,
      }}
    >
      {/*
        On smaller screens, sections appear vertically.

        On large screens, lg:flex-row places the hero and
        content beside each other.
      */}
      <div className="flex min-h-screen flex-col lg:flex-row">
        <ArtistHero artist={artist} />

        {/*
          This is the right side of the application.

          relative:
          Allows us to position the coloured background layer
          inside this section.

          min-w-0:
          Prevents long text from causing horizontal overflow.
        */}
        <section className="relative min-w-0 flex-1 overflow-hidden">
          {/*
            This background layer continues the artist colour
            into the right section.

            It is a normal gradient, not glassmorphism.
          */}
          <motion.div
            className="absolute inset-0"
            animate={{
              background: `
                linear-gradient(
                  135deg,
                  ${artist.accentColorDark} 0%,
                  #171717 58%,
                  #0d0d0d 100%
                )
              `,
            }}
            transition={{
              duration: 0.5,
            }}
            aria-hidden="true"
          />

          {/*
            relative and z-10 place the actual content above
            the background layer.
          */}
          <div className="relative z-10 flex min-h-full flex-col px-5 py-6 sm:px-7 lg:px-8 lg:py-8">
            <ArtistTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              accentColor={artist.accentColor}
            />

            <div className="mt-7 flex-1">
              {/*
                React conditionally displays content depending
                on the currently selected tab.
              */}

              {activeTab === 'overview' && (
                <div className="space-y-8">
                  <TrackList
                    tracks={tracks}
                    onPlayTrack={handlePlayTrack}
                  />

                  <AlbumGrid
                    albums={albums}
                    onSelectAlbum={handleSelectAlbum}
                  />

                  <RelatedArtistsRow
                    artists={relatedArtists}
                    activeArtistId={activeArtistId}
                    onSelectArtist={setActiveArtistId}
                  />
                </div>
              )}

              {activeTab === 'related' && (
                <RelatedArtistsRow
                  artists={relatedArtists}
                  activeArtistId={activeArtistId}
                  onSelectArtist={setActiveArtistId}
                />
              )}

              {activeTab === 'albums' && (
                <AlbumGrid
                  albums={albums}
                  title="All Albums"
                  onSelectAlbum={handleSelectAlbum}
                />
              )}

              {activeTab === 'about' && (
                <section className="max-w-xl">
                  <h2 className="mb-4 text-xl font-bold text-white">
                    About {artist.name}
                  </h2>

                  <p className="text-sm leading-7 text-white/70">
                    {artist.bio}
                  </p>
                </section>
              )}
            </div>
          </div>
        </section>
      </div>
    </motion.div>
  )
}