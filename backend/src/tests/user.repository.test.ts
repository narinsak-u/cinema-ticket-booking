import { describe, it, expect, vi } from 'vitest'
import type { IUserRepository } from '../repositories/user.repository.js'

describe('IUserRepository', () => {
  it('defines the contract', () => {
    const repo: IUserRepository = {
      findByEmail: vi.fn(),
      create: vi.fn(),
      findById: vi.fn(),
    }
    expect(repo.findByEmail).toBeDefined()
    expect(repo.create).toBeDefined()
    expect(repo.findById).toBeDefined()
  })
})
