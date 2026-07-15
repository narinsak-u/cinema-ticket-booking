import type { PrismaClient } from '@prisma/client'

export interface IBookingRepository {
  create(data: {
    userId: string
    showtimeId: string
    seatId: string
    status: string
  }): Promise<unknown>
  findById(id: string): Promise<unknown | null>
  findByUser(userId: string): Promise<unknown[]>
  findExpired(before: Date): Promise<unknown[]>
  updateStatus(id: string, status: string, lockOwner?: string | null): Promise<unknown | null>
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
