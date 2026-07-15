import { describe, it, expect, vi } from 'vitest'
import type { Request, Response } from 'express'
import type { IMovieRepository } from '../repositories/movie.repository.js'
import { createMovieController } from '../controllers/movie.controller.js'

describe('MovieController', () => {
  const mockRepo = { findAll: vi.fn(), findById: vi.fn() }
  const controller = createMovieController(mockRepo as unknown as IMovieRepository)

  it('lists all movies', async () => {
    const req = {} as Request
    const res = { json: vi.fn() } as unknown as Response
    mockRepo.findAll.mockResolvedValue([])
    await controller.getAll(req, res)
    expect(res.json).toHaveBeenCalledWith({ success: true, data: [] })
  })
})
