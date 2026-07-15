import { describe, it, expect, vi } from 'vitest'
import { createMovieService } from '../services/movie.service.js'

describe('MovieService', () => {
  const mockRepo = { findAll: vi.fn(), findById: vi.fn() }
  const service = createMovieService(mockRepo as any)

  it('returns all movies', async () => {
    mockRepo.findAll.mockResolvedValue([{ id: '1', title: 'Inception' }])
    const result = await service.getAll()
    expect(result.success).toBe(true)
    expect(result.data!).toHaveLength(1)
  })

  it('returns movie by id', async () => {
    mockRepo.findById.mockResolvedValue({ id: '1', title: 'Inception' })
    const result = await service.getById('1')
    expect(result.success).toBe(true)
    expect(result.data!.title).toBe('Inception')
  })

  it('returns error for unknown id', async () => {
    mockRepo.findById.mockResolvedValue(null)
    const result = await service.getById('invalid')
    expect(result.success).toBe(false)
    expect(result.error).toBe('Movie not found')
  })
})
