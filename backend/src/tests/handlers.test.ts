import { describe, it, expect, vi } from 'vitest'
import type { Server } from 'socket.io'
import { broadcastSeatReleased } from '../socket/handlers.js'

describe('Socket broadcast helpers', () => {
  it('broadcastSeatReleased emits to showtime room', () => {
    const mockIo = { to: vi.fn().mockReturnThis(), emit: vi.fn() }
    broadcastSeatReleased(mockIo as unknown as Server, 's1', 'A1')
    expect(mockIo.emit).toHaveBeenCalledWith('seat:released', { showtimeId: 's1', seatNo: 'A1' })
  })
})
