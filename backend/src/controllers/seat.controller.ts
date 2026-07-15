import type { Request, Response } from 'express'
import type { createSeatService } from '../services/seat.service.js'

/**
 * Creates controller handlers for seat endpoints.
 * Delegates to the seat service for business logic.
 */
export function createSeatController(seatService: ReturnType<typeof createSeatService>) {
  return {
    async getSeatMap(req: Request, res: Response) {
      const result = await seatService.getSeatMap(req.params.showtimeId as string)
      res.json(result)
    },
  }
}
