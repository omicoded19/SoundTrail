/*
  These types describe the parts of the MusicBrainz
  responses that SoundTrail currently needs.
*/

type MusicBrainzArea = {
  id: string
  name: string
  type?: string
}

type MusicBrainzLifeSpan = {
  begin?: string
  end?: string
  ended?: boolean
}

type MusicBrainzGenre = {
  id?: string
  name: string
  count?: number
}

type MusicBrainzTag = {
  name: string
  count?: number
}

type MusicBrainzArtist = {
  id: string
  name: string
  'sort-name'?: string
  type?: string
  country?: string
  disambiguation?: string
  score?: number | string
  area?: MusicBrainzArea
  'begin-area'?: MusicBrainzArea
  'life-span'?: MusicBrainzLifeSpan
  genres?: MusicBrainzGenre[]
  tags?: MusicBrainzTag[]
}

type MusicBrainzArtistCredit = {
  name?: string
  joinphrase?: string
  artist?: MusicBrainzArtist
}

type MusicBrainzRelease = {
  id: string
  title: string
  status?: string
  date?: string
  country?: string
}

type MusicBrainzRecording = {
  id: string
  score?: number | string
  title: string
  length?: number
  'first-release-date'?: string
  'artist-credit'?: MusicBrainzArtistCredit[]
  releases?: MusicBrainzRelease[]
}

type MusicBrainzRecordingResponse = {
  count: number
  offset: number
  recordings: MusicBrainzRecording[]
}

type MusicBrainzArtistSearchResponse = {
  count: number
  offset: number
  artists?: MusicBrainzArtist[]
}

/*
  This is the simpler track format returned by our
  own Express API.

  The React frontend does not need to depend directly
  on MusicBrainz field names.
*/
export type MusicTrackSearchResult = {
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
  These types describe the cleaner artist format
  returned by the SoundTrail backend.
*/
export type MusicArtistArea = {
  id: string
  name: string
  type: string | null
}

export type MusicArtistGenre = {
  id: string | null
  name: string
  count: number
}

export type MusicArtistTag = {
  name: string
  count: number
}

export type MusicArtistSearchResult = {
  id: string
  name: string
  sortName: string
  type: string | null
  country: string | null
  disambiguation: string | null
  score: number | null
  area: MusicArtistArea | null
  beginArea: MusicArtistArea | null
  lifeSpan: {
    begin: string | null
    end: string | null
    ended: boolean
  } | null
  genres: MusicArtistGenre[]
  tags: MusicArtistTag[]
  musicBrainzUrl: string
}

const MUSICBRAINZ_BASE_URL =
  'https://musicbrainz.org/ws/2'

/*
  MusicBrainz asks clients not to exceed approximately
  one request per second.

  This queue ensures that track searches, artist searches
  and artist-detail requests are sent one after another.
*/
let requestQueue: Promise<void> = Promise.resolve()
let lastRequestTime = 0

function delay(milliseconds: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, milliseconds)
  })
}

function scheduleMusicBrainzRequest<T>(
  request: () => Promise<T>,
): Promise<T> {
  const scheduledRequest = requestQueue.then(async () => {
    const elapsedTime = Date.now() - lastRequestTime
    const minimumInterval = 1100

    if (elapsedTime < minimumInterval) {
      await delay(minimumInterval - elapsedTime)
    }

    lastRequestTime = Date.now()

    return request()
  })

  /*
    Keep the queue working even if one request fails.
  */
  requestQueue = scheduledRequest.then(
    () => undefined,
    () => undefined,
  )

  return scheduledRequest
}

/*
  Every MusicBrainz request uses the same headers.
*/
function getMusicBrainzHeaders() {
  const contact = process.env.MUSICBRAINZ_CONTACT

  if (!contact) {
    throw new Error(
      'MUSICBRAINZ_CONTACT is missing from server/.env',
    )
  }

  return {
    Accept: 'application/json',
    'User-Agent': `SoundTrail/1.0 (${contact})`,
  }
}

function getScore(
  score: number | string | undefined,
): number {
  const numericScore = Number(score)

  return Number.isFinite(numericScore)
    ? numericScore
    : 0
}

function getOptionalScore(
  score: number | string | undefined,
): number | null {
  if (score === undefined) {
    return null
  }

  return getScore(score)
}

function getArtistName(
  recording: MusicBrainzRecording,
): string {
  const credits = recording['artist-credit']

  if (!credits || credits.length === 0) {
    return 'Unknown artist'
  }

  return credits
    .map((credit) => {
      const name =
        credit.name ??
        credit.artist?.name ??
        'Unknown artist'

      return `${name}${credit.joinphrase ?? ''}`
    })
    .join('')
    .trim()
}

function mapArtistArea(
  area: MusicBrainzArea | undefined,
): MusicArtistArea | null {
  if (!area) {
    return null
  }

  return {
    id: area.id,
    name: area.name,
    type: area.type ?? null,
  }
}

/*
  Converts MusicBrainz artist data into the simpler
  format returned by the SoundTrail backend.
*/
function mapArtist(
  artist: MusicBrainzArtist,
): MusicArtistSearchResult {
  const lifeSpan = artist['life-span']

  const genres = [...(artist.genres ?? [])]
    .sort((firstGenre, secondGenre) => {
      return (
        (secondGenre.count ?? 0) -
        (firstGenre.count ?? 0)
      )
    })
    .map((genre) => {
      return {
        id: genre.id ?? null,
        name: genre.name,
        count: genre.count ?? 0,
      }
    })

  const tags = [...(artist.tags ?? [])]
    .sort((firstTag, secondTag) => {
      return (
        (secondTag.count ?? 0) -
        (firstTag.count ?? 0)
      )
    })
    .map((tag) => {
      return {
        name: tag.name,
        count: tag.count ?? 0,
      }
    })

  return {
    id: artist.id,
    name: artist.name,
    sortName: artist['sort-name'] ?? artist.name,
    type: artist.type ?? null,
    country: artist.country ?? null,
    disambiguation:
      artist.disambiguation?.trim() || null,
    score: getOptionalScore(artist.score),
    area: mapArtistArea(artist.area),
    beginArea: mapArtistArea(artist['begin-area']),
    lifeSpan: lifeSpan
      ? {
          begin: lifeSpan.begin ?? null,
          end: lifeSpan.end ?? null,
          ended: lifeSpan.ended ?? false,
        }
      : null,
    genres,
    tags,
    musicBrainzUrl:
      `https://musicbrainz.org/artist/${artist.id}`,
  }
}

/*
  Searches MusicBrainz recordings.

  This keeps your existing track-search functionality.
*/
export async function searchRecordings(
  query: string,
): Promise<MusicTrackSearchResult[]> {
  const trimmedQuery = query.trim()

  if (!trimmedQuery) {
    return []
  }

  const parameters = new URLSearchParams({
    query: trimmedQuery,
    fmt: 'json',
    limit: '20',
    dismax: 'true',
  })

  return scheduleMusicBrainzRequest(async () => {
    const response = await fetch(
      `${MUSICBRAINZ_BASE_URL}/recording?${parameters.toString()}`,
      {
        headers: getMusicBrainzHeaders(),
      },
    )

    if (!response.ok) {
      throw new Error(
        `MusicBrainz recording request failed with status ${response.status}`,
      )
    }

    const data =
      (await response.json()) as MusicBrainzRecordingResponse

    return data.recordings.map((recording) => {
      /*
        Prefer an official release.

        If no official release exists, use the first
        available release.
      */
      const release =
        recording.releases?.find(
          (item) => item.status === 'Official',
        ) ??
        recording.releases?.[0]

      const firstArtist =
        recording['artist-credit']?.[0]?.artist

      return {
        id: recording.id,
        title: recording.title,
        artistName: getArtistName(recording),
        artistId: firstArtist?.id ?? null,
        albumTitle:
          release?.title ?? 'Unknown release',
        releaseId: release?.id ?? null,
        durationSec: Math.round(
          (recording.length ?? 0) / 1000,
        ),
        firstReleaseDate:
          recording['first-release-date'] ?? null,
        score: getScore(recording.score),
        musicBrainzUrl:
          `https://musicbrainz.org/recording/${recording.id}`,
      }
    })
  })
}

/*
  Searches for artists by name.

  Example:
  searchArtists('Arijit Singh')
*/
export async function searchArtists(
  query: string,
): Promise<MusicArtistSearchResult[]> {
  const trimmedQuery = query.trim()

  if (!trimmedQuery) {
    return []
  }

  const parameters = new URLSearchParams({
    query: trimmedQuery,
    fmt: 'json',
    limit: '12',
    dismax: 'true',
  })

  return scheduleMusicBrainzRequest(async () => {
    const response = await fetch(
      `${MUSICBRAINZ_BASE_URL}/artist?${parameters.toString()}`,
      {
        headers: getMusicBrainzHeaders(),
      },
    )

    if (!response.ok) {
      throw new Error(
        `MusicBrainz artist search failed with status ${response.status}`,
      )
    }

    const data =
      (await response.json()) as MusicBrainzArtistSearchResponse

    return (data.artists ?? []).map(mapArtist)
  })
}

/*
  Loads full information for one artist by using
  their MusicBrainz artist ID.

  The inc parameter asks MusicBrainz to include genres
  and tags in the response.
*/
export async function getArtistDetails(
  artistId: string,
): Promise<MusicArtistSearchResult> {
  const trimmedArtistId = artistId.trim()

  if (!trimmedArtistId) {
    throw new Error('Artist ID is required.')
  }

  const parameters = new URLSearchParams({
    fmt: 'json',
    inc: 'genres+tags',
  })

  return scheduleMusicBrainzRequest(async () => {
    const response = await fetch(
      `${MUSICBRAINZ_BASE_URL}/artist/${encodeURIComponent(
        trimmedArtistId,
      )}?${parameters.toString()}`,
      {
        headers: getMusicBrainzHeaders(),
      },
    )

    if (response.status === 404) {
      throw new Error('Artist was not found.')
    }

    if (!response.ok) {
      throw new Error(
        `MusicBrainz artist lookup failed with status ${response.status}`,
      )
    }

    const artist =
      (await response.json()) as MusicBrainzArtist

    return mapArtist(artist)
  })
}