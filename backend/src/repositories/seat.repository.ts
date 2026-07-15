import type { PrismaClient, Seat } from '@prisma/client'

/** Repository interface for seat data access. */
export interface ISeatRepository {
  findByShowtime(showtimeId: string): Promise<Seat[]>
  updateStatus(id: string, status: string): Promise<Seat | null>
}

/**
 * Creates a seat repository backed by Prisma.
 */
export function createSeatRepository(prisma: PrismaClient): ISeatRepository {
  return {
    async findByShowtime(showtimeId: string) {
      return prisma.seat.findMany({
        where: { showtimeId },
        orderBy: { seatNo: 'asc' },
      })
    },
    async updateStatus(id: string, status: string) {
      return prisma.seat.update({
        where: { id },
        data: { status },
      })
    },
  }
}
