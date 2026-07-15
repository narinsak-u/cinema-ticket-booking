import { describe, it, expect, vi } from 'vitest'
import { broadcastSeatLocked, broadcastSeatReleased, broadcastSeatBooked } from '../socket/handlers.js'

describe('Socket broadcast helpers', () => {
  it('broadcastSeatLocked emits to showtime room', () => {
    const mockIo = { to: vi.fn().mockReturnThis(), emit: vi.fn() }
    broadcastSeatLocked(mockIo as any, 's1', 'A1', 'u1')
    expect(mockIo.to).toHaveBeenCalledWith('s1')
    expect(mockIo.emit).toHaveBeenCalledWith('seat:locked', { showtimeId: 's1', seatNo: 'A1', userId: 'u1' })
  })

  it('broadcastSeatReleased emits to showtime room', () => {
    const mockIo = { to: vi.fn().mockReturnThis(), emit: vi.fn() }
    broadcastSeatReleased(mockIo as any, 's1', 'A1')
    expect(mockIo.emit).toHaveBeenCalledWith('seat:released', { showtimeId: 's1', seatNo: 'A1' })
  })

  it('broadcastSeatBooked emits to showtime room', () => {
    const mockIo = { to: vi.fn().mockReturnThis(), emit: vi.fn() }
    broadcastSeatBooked(mockIo as any, 's1', 'A1', 'u1')
    expect(mockIo.emit).toHaveBeenCalledWith('seat:booked', { showtimeId: 's1', seatNo: 'A1', userId: 'u1' })
  })
})
