import { describe, it, expect, vi } from 'vitest'
import type { IBookingRepository } from '../repositories/booking.repository.js'
import type { IAuditLogRepository } from '../repositories/audit-log.repository.js'
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
  const service = createAdminService(mockBookingRepo as unknown as IBookingRepository, mockAuditLogRepo as unknown as IAuditLogRepository)

  it('returns audit logs', async () => {
    mockAuditLogRepo.findAll.mockResolvedValue([{ id: '1', event: 'booking.success', data: '{}' }])
    const result = await service.getLogs()
    expect(result.success).toBe(true)
    expect(result.data).toHaveLength(1)
  })
})
