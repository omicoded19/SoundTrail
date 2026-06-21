import type {
  NextFunction,
  Request,
  Response,
} from 'express'

import jwt, {
  type JwtPayload,
} from 'jsonwebtoken'

export interface AuthenticatedRequest
  extends Request {
  userId?: string
}

interface AuthTokenPayload
  extends JwtPayload {
  userId?: string
}

export function requireAuth(
  request: AuthenticatedRequest,
  response: Response,
  next: NextFunction,
) {
  const authorizationHeader =
    request.headers.authorization

  if (
    !authorizationHeader ||
    !authorizationHeader.startsWith(
      'Bearer ',
    )
  ) {
    response.status(401).json({
      success: false,
      message:
        'Authentication token is required.',
    })

    return
  }

  const token =
    authorizationHeader
      .slice(7)
      .trim()

  if (!token) {
    response.status(401).json({
      success: false,
      message:
        'Authentication token is required.',
    })

    return
  }

  const jwtSecret =
    process.env.JWT_SECRET?.trim()

  if (!jwtSecret) {
    console.error(
      'JWT_SECRET is missing from server/.env',
    )

    response.status(500).json({
      success: false,
      message:
        'Authentication is not configured.',
    })

    return
  }

  try {
    const decodedToken =
      jwt.verify(
        token,
        jwtSecret,
      ) as AuthTokenPayload

    if (!decodedToken.userId) {
      response.status(401).json({
        success: false,
        message:
          'Invalid authentication token.',
      })

      return
    }

    request.userId =
      decodedToken.userId

    next()
  } catch {
    response.status(401).json({
      success: false,
      message:
        'Authentication token is invalid or expired.',
    })
  }
}