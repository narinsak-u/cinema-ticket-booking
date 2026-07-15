import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

/** Shape of the JWT payload attached to the request by the auth middleware. */
export interface JwtPayload {
  id: string
  role: string
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}

/**
 * Creates Express middleware that validates Bearer JWTs.
 * Attaches decoded payload to `req.user` on success.
 * Returns 401 with `No token provided` or `Invalid token` on failure.
 */
export function createAuthMiddleware(secret: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const header = req.headers.authorization
    if (!header?.startsWith('Bearer ')) {
      res.status(401).json({ success: false, error: 'No token provided' })
      return
    }

    try {
      const payload = jwt.verify(header.slice(7), secret) as JwtPayload
      req.user = payload
      next()
    } catch {
      res.status(401).json({ success: false, error: 'Invalid token' })
    }
  }
}
