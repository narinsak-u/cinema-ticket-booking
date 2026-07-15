import { describe, it, expect, vi } from 'vitest'
import { createQueueProducer } from '../queue/producer.js'

describe('QueueProducer', () => {
  it('publishes message to booking.events exchange', () => {
    const mockChannel = { publish: vi.fn() }
    const producer = createQueueProducer(mockChannel as any)

    producer.publish('booking.success', { bookingId: 'b1' })

    expect(mockChannel.publish).toHaveBeenCalledWith(
      'booking.events',
      'booking.success',
      expect.any(Buffer),
      { persistent: true },
    )
  })
})
