/*
  The shapes below describe the parts of the
  MusicBrainz response that SoundTrail needs.
*/

type MusicBrainzArtist = {
  id: string
  name: string
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

/*
  This is the simpler format returned by our own API.

  The React frontend will use this shape instead of
  depending directly on MusicBrainz field names.
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

const MUSICBRAINZ_BASE_URL =
  'https://musicbrainz.org/ws/2'

/*
  MusicBrainz asks clients not to exceed one request
  per second.

  This promise queue ensures that simultaneous requests
  are sent one after another.
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
    Keep the queue moving even when one request fails.
  */
  requestQueue = scheduledRequest.then(
    () => undefined,
    () => undefined,
  )

  return scheduledRequest
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

function getScore(score: number | string | undefined) {
  const numericScore = Number(score)

  return Number.isFinite(numericScore)
    ? numericScore
    : 0
}

export async function searchRecordings(
  query: string,
): Promise<MusicTrackSearchResult[]> {
  const trimmedQuery = query.trim()

  if (!trimmedQuery) {
    return []
  }

  const contact = process.env.MUSICBRAINZ_CONTACT

  if (!contact) {
    throw new Error(
      'MUSICBRAINZ_CONTACT is missing from server/.env',
    )
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
        headers: {
          Accept: 'application/json',
          'User-Agent': `SoundTrail/1.0 (${contact})`,
        },
      },
    )

    if (!response.ok) {
      throw new Error(
        `MusicBrainz request failed with status ${response.status}`,
      )
    }

    const data =
      (await response.json()) as MusicBrainzRecordingResponse

    return data.recordings.map((recording) => {
      /*
        Prefer an official release.

        If none is marked official, use the first available one.
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