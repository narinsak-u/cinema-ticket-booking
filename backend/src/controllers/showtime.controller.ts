import type { Request, Response } from 'express'
import type { IShowtimeRepository } from '../repositories/showtime.repository.js'

export function createShowtimeController(showtimeRepo: IShowtimeRepository) {
  return {
    async getAll(req: Request, res: Response) {
      const limit = req.query?.limit ? Number(req.query.limit) : undefined
      const offset = req.query?.offset ? Number(req.query.offset) : undefined
      const showtimes = await showtimeRepo.findAll(limit, offset)
      res.json({ success: true, data: showtimes })
    },
    async getById(req: Request, res: Response) {
      const showtime = await showtimeRepo.findById(req.params.id as string)
      if (!showtime) {
        res.json({ success: false, error: 'Showtime not found' })
        return
      }
      res.json({ success: true, data: showtime })
    },
  }
}
