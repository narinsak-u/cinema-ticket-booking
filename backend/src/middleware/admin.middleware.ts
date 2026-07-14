import type { Request, Response, NextFunction } from 'express'

export function adminOnly(req: Request, res: Response, next: NextFunction): void {
  if (req.user?.role !== 'ADMIN') {
    res.status(403).json({ success: false, error: 'Admin access required' })
    return
  }
  next()
}
