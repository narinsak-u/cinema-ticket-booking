import type { IBookingRepository, IAuditLogRepository } from '../repositories/interfaces.js'

export function createAdminService(
  bookingRepo: IBookingRepository,
  auditLogRepo: IAuditLogRepository,
) {
  return {
    async getBookings(filters: { movieId?: string; userId?: string; date?: string }) {
      const bookings = await bookingRepo.findByUser(filters.userId ?? '')
      return { success: true as const, data: bookings }
    },

    async getLogs() {
      const logs = await auditLogRepo.findAll('desc')
      return { success: true as const, data: logs }
    },
  }
}
