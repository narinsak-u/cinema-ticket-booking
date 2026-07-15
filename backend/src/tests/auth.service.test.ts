import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { IUserRepository } from '../repositories/interfaces.js'
import { createAuthService } from '../services/auth.service.js'

describe('AuthService', () => {
  const mockRepo: IUserRepository = {
    findByEmail: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
  }
  const service = createAuthService(mockRepo, 'test-secret')

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('registers a new user and returns a token', async () => {
    vi.mocked(mockRepo.findByEmail).mockResolvedValue(null)
    vi.mocked(mockRepo.create).mockResolvedValue({
      id: 'user-1',
      email: 'test@test.com',
      password: 'hashed',
      name: 'Test',
      role: 'USER',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const result = await service.register({ email: 'test@test.com', password: 'password123', name: 'Test' })

    expect(result.success).toBe(true)
    expect(result.data).toHaveProperty('token')
    expect(result.data).toHaveProperty('user')
    expect(result.data!.user.email).toBe('test@test.com')
  })

  it('rejects duplicate email', async () => {
    vi.mocked(mockRepo.findByEmail).mockResolvedValue({
      id: 'existing',
      email: 'test@test.com',
      password: 'hashed',
      name: 'Test',
      role: 'USER',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const result = await service.register({ email: 'test@test.com', password: 'password123', name: 'Test' })

    expect(result.success).toBe(false)
    expect(result.error).toBe('Email already registered')
  })

  it('logs in with valid credentials', async () => {
    const bcrypt = await import('bcryptjs')
    const hashed = await bcrypt.hash('password123', 10)
    vi.mocked(mockRepo.findByEmail).mockResolvedValue({
      id: 'user-1',
      email: 'test@test.com',
      password: hashed,
      name: 'Test',
      role: 'USER',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const result = await service.login({ email: 'test@test.com', password: 'password123' })

    expect(result.success).toBe(true)
    expect(result.data).toHaveProperty('token')
  })

  it('rejects invalid password', async () => {
    vi.mocked(mockRepo.findByEmail).mockResolvedValue({
      id: 'user-1',
      email: 'test@test.com',
      password: 'hashed',
      name: 'Test',
      role: 'USER',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const result = await service.login({ email: 'test@test.com', password: 'wrong' })

    expect(result.success).toBe(false)
    expect(result.error).toBe('Invalid credentials')
  })

  it('rejects unknown email on login', async () => {
    vi.mocked(mockRepo.findByEmail).mockResolvedValue(null)

    const result = await service.login({ email: 'unknown@test.com', password: 'password123' })

    expect(result.success).toBe(false)
    expect(result.error).toBe('Invalid credentials')
  })
})
