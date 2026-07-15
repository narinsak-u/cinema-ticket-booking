import type { PrismaClient, Prisma, Booking } from '@prisma/client'

export type BookingWithSeat = Prisma.BookingGetPayload<{ include: { seat: true } }>
export type BookingWithSeatShowtime = Prisma.BookingGetPayload<{ include: { seat: true; showtime: true } }>
export type BookingWithSeatShowtimeUser = Prisma.BookingGetPayload<{ include: { seat: true; showtime: true; user: true } }>
export type BookingWithSeatShowtimeMovie = Prisma.BookingGetPayload<{ include: { seat: true; showtime: { include: { movie: true } } } }>

export interface IBookingRepository {
  create(data: {
    userId: string
    showtimeId: string
    seatId: string
    status: string
  }): Promise<BookingWithSeatShowtime>
  findById(id: string): Promise<BookingWithSeatShowtimeUser | null>
  findByUser(userId: string): Promise<BookingWithSeatShowtimeMovie[]>
  findExpired(before: Date): Promise<BookingWithSeat[]>
  updateStatus(id: string, status: string, lockOwner?: string | null): Promise<Booking | null>
}

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
        include: { seat: true, showtime: true, user: true },
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
