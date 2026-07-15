import type { PrismaClient } from '@prisma/client'

export interface IShowtimeRepository {
  findAll(limit?: number, offset?: number): Promise<unknown[]>
  findById(id: string): Promise<unknown | null>
}

export function createShowtimeRepository(prisma: PrismaClient): IShowtimeRepository {
  return {
    async findAll(limit = 50, offset = 0) {
      return prisma.showtime.findMany({
        include: { movie: true },
        orderBy: { startTime: 'asc' },
        take: limit,
        skip: offset,
      })
    },
    async findById(id: string) {
      return prisma.showtime.findUnique({
        where: { id },
        include: { movie: true },
      })
    },
  }
}
