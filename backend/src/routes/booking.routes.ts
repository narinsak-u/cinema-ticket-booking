import { Router } from 'express'
import type { createBookingController } from '../controllers/booking.controller.js'

export function createBookingRoutes(
  controller: ReturnType<typeof createBookingController>,
  authMiddleware: (req: any, res: any, next: any) => void,
) {
  const router = Router()
  router.post('/', authMiddleware, controller.create)
  router.post('/payment', authMiddleware, controller.payment)
  return router
}
