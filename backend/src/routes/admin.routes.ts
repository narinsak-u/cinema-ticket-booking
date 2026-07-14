import { Router } from 'express'
import type { createAdminController } from '../controllers/admin.controller.js'

export function createAdminRoutes(
  controller: ReturnType<typeof createAdminController>,
  authMiddleware: (req: any, res: any, next: any) => void,
  adminMiddleware: (req: any, res: any, next: any) => void,
) {
  const router = Router()
  router.use(authMiddleware, adminMiddleware)
  router.get('/bookings', controller.getBookings)
  router.get('/logs', controller.getLogs)
  return router
}
