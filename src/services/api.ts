import type { Track } from '@/types/track'

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ??
  'http://localhost:4000'
).replace(/\/$/, '')

export interface SoundTrailArtistArea {
  id: string
  name: string
  type: string | null
}

export interface SoundTrailArtistGenre {
  id: string | null
  name: string
  count: number
}

export interface SoundTrailArtistTag {
  name: string
  count: number
}

export interface SoundTrailArtist {
  id: string
  name: string
  sortName: string
  type: string | null
  country: string | null
  disambiguation: string | null
  score: number | null
  area: SoundTrailArtistArea | null
  beginArea: SoundTrailArtistArea | null

  lifeSpan: {
    begin: string | null
    end: string | null
    ended: boolean
  } | null

  genres: SoundTrailArtistGenre[]
  tags: SoundTrailArtistTag[]
  musicBrainzUrl: string
}

export interface SoundTrailTrack {
  id: string
  title: string
  artistName: string
  artistId: string | null
  albumTitle: string
  releaseId: string | null
  durationSec: number
  firstReleaseDate: string | null
  score: number
  musicBrainzUrl: string
}

/*
  This represents one track returned by our
  Express iTunes endpoint.
*/
interface ITunesTrackResponse {
  id: string
  title: string
  artistId: string | null
  artistName: string
  albumId: string | null
  albumTitle: string
  artworkUrl: string
  previewUrl: string | null
  externalUrl: string | null
  durationSec: number
  releaseDate: string | null
  genre: string | null
  explicit: boolean
  source: 'itunes'
}

interface ApiErrorResponse {
  success?: false
  message?: string
}

interface ArtistSearchResponse {
  success: boolean
  query: string
  count: number
  artists: SoundTrailArtist[]
  message?: string
}

interface TrackSearchResponse {
  success: boolean
  query: string
  count: number
  tracks: ITunesTrackResponse[]
  message?: string
}

interface ArtistDetailsResponse {
  success: boolean
  artist: SoundTrailArtist
  message?: string
}

interface ArtistTracksResponse {
  success: boolean
  artistId: string
  count: number
  tracks: SoundTrailTrack[]
  message?: string
}

/*
  Reusable helper for making backend requests.
*/
async function requestJson<T>(
  path: string,
  signal?: AbortSignal,
): Promise<T> {
  const response = await fetch(
    `${API_BASE_URL}${path}`,
    {
      signal,
      headers: {
        Accept: 'application/json',
      },
    },
  )

  let data: unknown

  try {
    data = await response.json()
  } catch {
    throw new Error(
      'The server returned an invalid response.',
    )
  }

  if (!response.ok) {
    const errorData = data as ApiErrorResponse

    throw new Error(
      errorData.message ??
        `Request failed with status ${response.status}.`,
    )
  }

  return data as T
}

/*
  Search MusicBrainz artists.
*/
export async function searchArtists(
  query: string,
  signal?: AbortSignal,
): Promise<SoundTrailArtist[]> {
  const parameters = new URLSearchParams({
    q: query.trim(),
  })

  const data =
    await requestJson<ArtistSearchResponse>(
      `/api/search/artists?${parameters.toString()}`,
      signal,
    )

  return data.artists ?? []
}

/*
  Search iTunes songs.

  The backend response is converted into the existing
  Track type used by the SoundTrail player.
*/
export async function searchTracks(
  query: string,
  signal?: AbortSignal,
): Promise<Track[]> {
  const parameters = new URLSearchParams({
    q: query.trim(),
  })

  const data =
    await requestJson<TrackSearchResponse>(
      `/api/search/tracks?${parameters.toString()}`,
      signal,
    )

  return (data.tracks ?? []).map((track) => ({
    id: track.id,
    title: track.title,
    artistId: track.artistId ?? '',
    artistName: track.artistName,
    albumId: track.albumId ?? '',
    albumTitle: track.albumTitle,
    artworkUrl: track.artworkUrl,
    durationSec: track.durationSec,
    previewUrl: track.previewUrl ?? undefined,
    externalUrl: track.externalUrl ?? undefined,
    source: track.source,
  }))
}

/*
  Load one MusicBrainz artist.
*/
export async function getArtistDetails(
  artistId: string,
  signal?: AbortSignal,
): Promise<SoundTrailArtist> {
  const encodedArtistId =
    encodeURIComponent(artistId)

  const data =
    await requestJson<ArtistDetailsResponse>(
      `/api/artists/${encodedArtistId}`,
      signal,
    )

  return data.artist
}

/*
  Load MusicBrainz recordings for an artist.
*/
export async function getArtistTracks(
  artistId: string,
  signal?: AbortSignal,
): Promise<SoundTrailTrack[]> {
  const encodedArtistId =
    encodeURIComponent(artistId)

  const data =
    await requestJson<ArtistTracksResponse>(
      `/api/artists/${encodedArtistId}/tracks`,
      signal,
    )

  return data.tracks ?? []
}