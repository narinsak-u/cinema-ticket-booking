# Cinema Ticket Booking System

A full-stack cinema ticket booking system with real-time seat updates, distributed locking, and event-driven architecture.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite, Zustand, Zod, Axios |
| Backend | Express 5, TypeScript, Prisma ORM |
| Database | MongoDB |
| Cache / Lock | Redis |
| Message Queue | RabbitMQ |
| Realtime | Socket.IO |
| Auth | JWT (email/password) |
| Container | Docker Compose |

## Quick Start

```bash
docker compose up --build
```

This starts all services: frontend (:5173), backend (:3000), MongoDB, Redis, RabbitMQ.

### Manual Setup

```bash
# Backend
cd backend
cp .env.example .env
npm install
npx prisma generate
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

### Seed Data

```bash
cd backend
npx prisma db seed
```

Default admin: `admin@cinema.com` / `admin123`

## Architecture

Clean Architecture layering: Controllers → Services → Repositories (Prisma)

```
backend/src/
  controllers/    # HTTP handlers (no business logic)
  services/       # Business logic
  repositories/   # Data access via Prisma
  middleware/     # Auth, admin, error handling
  redis/          # Distributed lock client
  queue/          # RabbitMQ producer/consumer
  socket/         # Socket.IO server
  routes/         # Express route definitions
  config/         # Environment config
```

## API Reference

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/register | No | Register user |
| POST | /api/auth/login | No | Login |
| GET | /api/auth/me | User | Current user |
| GET | /api/movies | No | List movies |
| GET | /api/movies/:id | No | Movie detail |
| GET | /api/showtimes | No | List showtimes |
| GET | /api/showtimes/:showtimeId/seats | Auth | Seat map |
| POST | /api/bookings | Auth | Create booking |
| POST | /api/bookings/payment | Auth | Mock payment |
| GET | /api/admin/bookings | Admin | All bookings |
| GET | /api/admin/logs | Admin | Audit logs |

## Booking Flow

1. User selects a seat → Socket.IO `seat:select` → Redis acquires lock (SET NX EX 300s)
2. Frontend calls POST /api/bookings → creates PENDING booking
3. User pays → POST /api/bookings/payment → status CONFIRMED, lock released, seat BOOKED
4. Lock expires after 300s → background worker releases seat, broadcasts update

## Redis Lock Strategy

- Key: `seat_lock:{showtimeId}:{seatNo}`
- TTL: 300 seconds
- Commands: SET NX EX (atomic acquire), GET + DEL (owner-checked release)
- Lock owner validated against booking.lockOwner before release

## Socket.IO Events

- Client → Server: `join`, `leave`, `seat:select`, `seat:release`
- Server → Client: `seat:locked`, `seat:released`, `seat:booked`
- Rooms scoped by showtimeId

## RabbitMQ Events

- Exchange: `booking.events` (topic)
- Events: `booking.success`, `booking.timeout`
- Consumer saves audit logs and sends mock notifications

## Testing

```bash
# Backend (Vitest)
cd backend && npx vitest run

# Frontend (Vitest)
cd frontend && npx vitest run
```

Tests use TDD (red-green-refactor) throughout. Backend tests mock Prisma/repositories. Frontend tests use happy-dom + @testing-library/react.

## Trade-offs

- **Prisma + MongoDB**: Prisma's MongoDB support is experimental — no joins, no transactions across collections. Suitable for this scope; PostgreSQL would be better for production.
- **Single Express process**: Background worker runs in the same process. For scale, extract to a separate service.
- **Mock payment**: Payment simulation only. Real integration would need Stripe/PayPal.
- **In-memory Socket.IO**: No Redis adapter for multi-instance broadcasting. Add socket.io-redis for horizontal scaling.
