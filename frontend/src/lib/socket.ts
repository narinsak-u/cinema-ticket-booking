import { io } from 'socket.io-client'

export const socket = io()

export function joinShowtime(showtimeId: string) {
  socket.emit('join', showtimeId)
}

export function leaveShowtime(showtimeId: string) {
  socket.emit('leave', showtimeId)
}
