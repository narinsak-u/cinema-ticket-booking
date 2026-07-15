import { describe, it, expect, vi } from 'vitest'
import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { createAuthMiddleware } from '../middleware/auth.middleware.js'

describe('authMiddleware', () => {
  const middleware = createAuthMiddleware('test-secret')

  it('calls next() with valid token', () => {
    const token = jwt.sign({ id: 'user-1', role: 'USER' }, 'test-secret')
    const req = { headers: { authorization: `Bearer ${token}` } } as unknown as Request
    const next = vi.fn() as NextFunction

    middleware(req, {} as Response, next)

    expect(next).toHaveBeenCalled()
    expect(req.user).toBeDefined()
    expect(req.user!.id).toBe('user-1')
  })

  it('returns 401 without token', () => {
    const req = { headers: {} } as Request
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as unknown as Response
    const next = vi.fn() as NextFunction

    middleware(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
  })
})
