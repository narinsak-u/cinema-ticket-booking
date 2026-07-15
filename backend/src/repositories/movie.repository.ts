import type { PrismaClient, Movie } from '@prisma/client'

export interface IMovieRepository {
  findAll(limit?: number, offset?: number): Promise<Movie[]>
  findById(id: string): Promise<Movie | null>
}

export function createMovieRepository(prisma: PrismaClient): IMovieRepository {
  return {
    async findAll(limit = 50, offset = 0): Promise<Movie[]> {
      return prisma.movie.findMany({ orderBy: { createdAt: 'desc' }, take: limit, skip: offset })
    },
    async findById(id: string): Promise<Movie | null> {
      return prisma.movie.findUnique({ where: { id } })
    },
  }
}
