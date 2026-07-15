import type { ISeatRepository } from '../repositories/interfaces.js'

/**
 * Creates a seat service with business logic for fetching seat maps.
 */
export function createSeatService(seatRepo: ISeatRepository) {
  return {
    async getSeatMap(showtimeId: string) {
      const seats = await seatRepo.findByShowtime(showtimeId)
      return { success: true as const, data: seats }
    },
  }
}
