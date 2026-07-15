import type { PrismaClient, Seat } from '@prisma/client'

export interface ISeatRepository {
  findByShowtime(showtimeId: string): Promise<Seat[]>
  updateStatus(id: string, status: string): Promise<Seat | null>
}

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
