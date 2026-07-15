import { describe, it, expect, vi } from 'vitest'
import { createAdminService } from '../services/admin.service.js'

describe('AdminService', () => {
  const mockBookingRepo = {
    findByUser: vi.fn(),
    create: vi.fn(),
    findById: vi.fn(),
    findExpired: vi.fn(),
    updateStatus: vi.fn(),
  }
  const mockAuditLogRepo = { create: vi.fn(), findAll: vi.fn() }
  const service = createAdminService(mockBookingRepo as any, mockAuditLogRepo as any)

  it('returns audit logs', async () => {
    mockAuditLogRepo.findAll.mockResolvedValue([{ id: '1', event: 'booking.success', data: '{}' }])
    const result = await service.getLogs()
    expect(result.success).toBe(true)
    expect(result.data).toHaveLength(1)
  })
})
