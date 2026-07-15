import { Server as HttpServer } from 'http'
import { Server } from 'socket.io'
import { createSocketHandlers } from './handlers.js'
import { env } from '../config/env.js'

export function createSocketServer(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: { origin: env.CORS_ORIGIN, methods: ['GET', 'POST'] },
  })

  createSocketHandlers(io)

  return io
}
