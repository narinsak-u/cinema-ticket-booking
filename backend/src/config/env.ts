import 'dotenv/config'

/**
 * Runtime configuration loaded from environment variables.
 * All values fall back to local-development defaults.
 */
export const env = {
  PORT: Number(process.env.PORT) || 3000,
  DATABASE_URL: process.env.DATABASE_URL ?? 'mongodb://localhost:27017/cinema_booking',
  REDIS_URL: process.env.REDIS_URL ?? 'redis://localhost:6379',
  RABBITMQ_URL: process.env.RABBITMQ_URL ?? 'amqp://localhost:5672',
  JWT_SECRET: process.env.JWT_SECRET ?? 'change-me-in-production',
  CORS_ORIGIN: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
} as const
