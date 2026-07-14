import { Router } from 'express'
import type { createShowtimeController } from '../controllers/showtime.controller.js'

export function createShowtimeRoutes(controller: ReturnType<typeof createShowtimeController>) {
  const router = Router()
  router.get('/', controller.getAll)
  router.get('/:id', controller.getById)
  return router
}
