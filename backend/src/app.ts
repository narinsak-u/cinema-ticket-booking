import express from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'
import { errorHandler } from './middleware/error.middleware.js'
import { createAuthMiddleware } from './middleware/auth.middleware.js'
import { createUserRepository } from './repositories/user.repository.js'
import { createAuthService } from './services/auth.service.js'
import { createAuthController } from './controllers/auth.controller.js'
import { createAuthRoutes } from './routes/auth.routes.js'
import { env } from './config/env.js'

export function createApp() {
  const app = express()

  app.use(cors())
  app.use(express.json())

  const prisma = new PrismaClient()
  const authMiddleware = createAuthMiddleware(env.JWT_SECRET)
  const userRepo = createUserRepository(prisma)
  const authService = createAuthService(userRepo, env.JWT_SECRET)
  const authController = createAuthController(authService)
  const authRoutes = createAuthRoutes(authController, authMiddleware)

  app.use('/api/auth', authRoutes)

  app.use(errorHandler)

  return app
}
