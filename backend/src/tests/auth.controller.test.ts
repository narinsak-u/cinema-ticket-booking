import { describe, it, expect, vi } from 'vitest'
import type { Request, Response } from 'express'
import { createAuthController } from '../controllers/auth.controller.js'

describe('AuthController', () => {
  const mockService = {
    register: vi.fn(),
    login: vi.fn(),
    getMe: vi.fn(),
  }
  const controller = createAuthController(mockService as unknown as Parameters<typeof createAuthController>[0])

  it('calls service.register on register', async () => {
    const req = { body: { email: 'test@test.com', password: 'password123', name: 'Test' } } as Request
    const res = { json: vi.fn(), status: vi.fn().mockReturnThis() } as unknown as Response
    mockService.register.mockResolvedValue({ success: true, data: { token: 'abc', user: {} } })

    await controller.register(req, res)

    expect(mockService.register).toHaveBeenCalledWith({ email: 'test@test.com', password: 'password123', name: 'Test' })
    expect(res.json).toHaveBeenCalled()
  })
})
