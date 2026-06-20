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
  Clean track shape returned by the SoundTrail backend.
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
  Clean artist shapes returned by the SoundTrail backend.
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
  MusicBrainz asks applications to limit how frequently
  they send requests.

  This queue sends MusicBrainz requests one at a time.
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

/*
  Returns the complete artist-credit text.

  This preserves collaborations such as:

  Artist A feat. Artist B
*/
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

/*
  Prefer an official release when MusicBrainz provides
  multiple releases for the same recording.
*/
function getPreferredRelease(
  recording: MusicBrainzRecording,
): MusicBrainzRelease | undefined {
  return (
    recording.releases?.find(
      (release) => release.status === 'Official',
    ) ??
    recording.releases?.[0]
  )
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
  Converts one MusicBrainz recording into the simpler
  SoundTrail track format.
*/
function mapRecording(
  recording: MusicBrainzRecording,
): MusicTrackSearchResult {
  const release = getPreferredRelease(recording)

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
}

/*
  Creates a consistent key for duplicate detection.

  Examples:

  "Tum Hi Ho"
  "tum hi ho"
  "  Tum   Hi   Ho  "

  all become the same key.
*/
function normalizeRecordingTitle(
  title: string,
): string {
  return title
    .normalize('NFKC')
    .trim()
    .toLocaleLowerCase()
    .replace(/\s+/g, ' ')
}

/*
  Gives better-quality recording entries a higher score.

  When duplicate titles exist, SoundTrail keeps the
  recording containing more useful metadata.
*/
function getRecordingQuality(
  recording: MusicBrainzRecording,
): number {
  let quality = 0

  const preferredRelease =
    getPreferredRelease(recording)

  if (
    preferredRelease?.status === 'Official'
  ) {
    quality += 4
  }

  if (
    recording.length !== undefined &&
    recording.length > 0
  ) {
    quality += 2
  }

  if (recording['first-release-date']) {
    quality += 2
  }

  if (preferredRelease?.title) {
    quality += 1
  }

  if (
    recording['artist-credit'] &&
    recording['artist-credit'].length > 0
  ) {
    quality += 1
  }

  return quality
}

/*
  Chooses which recording should be kept when two
  recordings have the same normalized title.
*/
function shouldReplaceRecording(
  existingRecording: MusicBrainzRecording,
  candidateRecording: MusicBrainzRecording,
): boolean {
  const existingQuality =
    getRecordingQuality(existingRecording)

  const candidateQuality =
    getRecordingQuality(candidateRecording)

  if (candidateQuality !== existingQuality) {
    return candidateQuality > existingQuality
  }

  const existingScore =
    getScore(existingRecording.score)

  const candidateScore =
    getScore(candidateRecording.score)

  if (candidateScore !== existingScore) {
    return candidateScore > existingScore
  }

  const existingDate =
    existingRecording['first-release-date']

  const candidateDate =
    candidateRecording['first-release-date']

  /*
    Prefer an entry with a release date.
  */
  if (!existingDate && candidateDate) {
    return true
  }

  if (existingDate && !candidateDate) {
    return false
  }

  /*
    When both have dates, prefer the earlier recording.
  */
  if (existingDate && candidateDate) {
    return candidateDate < existingDate
  }

  return false
}

/*
  Removes duplicate recording titles while preserving
  the best available MusicBrainz entry.
*/
function removeDuplicateRecordings(
  recordings: MusicBrainzRecording[],
): MusicBrainzRecording[] {
  const uniqueRecordings =
    new Map<string, MusicBrainzRecording>()

  for (const recording of recordings) {
    const normalizedTitle =
      normalizeRecordingTitle(recording.title)

    const existingRecording =
      uniqueRecordings.get(normalizedTitle)

    if (!existingRecording) {
      uniqueRecordings.set(
        normalizedTitle,
        recording,
      )

      continue
    }

    if (
      shouldReplaceRecording(
        existingRecording,
        recording,
      )
    ) {
      uniqueRecordings.set(
        normalizedTitle,
        recording,
      )
    }
  }

  return [...uniqueRecordings.values()]
}

/*
  General track search.

  dismax is used here because the user enters ordinary
  track names instead of advanced search syntax.
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

    return data.recordings.map(mapRecording)
  })
}

/*
  Loads recordings credited to one exact artist.

  This function does not use dismax because arid is
  advanced MusicBrainz search syntax.
*/
export async function getArtistRecordings(
  artistId: string,
): Promise<MusicTrackSearchResult[]> {
  const trimmedArtistId = artistId.trim()

  if (!trimmedArtistId) {
    throw new Error('Artist ID is required.')
  }

  const parameters = new URLSearchParams({
    query: `arid:${trimmedArtistId}`,
    fmt: 'json',
    limit: '50',
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
        `MusicBrainz artist recordings request failed with status ${response.status}`,
      )
    }

    const data =
      (await response.json()) as MusicBrainzRecordingResponse

    /*
      Keep only recordings where the selected artist
      appears inside the artist-credit information.
    */
    const verifiedRecordings =
      data.recordings.filter((recording) => {
        return recording['artist-credit']?.some(
          (credit) => {
            return (
              credit.artist?.id ===
              trimmedArtistId
            )
          },
        )
      })

    const uniqueRecordings =
      removeDuplicateRecordings(
        verifiedRecordings,
      )

    return uniqueRecordings
      .map(mapRecording)
      .sort((firstTrack, secondTrack) => {
        /*
          Show newer recordings first when both tracks
          have a known release date.
        */
        if (
          firstTrack.firstReleaseDate &&
          secondTrack.firstReleaseDate
        ) {
          const dateComparison =
            secondTrack.firstReleaseDate.localeCompare(
              firstTrack.firstReleaseDate,
            )

          if (dateComparison !== 0) {
            return dateComparison
          }
        }

        /*
          Tracks with known dates appear before tracks
          whose dates are unavailable.
        */
        if (
          firstTrack.firstReleaseDate &&
          !secondTrack.firstReleaseDate
        ) {
          return -1
        }

        if (
          !firstTrack.firstReleaseDate &&
          secondTrack.firstReleaseDate
        ) {
          return 1
        }

        /*
          Use MusicBrainz search score as the next
          ordering rule.
        */
        if (
          firstTrack.score !==
          secondTrack.score
        ) {
          return (
            secondTrack.score -
            firstTrack.score
          )
        }

        return firstTrack.title.localeCompare(
          secondTrack.title,
        )
      })
      .slice(0, 20)
  })
}

/*
  Searches for artists by name.
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
  Loads complete information for one artist.
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