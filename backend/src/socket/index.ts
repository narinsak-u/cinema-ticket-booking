import { Server as HttpServer } from 'http'
import { Server } from 'socket.io'
import { createSocketHandlers } from './handlers.js'

export function createSocketServer(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
  })

  createSocketHandlers(io)

  return io
}
