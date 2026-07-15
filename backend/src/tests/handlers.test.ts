import { describe, it, expect, vi } from 'vitest'
import { broadcastSeatReleased } from '../socket/handlers.js'

describe('Socket broadcast helpers', () => {
  it('broadcastSeatReleased emits to showtime room', () => {
    const mockIo = { to: vi.fn().mockReturnThis(), emit: vi.fn() }
    broadcastSeatReleased(mockIo as any, 's1', 'A1')
    expect(mockIo.emit).toHaveBeenCalledWith('seat:released', { showtimeId: 's1', seatNo: 'A1' })
  })
})
