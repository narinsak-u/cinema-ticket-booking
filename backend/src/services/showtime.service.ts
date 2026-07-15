import type { IShowtimeRepository } from '../repositories/interfaces.js'

/**
 * Creates a showtime service with business logic for listing and fetching showtimes.
 */
export function createShowtimeService(showtimeRepo: IShowtimeRepository) {
  return {
    async getAll(limit?: number, offset?: number) {
      const showtimes = await showtimeRepo.findAll(limit, offset)
      return { success: true as const, data: showtimes }
    },
    async getById(id: string) {
      const showtime = await showtimeRepo.findById(id)
      if (!showtime) return { success: false as const, error: 'Showtime not found' }
      return { success: true as const, data: showtime }
    },
  }
}
