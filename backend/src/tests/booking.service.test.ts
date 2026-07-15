import { describe, it, expect, vi } from 'vitest'
import { createBookingService } from '../services/booking.service.js'

describe('BookingService', () => {
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
  const service = createBookingService(mockBookingRepo as any, mockSeatRepo as any)

  it('creates a pending booking for available seat', async () => {
    mockSeatRepo.findByShowtime.mockResolvedValue([
      { id: 'seat-1', seatNo: 'A1', status: 'AVAILABLE' },
    ])
    mockBookingRepo.create.mockResolvedValue({
      id: 'booking-1', userId: 'user-1', showtimeId: 's1',
      seatId: 'seat-1', status: 'PENDING',
    })

    const result = await service.create({ userId: 'user-1', showtimeId: 's1', seatNo: 'A1' })

    expect(result.success).toBe(true)
    expect(mockSeatRepo.updateStatus).toHaveBeenCalledWith('seat-1', 'LOCKED')
  })

  it('rejects booking for already locked/booked seat', async () => {
    mockSeatRepo.findByShowtime.mockResolvedValue([
      { id: 'seat-1', seatNo: 'A1', status: 'LOCKED' },
    ])
    const result = await service.create({ userId: 'user-1', showtimeId: 's1', seatNo: 'A1' })
    expect(result.success).toBe(false)
  })

  it('confirms booking on payment', async () => {
    mockBookingRepo.findById.mockResolvedValue({
      id: 'b1', userId: 'user-1', seatId: 'seat-1', status: 'PENDING',
    })
    mockBookingRepo.updateStatus.mockResolvedValue({})
    mockSeatRepo.updateStatus.mockResolvedValue({})

    const result = await service.payment('b1', 'user-1')
    expect(result.success).toBe(true)
    expect(mockSeatRepo.updateStatus).toHaveBeenCalledWith('seat-1', 'BOOKED')
  })

  it('refuses payment for wrong user', async () => {
    mockBookingRepo.findById.mockResolvedValue({
      id: 'b1', userId: 'user-2', seatId: 'seat-1', status: 'PENDING',
    })
    const result = await service.payment('b1', 'user-1')
    expect(result.success).toBe(false)
  })
})
