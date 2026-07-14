import { describe, it, expect, vi } from 'vitest'
import type { IMovieRepository } from './interfaces.js'

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
