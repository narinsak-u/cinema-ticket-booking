import { describe, it, expect, vi } from 'vitest'
import type { Request, Response } from 'express'
import { createBookingController } from '../controllers/booking.controller.js'

describe('BookingController', () => {
  const mockService = { create: vi.fn(), payment: vi.fn() }
  const controller = createBookingController(mockService as unknown as Parameters<typeof createBookingController>[0])

  it('calls service.create with user id', async () => {
    const req = { user: { id: 'user-1' }, body: { showtimeId: 's1', seatNo: 'A1' } } as unknown as Request
    const res = { json: vi.fn(), status: vi.fn().mockReturnThis() } as unknown as Response
    mockService.create.mockResolvedValue({ success: true, data: {} })

    await controller.create(req, res)

    expect(mockService.create).toHaveBeenCalledWith({ userId: 'user-1', showtimeId: 's1', seatNo: 'A1' })
  })
})
