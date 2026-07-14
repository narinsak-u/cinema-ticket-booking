import type { IShowtimeRepository } from '../repositories/interfaces.js'

export function createShowtimeService(showtimeRepo: IShowtimeRepository) {
  return {
    async getAll() {
      const showtimes = await showtimeRepo.findAll()
      return { success: true as const, data: showtimes }
    },
    async getById(id: string) {
      const showtime = await showtimeRepo.findById(id)
      if (!showtime) return { success: false as const, error: 'Showtime not found' }
      return { success: true as const, data: showtime }
    },
  }
}
