import { io } from 'socket.io-client'

export const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000')

export function joinShowtime(showtimeId: string) {
  socket.emit('join', showtimeId)
}

export function leaveShowtime(showtimeId: string) {
  socket.emit('leave', showtimeId)
}
