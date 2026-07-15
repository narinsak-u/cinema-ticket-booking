import { Redis } from 'ioredis'
import { env } from '../config/env.js'

/** Shared Redis connection used across the app. */
export const redis = new Redis(env.REDIS_URL)

/**
 * Creates a distributed lock backed by Redis SET NX EX.
 * Used to prevent concurrent seat booking.
 * @param ttlSeconds - Lock TTL; expires automatically if not released (default 300)
 */
export function createRedisLock(redis: Redis, ttlSeconds: number) {
  return {
    async acquire(key: string, owner: string): Promise<boolean> {
      const result = await redis.set(key, owner, 'EX', ttlSeconds, 'NX')
      return result === 'OK'
    },

    async release(key: string, owner: string): Promise<boolean> {
      const value = await redis.get(key)
      if (value !== owner) return false
      await redis.del(key)
      return true
    },

    async check(key: string): Promise<string | null> {
      return redis.get(key)
    },

    async extend(key: string, owner: string): Promise<boolean> {
      const value = await redis.get(key)
      if (value !== owner) return false
      await redis.expire(key, ttlSeconds)
      return true
    },
  }
}
