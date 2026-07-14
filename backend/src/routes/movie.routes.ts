import { Router } from 'express'
import type { createMovieController } from '../controllers/movie.controller.js'

export function createMovieRoutes(controller: ReturnType<typeof createMovieController>) {
  const router = Router()
  router.get('/', controller.getAll)
  router.get('/:id', controller.getById)
  return router
}
