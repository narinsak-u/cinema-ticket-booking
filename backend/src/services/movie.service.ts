import type { IMovieRepository } from '../repositories/interfaces.js'

/**
 * Creates a movie service with business logic for listing and fetching movies.
 */
export function createMovieService(movieRepo: IMovieRepository) {
  return {
    async getAll(limit?: number, offset?: number) {
      const movies = await movieRepo.findAll(limit, offset)
      return { success: true as const, data: movies }
    },
    async getById(id: string) {
      const movie = await movieRepo.findById(id)
      if (!movie) return { success: false as const, error: 'Movie not found' }
      return { success: true as const, data: movie }
    },
  }
}
