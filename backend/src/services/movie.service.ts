import type { IMovieRepository } from '../repositories/interfaces.js'

export function createMovieService(movieRepo: IMovieRepository) {
  return {
    async getAll() {
      const movies = await movieRepo.findAll()
      return { success: true as const, data: movies }
    },
    async getById(id: string) {
      const movie = await movieRepo.findById(id)
      if (!movie) return { success: false as const, error: 'Movie not found' }
      return { success: true as const, data: movie }
    },
  }
}
