import { Router } from 'express'
import { createAuthController } from '../controllers/auth.controller.js'

export function createAuthRoutes(
  controller: ReturnType<typeof createAuthController>,
  authMiddleware: (req: any, res: any, next: any) => void,
) {
  const router = Router()

  router.post('/register', controller.register)
  router.post('/login', controller.login)
  router.get('/me', authMiddleware, controller.getMe)

  return router
}
