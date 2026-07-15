import type { PrismaClient, Prisma } from '@prisma/client'

export type ShowtimeWithMovie = Prisma.ShowtimeGetPayload<{ include: { movie: true } }>

export interface IShowtimeRepository {
  findAll(limit?: number, offset?: number): Promise<ShowtimeWithMovie[]>
  findById(id: string): Promise<ShowtimeWithMovie | null>
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
