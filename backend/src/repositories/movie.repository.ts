import type { PrismaClient, Movie } from '@prisma/client'
import type { IMovieRepository } from './interfaces.js'

export function createMovieRepository(prisma: PrismaClient): IMovieRepository {
  return {
    async findAll(): Promise<Movie[]> {
      return prisma.movie.findMany({ orderBy: { createdAt: 'desc' } })
    },
    async findById(id: string): Promise<Movie | null> {
      return prisma.movie.findUnique({ where: { id } })
    },
  }
}
