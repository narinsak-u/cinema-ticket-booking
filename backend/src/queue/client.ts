import amqp from 'amqplib'
import { env } from '../config/env.js'

export async function connectQueue() {
  const conn = await amqp.connect(env.RABBITMQ_URL)
  const channel = await conn.createChannel()
  await channel.assertExchange('booking.events', 'topic', { durable: true })
  return { conn, channel }
}
