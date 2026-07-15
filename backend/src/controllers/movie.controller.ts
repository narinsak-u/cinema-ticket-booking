import type { Request, Response } from 'express'
import type { IMovieRepository } from '../repositories/movie.repository.js'

export function createMovieController(movieRepo: IMovieRepository) {
  return {
    async getAll(req: Request, res: Response) {
      const limit = req.query?.limit ? Number(req.query.limit) : undefined
      const offset = req.query?.offset ? Number(req.query.offset) : undefined
      const movies = await movieRepo.findAll(limit, offset)
      res.json({ success: true, data: movies })
    },
    async getById(req: Request, res: Response) {
      const movie = await movieRepo.findById(req.params.id as string)
      if (!movie) {
        res.json({ success: false, error: 'Movie not found' })
        return
      }
      res.json({ success: true, data: movie })
    },
  }
}
