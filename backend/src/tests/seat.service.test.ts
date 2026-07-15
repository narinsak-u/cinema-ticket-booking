import { describe, it, expect, vi } from 'vitest'
import { createSeatService } from '../services/seat.service.js'

describe('SeatService', () => {
  const mockRepo = { findByShowtime: vi.fn(), updateStatus: vi.fn() }
  const service = createSeatService(mockRepo as any)

  it('returns seat map for showtime', async () => {
    mockRepo.findByShowtime.mockResolvedValue([{ id: '1', seatNo: 'A1', status: 'AVAILABLE' }])
    const result = await service.getSeatMap('showtime-1')
    expect(result.success).toBe(true)
    expect(result.data).toHaveLength(1)
  })
})
