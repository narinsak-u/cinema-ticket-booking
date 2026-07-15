import type { Request, Response, NextFunction } from 'express'

/**
 * Express middleware that rejects non-admin users with 403.
 * Must be used after `createAuthMiddleware` so `req.user` is populated.
 */
export function adminOnly(req: Request, res: Response, next: NextFunction): void {
  if (req.user?.role !== 'ADMIN') {
    res.status(403).json({ success: false, error: 'Admin access required' })
    return
  }
  next()
}
