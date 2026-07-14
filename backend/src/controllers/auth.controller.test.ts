import { describe, it, expect, vi } from 'vitest'
import type { Request, Response } from 'express'
import { createAuthController } from './auth.controller.js'

describe('AuthController', () => {
  const mockService = {
    register: vi.fn(),
    login: vi.fn(),
    getMe: vi.fn(),
  }
  const controller = createAuthController(mockService as any)

  it('calls service.register on register', async () => {
    const req = { body: { email: 'test@test.com', password: 'pass', name: 'Test' } } as Request
    const res = { json: vi.fn() } as unknown as Response
    mockService.register.mockResolvedValue({ success: true, data: { token: 'abc', user: {} } })

    await controller.register(req, res)

    expect(mockService.register).toHaveBeenCalledWith({ email: 'test@test.com', password: 'pass', name: 'Test' })
    expect(res.json).toHaveBeenCalled()
  })
})
