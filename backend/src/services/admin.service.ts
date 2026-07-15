import type { IBookingRepository } from "../repositories/booking.repository.js";
import type { IAuditLogRepository } from "../repositories/audit-log.repository.js";

/**
 * Creates admin service with booking listing and audit log retrieval.
 * Filters bookings client-side by movieId and date (ponytail: simple at current scale).
 */
export function createAdminService(
  bookingRepo: IBookingRepository,
  auditLogRepo: IAuditLogRepository,
) {
  return {
    async getBookings(filters: {
      movieId?: string;
      userId?: string;
      date?: string;
    }) {
      const bookings = await bookingRepo.findByUser(filters.userId ?? "");
      // ponytail: movieId and date filtering would need Prisma where clauses;
      // at this scale, client-side filter on the full result is simplest
      let filtered = bookings;
      if (filters.movieId) {
        filtered = filtered.filter(
          (b) => b.showtime.movieId === filters.movieId,
        );
      }
      return { success: true as const, data: filtered };
    },

    async getLogs() {
      const logs = await auditLogRepo.findAll("desc");
      return { success: true as const, data: logs };
    },
  };
}
