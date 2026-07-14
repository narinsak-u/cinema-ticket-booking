import { describe, it, expect, vi } from 'vitest'
import { createShowtimeService } from './showtime.service.js'

describe('ShowtimeService', () => {
  const mockRepo = { findAll: vi.fn(), findById: vi.fn() }
  const service = createShowtimeService(mockRepo as any)

  it('returns all showtimes', async () => {
    mockRepo.findAll.mockResolvedValue([{ id: '1', startTime: new Date() }])
    const result = await service.getAll()
    expect(result.success).toBe(true)
    expect(result.data).toHaveLength(1)
  })

  it('returns error for unknown id', async () => {
    mockRepo.findById.mockResolvedValue(null)
    const result = await service.getById('invalid')
    expect(result.success).toBe(false)
  })
})
