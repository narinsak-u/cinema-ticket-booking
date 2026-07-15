import type { Request, Response } from 'express'
import type { createShowtimeService } from '../services/showtime.service.js'

/**
 * Creates controller handlers for showtime endpoints.
 * Delegates to the showtime service for business logic.
 */
export function createShowtimeController(showtimeService: ReturnType<typeof createShowtimeService>) {
  return {
    async getAll(req: Request, res: Response) {
      const limit = req.query?.limit ? Number(req.query.limit) : undefined
      const offset = req.query?.offset ? Number(req.query.offset) : undefined
      const result = await showtimeService.getAll(limit, offset)
      res.json(result)
    },
    async getById(req: Request, res: Response) {
      const result = await showtimeService.getById(req.params.id as string)
      res.json(result)
    },
  }
}
