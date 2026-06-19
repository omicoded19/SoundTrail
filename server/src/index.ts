import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import { searchRecordings } from './services/musicbrainz.js'

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
*/
app.get('/api/health', (_request, response) => {
  response.json({
    success: true,
    message: 'SoundTrail API is running',
  })
})

/*
  Real recording search.

  Example:
  /api/search/tracks?q=Arijit Singh
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
    console.error('Music search failed:', error)

    response.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Unable to search for music.',
    })
  }
})

app.listen(PORT, () => {
  console.log(
    `SoundTrail server running at http://localhost:${PORT}`,
  )
})