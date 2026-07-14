import express from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'
import { errorHandler } from './middleware/error.middleware.js'
import { createAuthMiddleware } from './middleware/auth.middleware.js'
import { createUserRepository } from './repositories/user.repository.js'
import { createMovieRepository } from './repositories/movie.repository.js'
import { createAuthService } from './services/auth.service.js'
import { createMovieService } from './services/movie.service.js'
import { createAuthController } from './controllers/auth.controller.js'
import { createMovieController } from './controllers/movie.controller.js'
import { createAuthRoutes } from './routes/auth.routes.js'
import { createMovieRoutes } from './routes/movie.routes.js'
import { createShowtimeRepository } from './repositories/showtime.repository.js'
import { createShowtimeService } from './services/showtime.service.js'
import { createShowtimeController } from './controllers/showtime.controller.js'
import { createShowtimeRoutes } from './routes/showtime.routes.js'
import { createSeatRepository } from './repositories/seat.repository.js'
import { createSeatService } from './services/seat.service.js'
import { createSeatController } from './controllers/seat.controller.js'
import { createSeatRoutes } from './routes/seat.routes.js'
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

  const movieRepo = createMovieRepository(prisma)
  const movieService = createMovieService(movieRepo)
  const movieController = createMovieController(movieService)
  const movieRoutes = createMovieRoutes(movieController)

  app.use('/api/movies', movieRoutes)

  const showtimeRepo = createShowtimeRepository(prisma)
  const showtimeService = createShowtimeService(showtimeRepo)
  const showtimeController = createShowtimeController(showtimeService)
  const showtimeRoutes = createShowtimeRoutes(showtimeController)

  const seatRepo = createSeatRepository(prisma)
  const seatService = createSeatService(seatRepo)
  const seatController = createSeatController(seatService)
  const seatRoutes = createSeatRoutes(seatController, authMiddleware)

  app.use('/api/showtimes', showtimeRoutes)
  app.use('/api/showtimes', seatRoutes)

  app.use(errorHandler)

  return app
}
