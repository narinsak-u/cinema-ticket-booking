import type { Channel } from 'amqplib'
import type { IAuditLogRepository } from '../repositories/interfaces.js'

export async function startConsumers(channel: Channel, auditLogRepo: IAuditLogRepository) {
  const { queue } = await channel.assertQueue('booking.audit', { durable: true })
  await channel.bindQueue(queue, 'booking.events', 'booking.*')

  await channel.consume(queue, async (msg) => {
    if (!msg) return
    try {
      const data = msg.content.toString()
      await auditLogRepo.create({ event: msg.fields.routingKey, data })
      channel.ack(msg)
    } catch (err) {
      console.error('Failed to process message:', err)
      channel.nack(msg, false, false)
    }
  })
}
