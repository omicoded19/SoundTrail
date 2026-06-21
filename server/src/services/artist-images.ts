type AudioDbArtist = {
  idArtist?: string
  strArtist?: string
  strArtistThumb?: string | null
  strArtistFanart?: string | null
  strArtistBanner?: string | null
  strMusicBrainzID?: string | null
}

type AudioDbSearchResponse = {
  artists?: AudioDbArtist[] | null
}

export type ArtistImageResult = {
  artistName: string | null
  imageUrl: string | null
  bannerUrl: string | null
  sourceUrl: string | null
}

const AUDIO_DB_BASE_URL =
  'https://www.theaudiodb.com/api/v1/json'

const AUDIO_DB_API_KEY =
  process.env.THEAUDIODB_API_KEY ?? '123'

/*
  Cache promises rather than only completed results.

  This prevents duplicate requests when several parts
  of SoundTrail ask for the same artist simultaneously.
*/
const artistImageCache = new Map<
  string,
  Promise<ArtistImageResult>
>()

function normalizeArtistName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
}

function createEmptyResult(): ArtistImageResult {
  return {
    artistName: null,
    imageUrl: null,
    bannerUrl: null,
    sourceUrl: null,
  }
}

function createSourceUrl(
  artistId: string | undefined,
): string | null {
  if (!artistId) {
    return null
  }

  return `https://www.theaudiodb.com/artist/${artistId}`
}

async function requestArtistImage(
  artistName: string,
): Promise<ArtistImageResult> {
  const parameters = new URLSearchParams({
    s: artistName.trim(),
  })

  const controller = new AbortController()

  const timeoutId = setTimeout(() => {
    controller.abort()
  }, 7000)

  try {
    const response = await fetch(
      `${AUDIO_DB_BASE_URL}/${AUDIO_DB_API_KEY}/search.php?${parameters.toString()}`,
      {
        signal: controller.signal,

        headers: {
          Accept: 'application/json',

          'User-Agent':
            'SoundTrail/1.0 (https://github.com/omicoded19/SoundTrail)',
        },
      },
    )

    if (!response.ok) {
      throw new Error(
        `TheAudioDB request failed with status ${response.status}.`,
      )
    }

    const data =
      (await response.json()) as AudioDbSearchResponse

    const artists = data.artists ?? []

    if (artists.length === 0) {
      return createEmptyResult()
    }

    const normalizedRequestedName =
      normalizeArtistName(artistName)

    /*
      Prefer an exact name match.

      The API may sometimes return a similarly named
      artist as its first result.
    */
    const artist =
      artists.find((item) => {
        return (
          typeof item.strArtist === 'string' &&
          normalizeArtistName(item.strArtist) ===
            normalizedRequestedName
        )
      }) ?? artists[0]

    return {
      artistName:
        artist.strArtist?.trim() || null,

      imageUrl:
        artist.strArtistThumb ??
        artist.strArtistFanart ??
        null,

      bannerUrl:
        artist.strArtistFanart ??
        artist.strArtistBanner ??
        null,

      sourceUrl:
        createSourceUrl(artist.idArtist),
    }
  } finally {
    clearTimeout(timeoutId)
  }
}

export async function getArtistImage(
  artistName: string,
): Promise<ArtistImageResult> {
  const trimmedName = artistName.trim()

  if (!trimmedName) {
    return createEmptyResult()
  }

  const cacheKey =
    normalizeArtistName(trimmedName)

  const cachedRequest =
    artistImageCache.get(cacheKey)

  if (cachedRequest) {
    return cachedRequest
  }

  const imageRequest = requestArtistImage(
    trimmedName,
  ).catch((error: unknown) => {
    /*
      Artist images are optional.

      A failed image request must never make the main
      MusicBrainz artist search fail.
    */
    console.warn(
      `Artist image lookup failed for "${trimmedName}":`,
      error,
    )

    artistImageCache.delete(cacheKey)

    return createEmptyResult()
  })

  artistImageCache.set(
    cacheKey,
    imageRequest,
  )

  return imageRequest
}