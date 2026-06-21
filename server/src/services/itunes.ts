type ITunesTrack = {
  wrapperType?: string
  kind?: string
  trackId?: number
  artistId?: number
  collectionId?: number
  trackName?: string
  artistName?: string
  collectionName?: string
  artworkUrl100?: string
  previewUrl?: string
  trackViewUrl?: string
  trackTimeMillis?: number
  releaseDate?: string
  primaryGenreName?: string
  trackExplicitness?: string
  country?: string
}

type ITunesSearchResponse = {
  resultCount: number
  results: ITunesTrack[]
}

export type ITunesTrackResult = {
  id: string
  title: string
  artistId: string | null
  artistName: string
  albumId: string | null
  albumTitle: string
  artworkUrl: string
  previewUrl: string
  externalUrl: string | null
  durationSec: number
  releaseDate: string | null
  genre: string | null
  explicit: boolean
  source: 'itunes'
}

const ITUNES_SEARCH_URL =
  'https://itunes.apple.com/search'

function getLargeArtworkUrl(
  artworkUrl: string | undefined,
): string {
  if (!artworkUrl) {
    return ''
  }

  return artworkUrl.replace(
    /100x100(?:bb)?/,
    '600x600bb',
  )
}

function mapITunesTrack(
  track: ITunesTrack,
): ITunesTrackResult | null {
  /*
    Reject results that cannot actually be played.
  */
  if (
    track.trackId === undefined ||
    !track.trackName ||
    !track.artistName ||
    !track.previewUrl
  ) {
    return null
  }

  return {
    id: `itunes-${track.trackId}`,

    title: track.trackName,

    artistId:
      track.artistId !== undefined
        ? `itunes-artist-${track.artistId}`
        : null,

    artistName: track.artistName,

    albumId:
      track.collectionId !== undefined
        ? `itunes-album-${track.collectionId}`
        : null,

    albumTitle:
      track.collectionName ??
      'Unknown album',

    artworkUrl: getLargeArtworkUrl(
      track.artworkUrl100,
    ),

    previewUrl: track.previewUrl,

    externalUrl:
      track.trackViewUrl ?? null,

    durationSec: Math.round(
      (track.trackTimeMillis ?? 0) / 1000,
    ),

    releaseDate:
      track.releaseDate ?? null,

    genre:
      track.primaryGenreName ?? null,

    explicit:
      track.trackExplicitness === 'explicit',

    source: 'itunes',
  }
}

function removeDuplicateTracks(
  tracks: ITunesTrackResult[],
): ITunesTrackResult[] {
  const uniqueTracks =
    new Map<string, ITunesTrackResult>()

  for (const track of tracks) {
    const key = [
      track.title.trim().toLowerCase(),
      track.artistName.trim().toLowerCase(),
    ].join('::')

    if (!uniqueTracks.has(key)) {
      uniqueTracks.set(key, track)
    }
  }

  return [...uniqueTracks.values()]
}

async function searchStorefront(
  query: string,
  country: string,
  limit: number,
): Promise<ITunesTrackResult[]> {
  const parameters = new URLSearchParams({
    term: query,
    media: 'music',
    entity: 'song',
    limit: limit.toString(),
    country,
    explicit: 'Yes',
  })

  const response = await fetch(
    `${ITUNES_SEARCH_URL}?${parameters.toString()}`,
    {
      headers: {
        Accept: 'application/json',
      },
    },
  )

  if (!response.ok) {
    throw new Error(
      `iTunes search failed with status ${response.status}`,
    )
  }

  const data =
    (await response.json()) as ITunesSearchResponse

  return data.results
    .map(mapITunesTrack)
    .filter(
      (
        track,
      ): track is ITunesTrackResult => {
        return track !== null
      },
    )
}

export async function searchITunesTracks(
  query: string,
  limit = 20,
): Promise<ITunesTrackResult[]> {
  const trimmedQuery = query.trim()

  if (!trimmedQuery) {
    return []
  }

  const safeLimit = Math.max(
    1,
    Math.min(limit, 50),
  )

  /*
    The US storefront usually provides more preview
    URLs. India is searched as a fallback so Indian
    music results can still be included.
  */
  const [usTracks, indiaTracks] =
    await Promise.all([
      searchStorefront(
        trimmedQuery,
        'US',
        safeLimit,
      ),

      searchStorefront(
        trimmedQuery,
        'IN',
        safeLimit,
      ),
    ])

  const combinedTracks =
    removeDuplicateTracks([
      ...usTracks,
      ...indiaTracks,
    ])

  return combinedTracks.slice(0, safeLimit)
}