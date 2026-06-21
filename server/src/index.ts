import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import {
  getArtistDetails,
  getArtistRecordings,
  searchArtists,
} from './services/musicbrainz.js'

import { searchITunesTracks } from './services/itunes.js'

dotenv.config()

const app = express()

const PORT = Number(process.env.PORT) || 4000

/*
  CLIENT_URL will contain the deployed frontend URL.

  Multiple frontend URLs can be provided by separating
  them with commas.
*/
const productionClientUrls = (
  process.env.CLIENT_URL ?? ''
)
  .split(',')
  .map((url) => url.trim())
  .filter(Boolean)

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  ...productionClientUrls,
]

app.use(
  cors({
    origin(origin, callback) {
      /*
        Requests without an Origin header include tools
        such as Postman and Render's health checker.
      */
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

/*
  Health check.

  GET /api/health
*/
app.get('/api/health', (_request, response) => {
  response.json({
    success: true,
    message: 'SoundTrail API is running',
  })
})

/*
  Search playable iTunes previews.

  GET /api/search/tracks?q=Arijit Singh
*/
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
      const tracks =
        await searchITunesTracks(query)

      response.json({
        success: true,
        query,
        count: tracks.length,
        tracks,
      })
    } catch (error) {
      console.error(
        'Track search failed:',
        error,
      )

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

/*
  Search MusicBrainz artists.

  GET /api/search/artists?q=Arijit Singh
*/
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
      const artists =
        await searchArtists(query)

      response.json({
        success: true,
        query,
        count: artists.length,
        artists,
      })
    } catch (error) {
      console.error(
        'Artist search failed:',
        error,
      )

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

/*
  Get recordings belonging to one MusicBrainz artist.

  GET /api/artists/:artistId/tracks
*/
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

/*
  Get one MusicBrainz artist profile.

  GET /api/artists/:artistId
*/
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
      const artist =
        await getArtistDetails(artistId)

      response.json({
        success: true,
        artist,
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

/*
  Render requires the server to listen on 0.0.0.0.
*/
app.listen(PORT, '0.0.0.0', () => {
  console.log(
    `SoundTrail server running on port ${PORT}`,
  )
})