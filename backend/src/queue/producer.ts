import type { Channel } from 'amqplib'

/**
 * Creates a RabbitMQ producer that publishes events to a topic exchange.
 * Returns a no-op publisher until the channel is wired via connectProducer.
 */
export function createQueueProducer() {
  let channel: Channel | null = null

  return {
    wire(ch: Channel) {
      channel = ch
    },
    publish(event: string, data: Record<string, unknown>) {
      if (!channel) return
      channel.publish(
        'booking.events',
        event,
        Buffer.from(JSON.stringify(data)),
        { persistent: true },
      )
    },
  }
}
