# RabbitMQ Queue Flow

How events flow through RabbitMQ in this app.

## Topology

```
┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│  Publisher        │         │  Exchange         │         │  Queue           │
│  (producer.ts)   │────────▶│  booking.events   │────────▶│  booking.audit   │
│                  │         │  (topic, durable) │  bind:  │  (durable)       │
└──────────────────┘         │                   │ booking.*                   │
                             └──────────────────┘         └────────┬─────────┘
                                                                   │
                                                                   ▼
                                                          ┌──────────────────┐
                                                          │  Consumer         │
                                                          │  (audit logger)  │
                                                          └──────────────────┘
```

| Component | Name | Type |
|-----------|------|------|
| Exchange | `booking.events` | topic, durable |
| Queue | `booking.audit` | durable |
| Binding | `booking.*` | matches `booking.success`, `booking.timeout`, etc. |

## Startup Sequence (`app.ts`)

```
1. producer = createQueueProducer()         ← no-op until wired
2. bookingService receives publish fn       ← (event, data) => producer.publish(event, data)
3. connectQueue() called async              ← connects to RabbitMQ, asserts exchange
4. .then() fires:
   a. producer.wire(channel)               ← wired to real channel
   b. startConsumers(channel)               ← asserts queue, binds, starts consuming
```

`createQueueProducer()` returns an object with `wire(channel)` and `publish()`.
Before `wire()` is called, `publish()` is a no-op. After wiring, all subsequent
calls go through the real channel. If RabbitMQ is down, the app still starts —
audit logging is silently skipped.

## Events Published

### `booking.success`

Published in `booking.service.ts` → `payment()` after:
- Booking status updated to `CONFIRMED`
- Seat status updated to `BOOKED`
- Socket.IO broadcast sent

```ts
publish("booking.success", { bookingId, userId, showtimeId })
```

### `booking.timeout`

Published in `queue/worker.ts` → expiration timer (every 30s) after:
- PENDING bookings older than 300s found
- Booking status updated to `EXPIRED`
- Redis lock released
- Socket.IO broadcast sent

```ts
publish("booking.timeout", { bookingId, showtimeId, seatNo })
```

## Consumer Flow (`consumer.ts`)

```
1. Assert queue "booking.audit" (durable)
2. Bind queue to "booking.events" with pattern "booking.*"
3. Consume messages:
   a. Parse message content
   b. Save as AuditLog: { event: routingKey, data: JSON string }
   c. ack() on success
   d. nack(no requeue) on failure
```

## Message Format

```json
{
  "routingKey": "booking.success",
  "content": "{\"bookingId\":\"...\",\"userId\":\"...\",\"showtimeId\":\"...\"}"
}
```

Stored in `AuditLog` collection:
- `event` = routing key (`booking.success` / `booking.timeout`)
- `data` = JSON string of the payload
- `createdAt` = timestamp

## Key Files

| File | Role |
|------|------|
| `src/queue/client.ts` | Connect to RabbitMQ, assert exchange |
| `src/queue/producer.ts` | `createQueueProducer()` — no-op → wired to channel |
| `src/queue/consumer.ts` | Assert queue, bind, consume → AuditLog |
| `src/queue/worker.ts` | Expiration timer, publishes `booking.timeout` |
| `src/services/booking.service.ts` | Publishes `booking.success` on payment |
| `src/app.ts` | Wires producer via `producer.wire(channel)` |
