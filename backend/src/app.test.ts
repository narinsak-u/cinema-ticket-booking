import { describe, it, expect, vi } from 'vitest'

vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn().mockImplementation(() => ({
    user: { findUnique: vi.fn(), create: vi.fn() },
  })),
}))

import { createApp } from './app.js'

describe('createApp', () => {
  it('returns an Express app', () => {
    const app = createApp()
    expect(app).toBeDefined()
    expect(typeof app.use).toBe('function')
  })
})
