import { describe, it, expect, vi } from 'vitest'
import type { Request, Response } from 'express'
import { createMovieController } from '../controllers/movie.controller.js'

describe('MovieController', () => {
  const mockService = { getAll: vi.fn(), getById: vi.fn() }
  const controller = createMovieController(mockService as any)

  it('lists all movies', async () => {
    const req = {} as Request
    const res = { json: vi.fn() } as unknown as Response
    mockService.getAll.mockResolvedValue({ success: true, data: [] })
    await controller.getAll(req, res)
    expect(res.json).toHaveBeenCalledWith({ success: true, data: [] })
  })
})
