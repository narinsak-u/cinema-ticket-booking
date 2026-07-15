import type { Request, Response, NextFunction } from 'express'

/**
 * Global Express error handler. Logs the error and returns a 500 response.
 * Catches any unhandled errors that bubble up from routes and middleware.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  console.error('Unhandled error:', err)
  res.status(500).json({ success: false, error: 'Internal server error' })
}
