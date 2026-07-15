import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { IBookingRepository } from '../repositories/booking.repository.js'
import type { ISeatRepository } from '../repositories/seat.repository.js'
import { createBookingService } from '../services/booking.service.js'

describe('Concurrency: 100 users booking 1 seat', () => {
  const mockBookingRepo = {
    create: vi.fn(),
    findById: vi.fn(),
    findByUser: vi.fn(),
    findExpired: vi.fn(),
    updateStatus: vi.fn(),
  }
  const mockSeatRepo = {
    findByShowtime: vi.fn(),
    updateStatus: vi.fn(),
  }

  let lockStore: Record<string, string> = {}
  const mockRedisLock = {
    acquire: vi.fn(async (key: string, owner: string) => {
      if (lockStore[key]) return false
      lockStore[key] = owner
      return true
    }),
    release: vi.fn(async (key: string, owner: string) => {
      if (lockStore[key] === owner) {
        delete lockStore[key]
        return true
      }
      return false
    }),
  }

  const service = createBookingService(mockBookingRepo as unknown as IBookingRepository, mockSeatRepo as unknown as ISeatRepository, mockRedisLock as unknown as { acquire: (key: string, owner: string) => Promise<boolean>; release: (key: string, owner: string) => Promise<boolean> })

  beforeEach(() => {
    vi.clearAllMocks()
    lockStore = {}
  })

  it('allows exactly 1 success when 100 users book the same seat', async () => {
    mockSeatRepo.findByShowtime.mockResolvedValue([
      { id: 'seat-1', seatNo: 'A1', status: 'AVAILABLE' },
    ])
    mockBookingRepo.create.mockImplementation(async (data: { userId: string; showtimeId: string; seatId: string; status: string }) => ({
      id: `booking-${data.userId}`,
      ...data,
    }))

    const users = Array.from({ length: 100 }, (_, i) => `user-${i}`)

    const results = await Promise.all(
      users.map((userId) =>
        service.create({ userId, showtimeId: 's1', seatNo: 'A1' }),
      ),
    )

    const successes = results.filter((r) => r.success).length
    expect(successes).toBe(1)

    const successResult = results.find((r) => r.success)
    expect(successResult).toBeDefined()
  })

  it('rejects booking for already locked seat', async () => {
    mockSeatRepo.findByShowtime.mockResolvedValue([
      { id: 'seat-1', seatNo: 'A1', status: 'AVAILABLE' },
    ])
    mockBookingRepo.create.mockResolvedValue({ id: 'b1', status: 'PENDING' })

    const first = await service.create({ userId: 'user-1', showtimeId: 's1', seatNo: 'A1' })
    expect(first.success).toBe(true)

    mockSeatRepo.findByShowtime.mockResolvedValue([
      { id: 'seat-1', seatNo: 'A1', status: 'LOCKED' },
    ])
    const second = await service.create({ userId: 'user-2', showtimeId: 's1', seatNo: 'A1' })
    expect(second.success).toBe(false)
  })
})
