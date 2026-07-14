import type { IBookingRepository, ISeatRepository } from '../repositories/interfaces.js'

export function createBookingService(
  bookingRepo: IBookingRepository,
  seatRepo: ISeatRepository,
  redisLock?: { acquire: (key: string, owner: string) => Promise<boolean>; release: (key: string, owner: string) => Promise<boolean> },
) {
  return {
    async create(data: { userId: string; showtimeId: string; seatNo: string }) {
      const seats = await seatRepo.findByShowtime(data.showtimeId) as any[]
      const seat = seats.find((s: any) => s.seatNo === data.seatNo)
      if (!seat) return { success: false as const, error: 'Seat not found' }
      if (seat.status !== 'AVAILABLE') return { success: false as const, error: 'Seat not available' }

      if (redisLock) {
        const lockKey = `seat_lock:${data.showtimeId}:${data.seatNo}`
        const acquired = await redisLock.acquire(lockKey, data.userId)
        if (!acquired) return { success: false as const, error: 'Seat is locked by another user' }
      }

      const booking = await bookingRepo.create({
        userId: data.userId,
        showtimeId: data.showtimeId,
        seatId: seat.id,
        status: 'PENDING',
      })

      await seatRepo.updateStatus(seat.id, 'LOCKED')

      return { success: true as const, data: booking }
    },

    async payment(bookingId: string, userId: string) {
      const booking = await bookingRepo.findById(bookingId) as any
      if (!booking) return { success: false as const, error: 'Booking not found' }
      if (booking.userId !== userId) return { success: false as const, error: 'Not your booking' }
      if (booking.status !== 'PENDING') return { success: false as const, error: 'Invalid status' }

      await bookingRepo.updateStatus(bookingId, 'CONFIRMED')
      await seatRepo.updateStatus(booking.seatId, 'BOOKED')

      if (redisLock) {
        const lockKey = `seat_lock:${booking.showtimeId}:${booking.seat.seatNo ?? booking.showtimeId}`
        await redisLock.release(lockKey, userId)
      }

      return { success: true as const, data: { id: bookingId, status: 'CONFIRMED' } }
    },
  }
}
