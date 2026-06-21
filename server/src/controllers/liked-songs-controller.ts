import type { Response } from 'express'

import type {
  AuthenticatedRequest,
} from '../middleware/require-auth.js'

import { LikedSong } from '../models/LikedSong.js'

interface LikedSongRequestBody {
  id?: unknown
  title?: unknown
  artistId?: unknown
  artistName?: unknown
  albumId?: unknown
  albumTitle?: unknown
  artworkUrl?: unknown
  durationSec?: unknown
  previewUrl?: unknown
  externalUrl?: unknown
  source?: unknown
}

function getRequiredString(
  value: unknown,
) {
  return typeof value === 'string'
    ? value.trim()
    : ''
}

function getOptionalString(
  value: unknown,
) {
  if (
    typeof value !== 'string' ||
    !value.trim()
  ) {
    return null
  }

  return value.trim()
}

function mapLikedSongToTrack(
  likedSong: {
    trackId: string
    title: string
    artistId: string | null
    artistName: string
    albumId: string | null
    albumTitle: string
    artworkUrl: string
    durationSec: number
    previewUrl: string | null
    externalUrl: string | null
    source: string
  },
) {
  return {
    id: likedSong.trackId,
    title: likedSong.title,
    artistId: likedSong.artistId,
    artistName: likedSong.artistName,
    albumId: likedSong.albumId,
    albumTitle: likedSong.albumTitle,
    artworkUrl: likedSong.artworkUrl,
    durationSec: likedSong.durationSec,
    previewUrl: likedSong.previewUrl,
    externalUrl: likedSong.externalUrl,
    source: likedSong.source,
  }
}

export async function getLikedSongs(
  request: AuthenticatedRequest,
  response: Response,
) {
  try {
    if (!request.userId) {
      response.status(401).json({
        success: false,
        message:
          'User is not authenticated.',
      })

      return
    }

    const likedSongs =
      await LikedSong.find({
        userId: request.userId,
      })
        .sort({
          createdAt: -1,
        })
        .lean()

    response.json({
      success: true,
      count: likedSongs.length,
      tracks: likedSongs.map(
        mapLikedSongToTrack,
      ),
    })
  } catch (error) {
    console.error(
      'Liked songs request failed:',
      error,
    )

    response.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Unable to load liked songs.',
    })
  }
}

export async function addLikedSong(
  request: AuthenticatedRequest,
  response: Response,
) {
  try {
    if (!request.userId) {
      response.status(401).json({
        success: false,
        message:
          'User is not authenticated.',
      })

      return
    }

    const body =
      request.body as LikedSongRequestBody

    const trackId =
      getRequiredString(body.id)

    const title =
      getRequiredString(body.title)

    const artistName =
      getRequiredString(
        body.artistName,
      )

    const albumTitle =
      getRequiredString(
        body.albumTitle,
      )

    const artworkUrl =
      getRequiredString(
        body.artworkUrl,
      )

    const durationSec =
      typeof body.durationSec ===
        'number' &&
      Number.isFinite(
        body.durationSec,
      )
        ? Math.max(
            0,
            Math.round(
              body.durationSec,
            ),
          )
        : 0

    if (
      !trackId ||
      !title ||
      !artistName ||
      !albumTitle
    ) {
      response.status(400).json({
        success: false,
        message:
          'Track ID, title, artist name and album title are required.',
      })

      return
    }

    const likedSong =
      await LikedSong.findOneAndUpdate(
        {
          userId: request.userId,
          trackId,
        },
        {
          $set: {
            title,
            artistId:
              getOptionalString(
                body.artistId,
              ),
            artistName,
            albumId:
              getOptionalString(
                body.albumId,
              ),
            albumTitle,
            artworkUrl,
            durationSec,
            previewUrl:
              getOptionalString(
                body.previewUrl,
              ),
            externalUrl:
              getOptionalString(
                body.externalUrl,
              ),
            source:
              getRequiredString(
                body.source,
              ) || 'itunes',
          },

          $setOnInsert: {
            userId:
              request.userId,
            trackId,
          },
        },
        {
          new: true,
          upsert: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        },
      )

    if (!likedSong) {
      response.status(500).json({
        success: false,
        message:
          'Unable to save the liked song.',
      })

      return
    }

    response.status(201).json({
      success: true,
      message:
        'Song added to liked songs.',
      track:
        mapLikedSongToTrack(
          likedSong,
        ),
    })
  } catch (error) {
    console.error(
      'Add liked song failed:',
      error,
    )

    response.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Unable to save the liked song.',
    })
  }
}

export async function removeLikedSong(
  request: AuthenticatedRequest,
  response: Response,
) {
  try {
    if (!request.userId) {
      response.status(401).json({
        success: false,
        message:
          'User is not authenticated.',
      })

      return
    }

    const trackId =
      typeof request.params.trackId ===
      'string'
        ? request.params.trackId.trim()
        : ''

    if (!trackId) {
      response.status(400).json({
        success: false,
        message:
          'Track ID is required.',
      })

      return
    }

    const deletedSong =
      await LikedSong.findOneAndDelete({
        userId: request.userId,
        trackId,
      })

    response.json({
      success: true,
      removed:
        Boolean(deletedSong),
      message: deletedSong
        ? 'Song removed from liked songs.'
        : 'Song was not in liked songs.',
    })
  } catch (error) {
    console.error(
      'Remove liked song failed:',
      error,
    )

    response.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Unable to remove the liked song.',
    })
  }
}