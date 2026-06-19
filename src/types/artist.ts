export interface Artist {
  id: string
  name: string
  portraitUrl: string
  accentColor: string
  accentColorDark: string
  bio: string
  relatedArtistIds: string[]
  popularTrackIds: string[]
  albumIds: string[]
}
