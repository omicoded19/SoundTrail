/*
  This type matches one track returned by
  our Express backend.
*/
export type RealTrackSearchResult = {
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
  Successful response returned by:

  GET /api/search/tracks
*/
type SearchTracksSuccessResponse = {
  success: true
  query: string
  count: number
  tracks: RealTrackSearchResult[]
}

/*
  Error response returned by the backend.
*/
type SearchTracksErrorResponse = {
  success: false
  message: string
}

type SearchTracksResponse =
  | SearchTracksSuccessResponse
  | SearchTracksErrorResponse

/*
  Use the URL from the frontend environment file.

  The fallback is useful during local development.
*/
const API_BASE_URL =
  import.meta.env.VITE_API_URL ??
  'http://localhost:4000'

/*
  Requests real tracks from our Express backend.

  Example:

  searchRealTracks('Arijit Singh')
*/
export async function searchRealTracks(
  query: string,
  signal?: AbortSignal,
): Promise<RealTrackSearchResult[]> {
  const trimmedQuery = query.trim()

  /*
    The backend requires at least two characters.
  */
  if (trimmedQuery.length < 2) {
    return []
  }

  const parameters = new URLSearchParams({
    q: trimmedQuery,
  })

  const response = await fetch(
    `${API_BASE_URL}/api/search/tracks?${parameters.toString()}`,
    {
      signal,
    },
  )

  const data =
    (await response.json()) as SearchTracksResponse

  /*
    Handle HTTP errors and backend errors.
  */
  if (!response.ok || !data.success) {
    const message =
      data.success === false
        ? data.message
        : 'Unable to search for music.'

    throw new Error(message)
  }

  return data.tracks
}