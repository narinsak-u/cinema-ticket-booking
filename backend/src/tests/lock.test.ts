import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createRedisLock } from '../redis/lock.js'

describe('RedisLock', () => {
  const mockRedis = {
    set: vi.fn(),
    get: vi.fn(),
    del: vi.fn(),
    expire: vi.fn(),
  }
  const lock = createRedisLock(mockRedis as any, 300)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('acquires a lock successfully', async () => {
    vi.mocked(mockRedis.set).mockResolvedValue('OK')
    const result = await lock.acquire('seat_lock:1:A1', 'owner-1')
    expect(result).toBe(true)
    expect(mockRedis.set).toHaveBeenCalledWith('seat_lock:1:A1', 'owner-1', 'EX', 300, 'NX')
  })

  it('fails to acquire when already locked', async () => {
    vi.mocked(mockRedis.set).mockResolvedValue(null)
    const result = await lock.acquire('seat_lock:1:A1', 'owner-2')
    expect(result).toBe(false)
  })

  it('releases lock only for the owner', async () => {
    vi.mocked(mockRedis.get).mockResolvedValue('owner-1')
    vi.mocked(mockRedis.del).mockResolvedValue(1)
    const result = await lock.release('seat_lock:1:A1', 'owner-1')
    expect(result).toBe(true)
  })

  it('refuses release for wrong owner', async () => {
    vi.mocked(mockRedis.get).mockResolvedValue('owner-1')
    const result = await lock.release('seat_lock:1:A1', 'owner-2')
    expect(result).toBe(false)
    expect(mockRedis.del).not.toHaveBeenCalled()
  })
})
