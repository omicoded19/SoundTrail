import type { Track } from '@/types/track'

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ??
  'http://localhost:4000'
).replace(/\/$/, '')

interface ApiErrorResponse {
  success?: false
  message?: string
}

interface StoredTrackResponse {
  id: string
  title: string
  artistId: string | null
  artistName: string
  albumId: string | null
  albumTitle: string
  artworkUrl: string
  durationSec: number
  previewUrl: string | null
  externalUrl: string | null
  source: Track['source']
}

interface LikedSongsResponse {
  success: true
  count: number
  tracks: StoredTrackResponse[]
}

interface AddLikedSongResponse {
  success: true
  message: string
  track: StoredTrackResponse
}

interface RemoveLikedSongResponse {
  success: true
  removed: boolean
  message: string
}

function mapStoredTrack(
  track: StoredTrackResponse,
): Track {
  return {
    id: track.id,
    title: track.title,
    artistId: track.artistId ?? '',
    artistName: track.artistName,
    albumId: track.albumId ?? '',
    albumTitle: track.albumTitle,
    artworkUrl: track.artworkUrl,
    durationSec: track.durationSec,
    previewUrl:
      track.previewUrl ?? undefined,
    externalUrl:
      track.externalUrl ?? undefined,
    source: track.source,
  }
}

async function requestJson<T>(
  path: string,
  token: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(
    options.headers,
  )

  headers.set(
    'Accept',
    'application/json',
  )

  headers.set(
    'Authorization',
    `Bearer ${token}`,
  )

  if (options.body) {
    headers.set(
      'Content-Type',
      'application/json',
    )
  }

  const response = await fetch(
    `${API_BASE_URL}${path}`,
    {
      ...options,
      headers,
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
    const errorData =
      data as ApiErrorResponse

    throw new Error(
      errorData.message ??
        `Request failed with status ${response.status}.`,
    )
  }

  return data as T
}

export async function getLikedSongs(
  token: string,
): Promise<Track[]> {
  const data =
    await requestJson<LikedSongsResponse>(
      '/api/library/liked',
      token,
    )

  return (data.tracks ?? []).map(
    mapStoredTrack,
  )
}

export async function addLikedSong(
  token: string,
  track: Track,
): Promise<Track> {
  const data =
    await requestJson<AddLikedSongResponse>(
      '/api/library/liked',
      token,
      {
        method: 'POST',

        body: JSON.stringify({
          id: track.id,
          title: track.title,
          artistId:
            track.artistId || null,
          artistName:
            track.artistName,
          albumId:
            track.albumId || null,
          albumTitle:
            track.albumTitle,
          artworkUrl:
            track.artworkUrl,
          durationSec:
            track.durationSec,
          previewUrl:
            track.previewUrl ?? null,
          externalUrl:
            track.externalUrl ?? null,
          source: track.source,
        }),
      },
    )

  return mapStoredTrack(
    data.track,
  )
}

export async function removeLikedSong(
  token: string,
  trackId: string,
): Promise<boolean> {
  const encodedTrackId =
    encodeURIComponent(trackId)

  const data =
    await requestJson<RemoveLikedSongResponse>(
      `/api/library/liked/${encodedTrackId}`,
      token,
      {
        method: 'DELETE',
      },
    )

  return data.removed
}