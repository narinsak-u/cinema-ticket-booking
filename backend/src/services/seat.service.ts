import type { ISeatRepository } from '../repositories/interfaces.js'

export function createSeatService(seatRepo: ISeatRepository) {
  return {
    async getSeatMap(showtimeId: string) {
      const seats = await seatRepo.findByShowtime(showtimeId)
      return { success: true as const, data: seats }
    },
  }
}
