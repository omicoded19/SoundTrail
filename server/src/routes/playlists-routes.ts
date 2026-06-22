import { Router } from 'express'

import {
  addTrackToPlaylist,
  createPlaylist,
  deletePlaylist,
  getPlaylist,
  getPlaylists,
  removeTrackFromPlaylist,
  updatePlaylist,
} from '../controllers/playlists-controller.js'

import {
  requireAuth,
} from '../middleware/require-auth.js'

const playlistsRouter =
  Router()

playlistsRouter.use(
  requireAuth,
)

playlistsRouter.get(
  '/',
  getPlaylists,
)

playlistsRouter.post(
  '/',
  createPlaylist,
)

playlistsRouter.get(
  '/:playlistId',
  getPlaylist,
)

playlistsRouter.patch(
  '/:playlistId',
  updatePlaylist,
)

playlistsRouter.delete(
  '/:playlistId',
  deletePlaylist,
)

playlistsRouter.post(
  '/:playlistId/tracks',
  addTrackToPlaylist,
)

playlistsRouter.delete(
  '/:playlistId/tracks/:trackId',
  removeTrackFromPlaylist,
)

export default playlistsRouter