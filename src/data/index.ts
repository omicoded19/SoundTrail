import { artists, DEFAULT_ARTIST_ID } from './mock-artists'
import { tracks } from './mock-tracks'
import { albums } from './mock-albums'
import type { Artist } from '@/types/artist'
import type { Track } from '@/types/track'
import type { Album } from '@/types/album'

export function getArtistById(id: string): Artist | undefined {
  return artists.find((artist) => artist.id === id)
}

export function getDefaultArtist(): Artist {
  return getArtistById(DEFAULT_ARTIST_ID)!
}

export function getTracksByArtist(artistId: string): Track[] {
  const artist = getArtistById(artistId)
  if (!artist) return []
  return artist.popularTrackIds
    .map((id) => tracks.find((track) => track.id === id))
    .filter((track): track is Track => track !== undefined)
}

export function getAlbumsByArtist(artistId: string): Album[] {
  const artist = getArtistById(artistId)
  if (!artist) return []
  return artist.albumIds
    .map((id) => albums.find((album) => album.id === id))
    .filter((album): album is Album => album !== undefined)
}

export function getRelatedArtists(artistId: string): Artist[] {
  const artist = getArtistById(artistId)
  if (!artist) return []
  return artist.relatedArtistIds
    .map((id) => getArtistById(id))
    .filter((a): a is Artist => a !== undefined)
}

export function getTrackById(id: string): Track | undefined {
  return tracks.find((track) => track.id === id)
}
export function getAlbumById(id: string): Album | undefined {
  return albums.find((album) => album.id === id)
}

export function getTracksByAlbum(albumId: string): Track[] {
  const album = getAlbumById(albumId)

  if (!album) {
    return []
  }

  return album.trackIds
    .map((trackId) => getTrackById(trackId))
    .filter((track): track is Track => track !== undefined)
}

export { artists, tracks, albums, DEFAULT_ARTIST_ID }
