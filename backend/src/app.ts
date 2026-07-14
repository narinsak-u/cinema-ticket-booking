import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
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
import { createBookingRepository } from './repositories/booking.repository.js'
import { createBookingService } from './services/booking.service.js'
import { createBookingController } from './controllers/booking.controller.js'
import { createBookingRoutes } from './routes/booking.routes.js'
import { redis } from './redis/client.js'
import { createRedisLock } from './redis/lock.js'
import { env } from './config/env.js'
import { createSocketServer } from './socket/index.js'
import { startExpirationWorker } from './queue/worker.js'
import { connectQueue, createQueueProducer, startConsumers } from './queue/index.js'
import { createAuditLogRepository } from './repositories/audit-log.repository.js'
import { createAdminService } from './services/admin.service.js'
import { createAdminController } from './controllers/admin.controller.js'
import { createAdminRoutes } from './routes/admin.routes.js'
import { adminOnly } from './middleware/admin.middleware.js'

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

  const bookingRepo = createBookingRepository(prisma)
  const auditLogRepo = createAuditLogRepository(prisma)
  const redisLock = createRedisLock(redis, 300)

  const httpServer = createServer(app)
  const io = createSocketServer(httpServer)

  const bookingService = createBookingService(bookingRepo, seatRepo, redisLock, io)
  const bookingController = createBookingController(bookingService)
  const bookingRoutes = createBookingRoutes(bookingController, authMiddleware)

  app.use('/api/bookings', bookingRoutes)

  const adminService = createAdminService(bookingRepo, auditLogRepo)
  const adminController = createAdminController(adminService)
  const adminRoutes = createAdminRoutes(adminController, authMiddleware, adminOnly)

  app.use('/api/admin', adminRoutes)

  app.use(errorHandler)

  const cleanup = startExpirationWorker(bookingRepo, seatRepo, redisLock, io)

  // ponytail: queue connects asynchronously; failed connection = no audit logging, app still starts
  connectQueue()
    .then(({ channel }) => {
      startConsumers(channel, auditLogRepo)
    })
    .catch((err) => console.error('Failed to connect to RabbitMQ:', err))

  return { app, httpServer, io, cleanup, prisma }
}
