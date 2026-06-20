import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import {
  getArtistDetails,
  getArtistRecordings,
  searchArtists,
  searchRecordings,
} from './services/musicbrainz.js'

dotenv.config()

const app = express()

const PORT = Number(process.env.PORT) || 4000

app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
    ],
  }),
)

app.use(express.json())

/*
  Confirms that the backend is running.

  GET /api/health
*/
app.get('/api/health', (_request, response) => {
  response.json({
    success: true,
    message: 'SoundTrail API is running',
  })
})

/*
  Searches for tracks using an ordinary text query.

  Example:
  GET /api/search/tracks?q=Tum Hi Ho
*/
app.get('/api/search/tracks', async (request, response) => {
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
    const tracks = await searchRecordings(query)

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
})

/*
  Searches for artists.

  Example:
  GET /api/search/artists?q=Arijit Singh
*/
app.get('/api/search/artists', async (request, response) => {
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

    response.json({
      success: true,
      query,
      count: artists.length,
      artists,
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
})

/*
  Returns recordings credited to one exact artist.

  Example:
  GET /api/artists/ARTIST_ID/tracks
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
  Loads one artist using their MusicBrainz ID.

  Example:
  GET /api/artists/ARTIST_ID
*/
app.get('/api/artists/:artistId', async (request, response) => {
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
})

app.listen(PORT, () => {
  console.log(
    `SoundTrail server running at http://localhost:${PORT}`,
  )
})