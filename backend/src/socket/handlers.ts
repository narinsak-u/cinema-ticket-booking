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

export function broadcastSeatLocked(io: Server, showtimeId: string, seatNo: string, userId: string) {
  io.to(showtimeId).emit('seat:locked', { showtimeId, seatNo, userId })
}

export function broadcastSeatBooked(io: Server, showtimeId: string, seatNo: string, userId: string) {
  io.to(showtimeId).emit('seat:booked', { showtimeId, seatNo, userId })
}

export function broadcastSeatReleased(io: Server, showtimeId: string, seatNo: string) {
  io.to(showtimeId).emit('seat:released', { showtimeId, seatNo })
}
