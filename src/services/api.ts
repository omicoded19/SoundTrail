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