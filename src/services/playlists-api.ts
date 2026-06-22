import type { Track } from '@/types/track'

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ??
  'http://localhost:4000'
).replace(/\/$/, '')

export interface SoundTrailPlaylist {
  id: string
  name: string
  description: string
  tracks: Track[]
  trackCount: number
  createdAt: string
  updatedAt: string
}

export interface CreatePlaylistInput {
  name: string
  description?: string
}

export interface UpdatePlaylistInput {
  name?: string
  description?: string
}

interface ApiErrorResponse {
  success?: false
  message?: string
}

interface StoredPlaylistTrack {
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

interface StoredPlaylist {
  id: string
  name: string
  description: string
  tracks: StoredPlaylistTrack[]
  trackCount: number
  createdAt: string
  updatedAt: string
}

interface PlaylistsResponse {
  success: true
  count: number
  playlists: StoredPlaylist[]
}

interface PlaylistResponse {
  success: true
  message?: string
  playlist: StoredPlaylist
}

interface DeletePlaylistResponse {
  success: true
  message: string
}

function mapStoredTrack(
  track: StoredPlaylistTrack,
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

function mapStoredPlaylist(
  playlist: StoredPlaylist,
): SoundTrailPlaylist {
  const tracks = (
    playlist.tracks ?? []
  ).map(mapStoredTrack)

  return {
    id: playlist.id,
    name: playlist.name,
    description:
      playlist.description ?? '',
    tracks,
    trackCount: tracks.length,
    createdAt: playlist.createdAt,
    updatedAt: playlist.updatedAt,
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

export async function getPlaylists(
  token: string,
): Promise<SoundTrailPlaylist[]> {
  const data =
    await requestJson<PlaylistsResponse>(
      '/api/playlists',
      token,
    )

  return (data.playlists ?? []).map(
    mapStoredPlaylist,
  )
}

export async function getPlaylist(
  token: string,
  playlistId: string,
): Promise<SoundTrailPlaylist> {
  const encodedPlaylistId =
    encodeURIComponent(playlistId)

  const data =
    await requestJson<PlaylistResponse>(
      `/api/playlists/${encodedPlaylistId}`,
      token,
    )

  return mapStoredPlaylist(
    data.playlist,
  )
}

export async function createPlaylist(
  token: string,
  input: CreatePlaylistInput,
): Promise<SoundTrailPlaylist> {
  const data =
    await requestJson<PlaylistResponse>(
      '/api/playlists',
      token,
      {
        method: 'POST',
        body: JSON.stringify({
          name: input.name.trim(),
          description:
            input.description?.trim() ??
            '',
        }),
      },
    )

  return mapStoredPlaylist(
    data.playlist,
  )
}

export async function updatePlaylist(
  token: string,
  playlistId: string,
  input: UpdatePlaylistInput,
): Promise<SoundTrailPlaylist> {
  const encodedPlaylistId =
    encodeURIComponent(playlistId)

  const body: UpdatePlaylistInput = {}

  if (
    typeof input.name === 'string'
  ) {
    body.name = input.name.trim()
  }

  if (
    typeof input.description ===
    'string'
  ) {
    body.description =
      input.description.trim()
  }

  const data =
    await requestJson<PlaylistResponse>(
      `/api/playlists/${encodedPlaylistId}`,
      token,
      {
        method: 'PATCH',
        body: JSON.stringify(body),
      },
    )

  return mapStoredPlaylist(
    data.playlist,
  )
}

export async function deletePlaylist(
  token: string,
  playlistId: string,
): Promise<void> {
  const encodedPlaylistId =
    encodeURIComponent(playlistId)

  await requestJson<DeletePlaylistResponse>(
    `/api/playlists/${encodedPlaylistId}`,
    token,
    {
      method: 'DELETE',
    },
  )
}

export async function addTrackToPlaylist(
  token: string,
  playlistId: string,
  track: Track,
): Promise<SoundTrailPlaylist> {
  const encodedPlaylistId =
    encodeURIComponent(playlistId)

  const data =
    await requestJson<PlaylistResponse>(
      `/api/playlists/${encodedPlaylistId}/tracks`,
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

  return mapStoredPlaylist(
    data.playlist,
  )
}

export async function removeTrackFromPlaylist(
  token: string,
  playlistId: string,
  trackId: string,
): Promise<SoundTrailPlaylist> {
  const encodedPlaylistId =
    encodeURIComponent(playlistId)

  const encodedTrackId =
    encodeURIComponent(trackId)

  const data =
    await requestJson<PlaylistResponse>(
      `/api/playlists/${encodedPlaylistId}/tracks/${encodedTrackId}`,
      token,
      {
        method: 'DELETE',
      },
    )

  return mapStoredPlaylist(
    data.playlist,
  )
}