import { Router } from 'express'

import {
  getCurrentUser,
  loginUser,
  registerUser,
} from '../controllers/auth-controller.js'

import {
  requireAuth,
} from '../middleware/require-auth.js'

const authRouter = Router()

authRouter.post(
  '/register',
  registerUser,
)

authRouter.post(
  '/login',
  loginUser,
)

authRouter.get(
  '/me',
  requireAuth,
  getCurrentUser,
)

export default authRouter