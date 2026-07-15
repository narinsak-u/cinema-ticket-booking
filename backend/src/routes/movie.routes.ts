import { Router } from 'express'
import type { createMovieController } from '../controllers/movie.controller.js'

/** Creates movie routes: GET /, GET /:id. */
export function createMovieRoutes(controller: ReturnType<typeof createMovieController>) {
  const router = Router()
  router.get('/', controller.getAll)
  router.get('/:id', controller.getById)
  return router
}
