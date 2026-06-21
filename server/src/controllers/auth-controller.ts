import type {
  Request,
  Response,
} from 'express'

import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

import type {
  AuthenticatedRequest,
} from '../middleware/require-auth.js'

import { User } from '../models/User.js'

interface RegisterRequestBody {
  name?: unknown
  email?: unknown
  password?: unknown
}

interface LoginRequestBody {
  email?: unknown
  password?: unknown
}

const EMAIL_PATTERN =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function createAuthToken(
  userId: string,
) {
  const jwtSecret =
    process.env.JWT_SECRET?.trim()

  if (!jwtSecret) {
    throw new Error(
      'JWT_SECRET is missing from server/.env',
    )
  }

  return jwt.sign(
    {
      userId,
    },
    jwtSecret,
    {
      expiresIn: '7d',
    },
  )
}

export async function registerUser(
  request: Request<
    Record<string, never>,
    unknown,
    RegisterRequestBody
  >,
  response: Response,
) {
  try {
    const name =
      typeof request.body.name ===
      'string'
        ? request.body.name.trim()
        : ''

    const email =
      typeof request.body.email ===
      'string'
        ? request.body.email
            .trim()
            .toLowerCase()
        : ''

    const password =
      typeof request.body.password ===
      'string'
        ? request.body.password
        : ''

    if (name.length < 2) {
      response.status(400).json({
        success: false,
        message:
          'Name must contain at least two characters.',
      })

      return
    }

    if (name.length > 50) {
      response.status(400).json({
        success: false,
        message:
          'Name must not exceed 50 characters.',
      })

      return
    }

    if (!EMAIL_PATTERN.test(email)) {
      response.status(400).json({
        success: false,
        message:
          'Please enter a valid email address.',
      })

      return
    }

    if (password.length < 8) {
      response.status(400).json({
        success: false,
        message:
          'Password must contain at least eight characters.',
      })

      return
    }

    const existingUser =
      await User.findOne({
        email,
      }).lean()

    if (existingUser) {
      response.status(409).json({
        success: false,
        message:
          'An account with this email already exists.',
      })

      return
    }

    const passwordHash =
      await bcrypt.hash(
        password,
        12,
      )

    const user =
      await User.create({
        name,
        email,
        passwordHash,
      })

    const token =
      createAuthToken(
        user.id,
      )

    response.status(201).json({
      success: true,
      message:
        'Account created successfully.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    })
  } catch (error) {
    console.error(
      'User registration failed:',
      error,
    )

    const duplicateKeyError =
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 11000

    response
      .status(
        duplicateKeyError
          ? 409
          : 500,
      )
      .json({
        success: false,
        message:
          duplicateKeyError
            ? 'An account with this email already exists.'
            : error instanceof Error
              ? error.message
              : 'Unable to create the account.',
      })
  }
}

export async function loginUser(
  request: Request<
    Record<string, never>,
    unknown,
    LoginRequestBody
  >,
  response: Response,
) {
  try {
    const email =
      typeof request.body.email ===
      'string'
        ? request.body.email
            .trim()
            .toLowerCase()
        : ''

    const password =
      typeof request.body.password ===
      'string'
        ? request.body.password
        : ''

    if (
      !email ||
      !password
    ) {
      response.status(400).json({
        success: false,
        message:
          'Email and password are required.',
      })

      return
    }

    const user =
      await User.findOne({
        email,
      }).select(
        '+passwordHash',
      )

    if (!user) {
      response.status(401).json({
        success: false,
        message:
          'Invalid email or password.',
      })

      return
    }

    const passwordMatches =
      await bcrypt.compare(
        password,
        user.passwordHash,
      )

    if (!passwordMatches) {
      response.status(401).json({
        success: false,
        message:
          'Invalid email or password.',
      })

      return
    }

    const token =
      createAuthToken(
        user.id,
      )

    response.json({
      success: true,
      message:
        'Logged in successfully.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    })
  } catch (error) {
    console.error(
      'User login failed:',
      error,
    )

    response.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Unable to log in.',
    })
  }
}

export async function getCurrentUser(
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

    const user =
      await User.findById(
        request.userId,
      ).select(
        'name email createdAt',
      )

    if (!user) {
      response.status(404).json({
        success: false,
        message:
          'User account was not found.',
      })

      return
    }

    response.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt:
          user.createdAt,
      },
    })
  } catch (error) {
    console.error(
      'Current user request failed:',
      error,
    )

    response.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Unable to load the current user.',
    })
  }
}