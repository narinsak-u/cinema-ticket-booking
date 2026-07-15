import type { Request, Response } from 'express'
import type { createMovieService } from '../services/movie.service.js'

/**
 * Creates controller handlers for movie endpoints.
 * Delegates to the movie service for business logic.
 */
export function createMovieController(movieService: ReturnType<typeof createMovieService>) {
  return {
    async getAll(req: Request, res: Response) {
      const limit = req.query?.limit ? Number(req.query.limit) : undefined
      const offset = req.query?.offset ? Number(req.query.offset) : undefined
      const result = await movieService.getAll(limit, offset)
      res.json(result)
    },
    async getById(req: Request, res: Response) {
      const result = await movieService.getById(req.params.id as string)
      res.json(result)
    },
  }
}
