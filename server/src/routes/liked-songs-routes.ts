import { Router } from 'express'

import {
  addLikedSong,
  getLikedSongs,
  removeLikedSong,
} from '../controllers/liked-songs-controller.js'

import {
  requireAuth,
} from '../middleware/require-auth.js'

const likedSongsRouter =
  Router()

likedSongsRouter.use(
  requireAuth,
)

likedSongsRouter.get(
  '/',
  getLikedSongs,
)

likedSongsRouter.post(
  '/',
  addLikedSong,
)

likedSongsRouter.delete(
  '/:trackId',
  removeLikedSong,
)

export default likedSongsRouter