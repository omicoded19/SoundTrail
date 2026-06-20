export interface Track {
  id: string
  title: string
  artistId: string
  artistName: string
  albumId: string
  albumTitle: string
  artworkUrl: string
  durationSec: number

  /*
    URL of the playable audio preview.

    This will usually be a 30-second preview returned
    by the iTunes Search API.
  */
  previewUrl?: string

  /*
    External page where the user can open the complete
    song when only a preview is available in SoundTrail.
  */
  externalUrl?: string

  /*
    Identifies where the track information came from.
  */
  source?: 'local' | 'itunes' | 'musicbrainz'
}