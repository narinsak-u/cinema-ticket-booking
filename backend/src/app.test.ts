import { describe, it, expect, vi } from 'vitest'

vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn().mockImplementation(() => ({
    user: { findUnique: vi.fn(), create: vi.fn() },
  })),
}))

vi.mock('ioredis', () => {
  const mk = () => ({ set: vi.fn(), get: vi.fn(), del: vi.fn(), expire: vi.fn(), on: vi.fn() })
  return { default: vi.fn(mk), Redis: vi.fn(mk) }
})

vi.mock('amqplib', () => ({
  connect: vi.fn().mockRejectedValue(new Error('No RabbitMQ')),
  default: { connect: vi.fn().mockRejectedValue(new Error('No RabbitMQ')) },
}))

vi.mock('socket.io', () => ({
  Server: vi.fn().mockImplementation(() => ({
    on: vi.fn(),
    to: vi.fn().mockReturnThis(),
    emit: vi.fn(),
  })),
}))

import { createApp } from './app.js'

describe('createApp', () => {
  it('creates app with Express, Socket.IO, and worker', () => {
    const result = createApp()
    expect(result.app).toBeDefined()
    expect(typeof result.app.use).toBe('function')
    expect(result.io).toBeDefined()
    expect(result.httpServer).toBeDefined()
  })
})
