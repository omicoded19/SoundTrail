import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import {
  getArtistDetails,
  getArtistRecordings,
  searchArtists,
} from './services/musicbrainz.js'

import { searchITunesTracks } from './services/itunes.js'
import { getArtistImage } from './services/artist-images.js'

dotenv.config()

const app = express()

const PORT = Number(process.env.PORT) || 4000

const productionClientUrls = (process.env.CLIENT_URL ?? '')
  .split(',')
  .map((url) => url.trim())
  .filter(Boolean)

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  ...productionClientUrls,
]

function normalizeArtistName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function getArtistPriority(
  artistName: string,
  query: string,
) {
  const normalizedArtistName =
    normalizeArtistName(artistName)

  const normalizedQuery =
    normalizeArtistName(query)

  if (normalizedArtistName === normalizedQuery) {
    return 0
  }

  if (normalizedArtistName.startsWith(normalizedQuery)) {
    return 1
  }

  if (normalizedArtistName.includes(normalizedQuery)) {
    return 2
  }

  return 3
}

async function getArtistImageSafely(name: string) {
  try {
    return await getArtistImage(name)
  } catch (error) {
    console.error(
      `Artist image request failed for ${name}:`,
      error,
    )

    return {
      artistName: null,
      imageUrl: null,
      bannerUrl: null,
      sourceUrl: null,
    }
  }
}

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        callback(null, true)
        return
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true)
        return
      }

      callback(
        new Error(
          `Origin ${origin} is not allowed by CORS.`,
        ),
      )
    },
    methods: [
      'GET',
      'POST',
      'PUT',
      'PATCH',
      'DELETE',
      'OPTIONS',
    ],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
    ],
  }),
)

app.use(express.json())

app.get('/', (_request, response) => {
  response.json({
    success: true,
    message: 'SoundTrail API',
    health: '/api/health',
  })
})

app.get('/api/health', (_request, response) => {
  response.json({
    success: true,
    message: 'SoundTrail API is running',
  })
})

app.get(
  '/api/search/tracks',
  async (request, response) => {
    const query =
      typeof request.query.q === 'string'
        ? request.query.q.trim()
        : ''

    if (query.length < 2) {
      response.status(400).json({
        success: false,
        message:
          'Search query must contain at least two characters.',
      })

      return
    }

    try {
      const tracks = await searchITunesTracks(query)

      response.json({
        success: true,
        query,
        count: tracks.length,
        tracks,
      })
    } catch (error) {
      console.error('Track search failed:', error)

      response.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Unable to search for tracks.',
      })
    }
  },
)

app.get(
  '/api/search/artists',
  async (request, response) => {
    const query =
      typeof request.query.q === 'string'
        ? request.query.q.trim()
        : ''

    if (query.length < 2) {
      response.status(400).json({
        success: false,
        message:
          'Search query must contain at least two characters.',
      })

      return
    }

    try {
      const artists = await searchArtists(query)

      const sortedArtists = [...artists].sort(
        (firstArtist, secondArtist) => {
          const firstPriority = getArtistPriority(
            firstArtist.name,
            query,
          )

          const secondPriority = getArtistPriority(
            secondArtist.name,
            query,
          )

          if (firstPriority !== secondPriority) {
            return firstPriority - secondPriority
          }

          return (
            (secondArtist.score ?? 0) -
            (firstArtist.score ?? 0)
          )
        },
      )

      const normalizedQuery =
        normalizeArtistName(query)

      const exactArtist = sortedArtists.find(
        (artist) =>
          normalizeArtistName(artist.name) ===
          normalizedQuery,
      )

      const visibleArtists = exactArtist
        ? [exactArtist]
        : sortedArtists.slice(0, 6)

      const primaryArtist =
        visibleArtists[0] ?? null

      const artistImage = primaryArtist
        ? await getArtistImageSafely(
            primaryArtist.name,
          )
        : {
            artistName: null,
            imageUrl: null,
            bannerUrl: null,
            sourceUrl: null,
          }

      const artistsWithImages = visibleArtists.map(
        (artist, index) => ({
          ...artist,
          imageUrl:
            index === 0
              ? artistImage.imageUrl
              : null,
          bannerUrl:
            index === 0
              ? artistImage.bannerUrl
              : null,
          imageSourceUrl:
            index === 0
              ? artistImage.sourceUrl
              : null,
        }),
      )

      response.json({
        success: true,
        query,
        count: artistsWithImages.length,
        artists: artistsWithImages,
      })
    } catch (error) {
      console.error('Artist search failed:', error)

      response.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Unable to search for artists.',
      })
    }
  },
)

app.get(
  '/api/artists/:artistId/tracks',
  async (request, response) => {
    const artistId =
      typeof request.params.artistId === 'string'
        ? request.params.artistId.trim()
        : ''

    if (!artistId) {
      response.status(400).json({
        success: false,
        message: 'Artist ID is required.',
      })

      return
    }

    try {
      const tracks =
        await getArtistRecordings(artistId)

      response.json({
        success: true,
        artistId,
        count: tracks.length,
        tracks,
      })
    } catch (error) {
      console.error(
        'Artist recordings request failed:',
        error,
      )

      response.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Unable to load artist recordings.',
      })
    }
  },
)

app.get(
  '/api/artists/:artistId',
  async (request, response) => {
    const artistId =
      typeof request.params.artistId === 'string'
        ? request.params.artistId.trim()
        : ''

    if (!artistId) {
      response.status(400).json({
        success: false,
        message: 'Artist ID is required.',
      })

      return
    }

    try {
      const artist = await getArtistDetails(artistId)

      const artistImage =
        await getArtistImageSafely(artist.name)

      response.json({
        success: true,
        artist: {
          ...artist,
          imageUrl: artistImage.imageUrl,
          bannerUrl: artistImage.bannerUrl,
          imageSourceUrl:
            artistImage.sourceUrl,
        },
      })
    } catch (error) {
      console.error(
        'Artist details request failed:',
        error,
      )

      const message =
        error instanceof Error
          ? error.message
          : 'Unable to load artist details.'

      const statusCode =
        message === 'Artist was not found.'
          ? 404
          : 500

      response.status(statusCode).json({
        success: false,
        message,
      })
    }
  },
)

app.listen(PORT, '0.0.0.0', () => {
  console.log(
    `SoundTrail server running on port ${PORT}`,
  )
})
