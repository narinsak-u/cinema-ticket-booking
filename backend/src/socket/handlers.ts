import type { Server } from 'socket.io'

/**
 * Registers `join` and `leave` event handlers on Socket.IO connections.
 * Clients join/leave rooms keyed by showtimeId to receive seat updates.
 */
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

/** Emits `seat:locked` event to all clients viewing the showtime. */
export function broadcastSeatLocked(io: Server, showtimeId: string, seatNo: string, userId: string) {
  io.to(showtimeId).emit('seat:locked', { showtimeId, seatNo, userId })
}

/** Emits `seat:booked` event to all clients viewing the showtime. */
export function broadcastSeatBooked(io: Server, showtimeId: string, seatNo: string, userId: string) {
  io.to(showtimeId).emit('seat:booked', { showtimeId, seatNo, userId })
}

/** Emits `seat:released` event to all clients viewing the showtime. */
export function broadcastSeatReleased(io: Server, showtimeId: string, seatNo: string) {
  io.to(showtimeId).emit('seat:released', { showtimeId, seatNo })
}
