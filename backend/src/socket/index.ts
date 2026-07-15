import { Server as HttpServer } from 'http'
import { Server } from 'socket.io'
import { createSocketHandlers } from './handlers.js'
import { env } from '../config/env.js'

/**
 * Creates a Socket.IO server attached to the HTTP server.
 * Configures CORS from env and registers event handlers.
 */
export function createSocketServer(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: { origin: env.CORS_ORIGIN, methods: ['GET', 'POST'] },
  })

  createSocketHandlers(io)

  return io
}
