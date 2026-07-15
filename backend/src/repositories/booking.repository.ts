import type { PrismaClient } from '@prisma/client'
import type { IBookingRepository, BookingWithSeat, BookingWithSeatShowtime, BookingWithSeatShowtimeMovie } from './interfaces.js'

export type { IBookingRepository, BookingWithSeat, BookingWithSeatShowtime, BookingWithSeatShowtimeMovie }

/**
 * Creates a booking repository backed by Prisma.
 */
export function createBookingRepository(prisma: PrismaClient): IBookingRepository {
  return {
    async create(data) {
      return prisma.booking.create({
        data,
        include: { seat: true, showtime: true },
      })
    },
    async findById(id: string) {
      return prisma.booking.findUnique({
        where: { id },
        include: { seat: true },
      })
    },
    async findAll() {
      return prisma.booking.findMany({
        include: { seat: true, showtime: { include: { movie: true } } },
        orderBy: { createdAt: 'desc' },
      })
    },
    async findByUser(userId: string) {
      return prisma.booking.findMany({
        where: { userId },
        include: { seat: true, showtime: { include: { movie: true } } },
        orderBy: { createdAt: 'desc' },
      })
    },
    async findExpired(before: Date) {
      return prisma.booking.findMany({
        where: { status: 'PENDING', createdAt: { lt: before } },
        include: { seat: true },
      })
    },
    async updateStatus(id: string, status: string, lockOwner?: string | null) {
      const data: Record<string, unknown> = { status }
      if (lockOwner !== undefined) data.lockOwner = lockOwner
      return prisma.booking.update({ where: { id }, data })
    },
  }
}
