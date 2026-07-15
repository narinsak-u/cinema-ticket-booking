import type { Request, Response } from 'express'
import type { ISeatRepository } from '../repositories/seat.repository.js'

export function createSeatController(seatRepo: ISeatRepository) {
  return {
    async getSeatMap(req: Request, res: Response) {
      const seats = await seatRepo.findByShowtime(req.params.showtimeId as string)
      res.json({ success: true, data: seats })
    },
  }
}
