import type { Server } from 'socket.io'

export function createSocketHandlers(io: Server) {
  io.on('connection', (socket) => {
    socket.on('join', (showtimeId: string) => {
      socket.join(showtimeId)
    })

    socket.on('leave', (showtimeId: string) => {
      socket.leave(showtimeId)
    })
  })
}

export function broadcastSeatReleased(io: Server, showtimeId: string, seatNo: string) {
  io.to(showtimeId).emit('seat:released', { showtimeId, seatNo })
}
