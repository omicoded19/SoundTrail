import type { Response } from 'express'

import mongoose, {
  type HydratedDocument,
} from 'mongoose'

import type {
  AuthenticatedRequest,
} from '../middleware/require-auth.js'

import {
  Playlist,
  type PlaylistDocument,
  type PlaylistTrack,
} from '../models/Playlist.js'

interface CreatePlaylistBody {
  name?: unknown
  description?: unknown
}

interface UpdatePlaylistBody {
  name?: unknown
  description?: unknown
}

interface AddPlaylistTrackBody {
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

function mapPlaylist(
  playlist: HydratedDocument<PlaylistDocument>,
) {
  return {
    id: playlist._id.toString(),
    name: playlist.name,
    description:
      playlist.description,
    tracks: playlist.tracks,
    trackCount:
      playlist.tracks.length,
    createdAt:
      playlist.createdAt,
    updatedAt:
      playlist.updatedAt,
  }
}

function validatePlaylistId(
  playlistId: string,
) {
  return mongoose.isValidObjectId(
    playlistId,
  )
}

export async function getPlaylists(
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

    const playlists =
      await Playlist.find({
        userId: request.userId,
      }).sort({
        updatedAt: -1,
      })

    response.json({
      success: true,
      count: playlists.length,
      playlists:
        playlists.map(
          mapPlaylist,
        ),
    })
  } catch (error) {
    console.error(
      'Playlist list request failed:',
      error,
    )

    response.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Unable to load playlists.',
    })
  }
}

export async function getPlaylist(
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

    const playlistId =
      typeof request.params
        .playlistId === 'string'
        ? request.params.playlistId.trim()
        : ''

    if (
      !playlistId ||
      !validatePlaylistId(
        playlistId,
      )
    ) {
      response.status(400).json({
        success: false,
        message:
          'A valid playlist ID is required.',
      })

      return
    }

    const playlist =
      await Playlist.findOne({
        _id: playlistId,
        userId: request.userId,
      })

    if (!playlist) {
      response.status(404).json({
        success: false,
        message:
          'Playlist was not found.',
      })

      return
    }

    response.json({
      success: true,
      playlist:
        mapPlaylist(playlist),
    })
  } catch (error) {
    console.error(
      'Playlist request failed:',
      error,
    )

    response.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Unable to load the playlist.',
    })
  }
}

export async function createPlaylist(
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
      request.body as CreatePlaylistBody

    const name =
      getRequiredString(body.name)

    const description =
      getRequiredString(
        body.description,
      )

    if (!name) {
      response.status(400).json({
        success: false,
        message:
          'Playlist name is required.',
      })

      return
    }

    if (name.length > 60) {
      response.status(400).json({
        success: false,
        message:
          'Playlist name must not exceed 60 characters.',
      })

      return
    }

    if (
      description.length > 240
    ) {
      response.status(400).json({
        success: false,
        message:
          'Playlist description must not exceed 240 characters.',
      })

      return
    }

    const playlist =
      await Playlist.create({
        userId: request.userId,
        name,
        description,
        tracks: [],
      })

    response.status(201).json({
      success: true,
      message:
        'Playlist created successfully.',
      playlist:
        mapPlaylist(playlist),
    })
  } catch (error) {
    console.error(
      'Playlist creation failed:',
      error,
    )

    response.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Unable to create the playlist.',
    })
  }
}

export async function updatePlaylist(
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

    const playlistId =
      typeof request.params
        .playlistId === 'string'
        ? request.params.playlistId.trim()
        : ''

    if (
      !playlistId ||
      !validatePlaylistId(
        playlistId,
      )
    ) {
      response.status(400).json({
        success: false,
        message:
          'A valid playlist ID is required.',
      })

      return
    }

    const body =
      request.body as UpdatePlaylistBody

    const updates: {
      name?: string
      description?: string
    } = {}

    if (
      typeof body.name === 'string'
    ) {
      const name =
        body.name.trim()

      if (!name) {
        response.status(400).json({
          success: false,
          message:
            'Playlist name cannot be empty.',
        })

        return
      }

      if (name.length > 60) {
        response.status(400).json({
          success: false,
          message:
            'Playlist name must not exceed 60 characters.',
        })

        return
      }

      updates.name = name
    }

    if (
      typeof body.description ===
      'string'
    ) {
      const description =
        body.description.trim()

      if (
        description.length > 240
      ) {
        response.status(400).json({
          success: false,
          message:
            'Playlist description must not exceed 240 characters.',
        })

        return
      }

      updates.description =
        description
    }

    if (
      Object.keys(updates).length ===
      0
    ) {
      response.status(400).json({
        success: false,
        message:
          'Playlist name or description is required.',
      })

      return
    }

    const playlist =
      await Playlist.findOneAndUpdate(
        {
          _id: playlistId,
          userId: request.userId,
        },
        {
          $set: updates,
        },
        {
          new: true,
          runValidators: true,
        },
      )

    if (!playlist) {
      response.status(404).json({
        success: false,
        message:
          'Playlist was not found.',
      })

      return
    }

    response.json({
      success: true,
      message:
        'Playlist updated successfully.',
      playlist:
        mapPlaylist(playlist),
    })
  } catch (error) {
    console.error(
      'Playlist update failed:',
      error,
    )

    response.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Unable to update the playlist.',
    })
  }
}

export async function deletePlaylist(
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

    const playlistId =
      typeof request.params
        .playlistId === 'string'
        ? request.params.playlistId.trim()
        : ''

    if (
      !playlistId ||
      !validatePlaylistId(
        playlistId,
      )
    ) {
      response.status(400).json({
        success: false,
        message:
          'A valid playlist ID is required.',
      })

      return
    }

    const deletedPlaylist =
      await Playlist.findOneAndDelete({
        _id: playlistId,
        userId: request.userId,
      })

    if (!deletedPlaylist) {
      response.status(404).json({
        success: false,
        message:
          'Playlist was not found.',
      })

      return
    }

    response.json({
      success: true,
      message:
        'Playlist deleted successfully.',
    })
  } catch (error) {
    console.error(
      'Playlist deletion failed:',
      error,
    )

    response.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Unable to delete the playlist.',
    })
  }
}

export async function addTrackToPlaylist(
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

    const playlistId =
      typeof request.params
        .playlistId === 'string'
        ? request.params.playlistId.trim()
        : ''

    if (
      !playlistId ||
      !validatePlaylistId(
        playlistId,
      )
    ) {
      response.status(400).json({
        success: false,
        message:
          'A valid playlist ID is required.',
      })

      return
    }

    const body =
      request.body as AddPlaylistTrackBody

    const id =
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
      !id ||
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

    const playlist =
      await Playlist.findOne({
        _id: playlistId,
        userId: request.userId,
      })

    if (!playlist) {
      response.status(404).json({
        success: false,
        message:
          'Playlist was not found.',
      })

      return
    }

    const alreadyExists =
      playlist.tracks.some(
        (track) =>
          track.id === id,
      )

    if (alreadyExists) {
      response.status(409).json({
        success: false,
        message:
          'This song is already in the playlist.',
      })

      return
    }

    const track: PlaylistTrack = {
      id,
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

      artworkUrl:
        getRequiredString(
          body.artworkUrl,
        ),

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
    }

    playlist.tracks.push(track)

    await playlist.save()

    response.status(201).json({
      success: true,
      message:
        'Song added to playlist.',
      playlist:
        mapPlaylist(playlist),
    })
  } catch (error) {
    console.error(
      'Adding song to playlist failed:',
      error,
    )

    response.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Unable to add the song to the playlist.',
    })
  }
}

export async function removeTrackFromPlaylist(
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

    const playlistId =
      typeof request.params
        .playlistId === 'string'
        ? request.params.playlistId.trim()
        : ''

    const trackId =
      typeof request.params
        .trackId === 'string'
        ? request.params.trackId.trim()
        : ''

    if (
      !playlistId ||
      !validatePlaylistId(
        playlistId,
      )
    ) {
      response.status(400).json({
        success: false,
        message:
          'A valid playlist ID is required.',
      })

      return
    }

    if (!trackId) {
      response.status(400).json({
        success: false,
        message:
          'Track ID is required.',
      })

      return
    }

    const playlist =
      await Playlist.findOne({
        _id: playlistId,
        userId: request.userId,
      })

    if (!playlist) {
      response.status(404).json({
        success: false,
        message:
          'Playlist was not found.',
      })

      return
    }

    const originalTrackCount =
      playlist.tracks.length

    playlist.tracks =
      playlist.tracks.filter(
        (track) =>
          track.id !== trackId,
      )

    if (
      playlist.tracks.length ===
      originalTrackCount
    ) {
      response.status(404).json({
        success: false,
        message:
          'Song was not found in this playlist.',
      })

      return
    }

    await playlist.save()

    response.json({
      success: true,
      message:
        'Song removed from playlist.',
      playlist:
        mapPlaylist(playlist),
    })
  } catch (error) {
    console.error(
      'Removing song from playlist failed:',
      error,
    )

    response.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Unable to remove the song from the playlist.',
    })
  }
}