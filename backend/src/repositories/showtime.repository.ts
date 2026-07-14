import type { PrismaClient } from '@prisma/client'
import type { IShowtimeRepository } from './interfaces.js'

export function createShowtimeRepository(prisma: PrismaClient): IShowtimeRepository {
  return {
    async findAll() {
      return prisma.showtime.findMany({
        include: { movie: true },
        orderBy: { startTime: 'asc' },
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
