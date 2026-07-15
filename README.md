# Cinema Ticket Booking System

A full-stack cinema ticket booking system with real-time seat updates, distributed locking, and event-driven architecture.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite 8, Zustand 5, Zod 3, Axios, Socket.IO Client |
| Backend | Express 5, TypeScript 6, Prisma 6.19 (MongoDB) |
| Database | MongoDB 7 (replica set) |
| Cache / Lock | Redis 7 |
| Message Queue | RabbitMQ 4 |
| Realtime | Socket.IO 4 |
| Auth | JWT (email/password, bcrypt) |
| Container | Docker Compose |
| Testing | Vitest |

## Quick Start

```bash
docker compose up --build
```

This starts all services: frontend (:5173), backend (:3000), MongoDB (:27017), Redis (:6379), RabbitMQ (:5672).

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

The backend auto-seeds an empty database on first start (3 movies, 9 showtimes, 360 seats, admin user).

## Architecture

Clean Architecture layering: Controllers → Services → Repositories (Prisma)

```
backend/src/
  controllers/    # HTTP handlers (no business logic)
  services/       # Business logic (auth, movie, showtime, seat, booking, admin)
  repositories/   # Data access via Prisma + centralized interfaces.ts
  middleware/     # Auth, admin, error handling (AppError)
  redis/          # Distributed lock client (Lua-based acquire/release)
  queue/          # RabbitMQ producer, consumer, worker
  socket/         # Socket.IO server + broadcast helpers
  routes/         # Express route definitions
  config/         # Environment config
  lib/            # Zod validation schemas, ApiResponse type
```

Frontend uses Zustand stores, custom hooks, and typed components:

```
frontend/src/
  pages/          # Home, MovieDetail, Booking, Login, Admin
  components/     # Navbar, SeatMap, MovieCard, LoginForm, BookingSummary
  stores/         # auth.store, movie.store, booking.store, socket.store
  hooks/          # useAuth, useMovies, useSeats
  lib/            # api.ts (Axios), schemas.ts (Zod), socket.ts (Socket.IO)
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
| POST | /api/bookings | Auth | Create booking (acquires Redis lock) |
| POST | /api/bookings/payment | Auth | Mock payment (confirms booking, releases lock) |
| GET | /api/admin/bookings | Admin | All bookings |
| GET | /api/admin/logs | Admin | Audit logs |

## Booking Flow

1. User selects a seat → Frontend sends POST /api/bookings
2. Backend acquires Redis lock (SET NX EX 300s), creates PENDING booking, broadcasts `seat:locked` via Socket.IO
3. User pays → POST /api/bookings/payment → status CONFIRMED, lock released, seat BOOKED, publishes `booking.success` to RabbitMQ
4. Lock expires after 300s → background worker releases seat, broadcasts `seat:released`, publishes `booking.timeout`

## Redis Lock Strategy

- Key: `seat_lock:{showtimeId}:{seatNo}`
- TTL: 300 seconds
- Commands: SET NX EX (atomic acquire), GET + DEL (owner-checked release)
- Lock owner validated against booking.lockOwner before release

## Socket.IO Events

- Client → Server: `join`, `leave`, `seat:select`
- Server → Client: `seat:locked`, `seat:released`, `seat:booked`
- Rooms scoped by showtimeId

## RabbitMQ Events

- Exchange: `booking.events` (topic, durable)
- Queue: `booking.audit` (durable, bound to `booking.*`)
- Events: `booking.success` (on payment), `booking.timeout` (on lock expiration)
- Consumer saves audit logs to MongoDB

## Testing

```bash
# Backend (28 tests)
cd backend && npx vitest run

# Frontend (5 tests)
cd frontend && npx vitest run
```

Tests use TDD (red-green-refactor) throughout. Backend tests mock Prisma/repositories. Frontend tests use happy-dom + @testing-library/react.

## Trade-offs

- **Prisma 6.19 + MongoDB**: Prisma 7 doesn't support MongoDB yet — using 6.19 with `engine: "classic"`. MongoDB requires replica set for transactions.
- **Single Express process**: Background worker runs in the same process. For scale, extract to a separate service.
- **Mock payment**: Payment simulation only. Real integration would need Stripe/PayPal.
- **In-memory Socket.IO**: No Redis adapter for multi-instance broadcasting. Add socket.io-redis for horizontal scaling.
