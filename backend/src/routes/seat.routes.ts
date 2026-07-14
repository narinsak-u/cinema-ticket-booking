import { Router } from 'express'
import type { createSeatController } from '../controllers/seat.controller.js'

export function createSeatRoutes(
  controller: ReturnType<typeof createSeatController>,
  authMiddleware: (req: any, res: any, next: any) => void,
) {
  const router = Router()
  router.get('/:showtimeId/seats', authMiddleware, controller.getSeatMap)
  return router
}
