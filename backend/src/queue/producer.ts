import type { Channel } from 'amqplib'

export function createQueueProducer(channel: Channel) {
  return {
    async publish(event: string, data: Record<string, unknown>) {
      channel.publish('booking.events', event, Buffer.from(JSON.stringify(data)), { persistent: true })
    },
  }
}
