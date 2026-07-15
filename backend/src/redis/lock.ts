import type { Redis } from 'ioredis'

const RELEASE_SCRIPT = `
  if redis.call("get", KEYS[1]) == ARGV[1] then
    return redis.call("del", KEYS[1])
  end
  return 0
`

const EXTEND_SCRIPT = `
  if redis.call("get", KEYS[1]) == ARGV[1] then
    return redis.call("expire", KEYS[1], ARGV[2])
  end
  return 0
`

export function createRedisLock(redis: Redis, ttlSeconds: number) {
  return {
    async acquire(key: string, owner: string): Promise<boolean> {
      const result = await redis.set(key, owner, 'EX', ttlSeconds, 'NX')
      return result === 'OK'
    },

    async release(key: string, owner: string): Promise<boolean> {
      const result = await redis.eval(RELEASE_SCRIPT, 1, key, owner)
      return result === 1
    },

    async check(key: string): Promise<string | null> {
      return redis.get(key)
    },

    async extend(key: string, owner: string): Promise<boolean> {
      const result = await redis.eval(EXTEND_SCRIPT, 1, key, owner, ttlSeconds)
      return result === 1
    },
  }
}
