import { describe, it, expect, vi, afterEach } from 'vitest'
import type { Server } from 'socket.io'
import type { IBookingRepository } from '../repositories/booking.repository.js'
import type { ISeatRepository } from '../repositories/seat.repository.js'
import { startExpirationWorker } from '../queue/worker.js'

describe('ExpirationWorker', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('processes expired bookings', async () => {
    vi.useFakeTimers()

    const mockBookingRepo = {
      findExpired: vi.fn().mockResolvedValue([
        { id: 'b1', showtimeId: 's1', seatId: 'seat1', lockOwner: 'u1', seat: { seatNo: 'A1' } },
      ]),
      updateStatus: vi.fn(),
      create: vi.fn(),
      findById: vi.fn(),
      findByUser: vi.fn(),
    }
    const mockSeatRepo = { findByShowtime: vi.fn(), updateStatus: vi.fn() }
    const mockRedisLock = { release: vi.fn().mockResolvedValue(true), acquire: vi.fn(), check: vi.fn(), extend: vi.fn() }
    const mockIo = { to: vi.fn().mockReturnThis(), emit: vi.fn() }

    const cleanup = startExpirationWorker(mockBookingRepo as unknown as IBookingRepository, mockSeatRepo as unknown as ISeatRepository, mockRedisLock as unknown as { release: (key: string, owner: string) => Promise<boolean> }, mockIo as unknown as Server)

    await vi.advanceTimersByTimeAsync(31000)

    expect(mockBookingRepo.findExpired).toHaveBeenCalled()
    expect(mockBookingRepo.updateStatus).toHaveBeenCalledWith('b1', 'EXPIRED', null)
    expect(mockRedisLock.release).toHaveBeenCalledWith('seat_lock:s1:A1', 'u1')

    cleanup()
    vi.useRealTimers()
  })
})
