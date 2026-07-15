import { describe, it, expect, vi } from 'vitest'
import type { IMovieRepository } from '../repositories/movie.repository.js'

describe('IMovieRepository', () => {
  it('defines the contract', () => {
    const repo: IMovieRepository = {
      findAll: vi.fn(),
      findById: vi.fn(),
    }
    expect(repo.findAll).toBeDefined()
    expect(repo.findById).toBeDefined()
  })
})
