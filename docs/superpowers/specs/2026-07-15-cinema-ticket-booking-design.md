# Cinema Ticket Booking System — Design Spec

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + TypeScript + Vite + Zustand + Zod + Axios |
| Backend | Express 5 + TypeScript + Prisma ORM |
| Database | MongoDB |
| Cache / Lock | Redis |
| Message Queue | RabbitMQ |
| Realtime | Socket.IO |
| Auth | JWT (email/password) |
| Testing | Vitest (TDD across all layers) |
| Container | Docker + Docker Compose |

## Project Structure

```
cinema-ticket-booking/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── controllers/      # HTTP handlers only
│   │   ├── services/         # Business logic
│   │   ├── repositories/     # Prisma data access
│   │   ├── middleware/       # Auth, admin, error handlers
│   │   ├── redis/            # Redis lock client
│   │   ├── queue/            # RabbitMQ producer/consumer
│   │   ├── socket/           # Socket.IO setup + handlers
│   │   ├── routes/           # Route definitions
│   │   ├── config/           # Env config loader
│   │   └── index.ts          # Entry point
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI (SeatMap, MovieCard, etc.)
│   │   ├── pages/            # Route pages (Home, Booking, Admin)
│   │   ├── stores/           # Zustand stores
│   │   ├── lib/              # Zod schemas, API client, socket client
│   │   ├── hooks/            # Custom hooks
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml
└── README.md
```

## Clean Architecture Layering

- **Controllers** — parse HTTP request, call service, send HTTP response. No business logic.
- **Services** — all business logic. Orchestrate repositories, Redis, queue, socket.
- **Repositories** — Prisma data access behind interfaces (e.g. `IBookingRepository`).
- **Infrastructure** — `redis/`, `queue/`, `socket/` are isolated modules.

## Database Schema (Prisma + MongoDB)

```
User         — id, email (unique), password, name, role (USER|ADMIN), createdAt, updatedAt
Movie        — id, title, description, posterUrl, duration, genre, createdAt, updatedAt
Showtime     — id, movieId -> Movie, hall, startTime, price, createdAt
Seat         — id, showtimeId -> Showtime, seatNo, status (AVAILABLE|LOCKED|BOOKED), version, createdAt
               @@unique([showtimeId, seatNo])
Booking      — id, userId -> User, showtimeId -> Showtime, seatId -> Seat, status (PENDING|CONFIRMED|CANCELLED|EXPIRED), lockOwner?, createdAt, updatedAt
               @@unique([showtimeId, seatId])
AuditLog     — id, event, data (JSON string), createdAt
```

## REST API

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/register | No | Register user |
| POST | /api/auth/login | No | Login, returns JWT |
| GET | /api/auth/me | User | Current user |
| GET | /api/movies | No | List movies |
| GET | /api/movies/:id | No | Movie detail |
| GET | /api/showtimes | No | List showtimes |
| GET | /api/showtimes/:id | No | Showtime detail |
| GET | /api/showtimes/:id/seats | Auth | Seat map by showtime |
| POST | /api/bookings | Auth | Create booking (acquire lock) |
| POST | /api/bookings/payment | Auth | Mock payment → confirm |
| GET | /api/admin/bookings | Admin | All bookings (filterable) |
| GET | /api/admin/logs | Admin | Audit logs |

All responses: `{ success: boolean, data?: T, error?: string }`

## Booking Flow

1. User clicks seat → Socket.IO `seat:select` → backend acquires Redis lock (SET NX EX 300s), broadcasts `seat:locked`
2. Frontend calls POST /api/bookings → creates PENDING booking with lockOwner, returns booking ID
3. User clicks pay → POST /api/bookings/payment → status CONFIRMED, release Redis lock, broadcast `seat:booked`, publish `booking.success` to RabbitMQ
4. If lock expires (300s) → background worker (every 30s) finds expired bookings, releases lock, broadcasts `seat:released`, publishes `booking.timeout`

## Socket.IO Events

Server → Client: `seat:locked`, `seat:released`, `seat:booked`
Client → Server: `seat:select`, `seat:release` (rooms scoped by showtimeId)

## RabbitMQ Events

- `booking.success` → consumer: save audit log, send mock notification
- `booking.timeout` → consumer: save audit log
- Producer publishes on payment confirm and lock expiry

## Redis Distributed Lock

- Key: `seat_lock:{showtimeId}:{seatId}`
- TTL: 300 seconds
- Functions: acquire, release, check, extend (via SET NX EX)
- Lock owner validated against booking.lockOwner

## Testing Strategy (TDD with Vitest)

- **Vitest** as the test runner for both frontend and backend (in-memory Prisma for backend)
- Write tests **before** implementation code (red-green-refactor)
- Test files co-located: `*.test.ts` next to source files
- Backend tests: unit test services with mocked repositories, integration test controllers with supertest
- Frontend tests: component rendering with happy-dom, hook behavior, store logic
- Concurrency test: simulate 100 users booking 1 seat, assert exactly 1 success

## Code Quality

- **JSDoc** on all exported functions, interfaces, and classes — describe what, not how
- Consistent JSON response envelope: `{ success, data?, error? }`
- ESLint (already configured) + strict TypeScript checks
- All user input validated with Zod at the controller boundary
- Lint (`npm run lint`) and type-check (`npx tsc --noEmit`) must pass before every commit — configure as a pre-commit hook or CI gate

## Implementation Phases

1. **Project Setup** — init backend (Express, Prisma, MongoDB), configure frontend (React, Zustand, Axios, Zod), Docker Compose with MongoDB + Redis + RabbitMQ + services
2. **Backend Architecture** — folder structure, interfaces, DI wiring, error middleware, config loader
3. **Database** — Prisma schema, seed script
4. **Authentication** — register, login, JWT middleware, admin middleware
5. **Movie Module** — movie + showtime CRUD APIs, public endpoints
6. **Seat Module** — seat map generation, seat status API
7. **Booking (Baseline)** — create booking, no Redis lock yet
8. **Redis Lock** — acquire/release/check/extend, integrate into booking flow
9. **Payment (Mock)** — mock payment endpoint, confirm booking
10. **Socket.IO** — real-time seat status broadcasting
11. **Lock Expiration Worker** — background job, broadcast release
12. **RabbitMQ** — producers + consumers, audit log integration
13. **Admin Dashboard** — admin API endpoints
14. **Docker** — finalize Docker Compose, health checks
15. **Testing** — concurrency stress test (100 users, 1 seat, 1 booking succeeds). Integration smoke tests. Tests written TDD-style (red-green-refactor) throughout all prior phases with Vitest.
16. **README** — full documentation

## Success Criteria

- Docker Compose single-command startup
- JWT auth with USER/ADMIN roles
- Seat map updates in real time via Socket.IO
- Redis lock prevents double booking
- Lock timeout auto-releases seats
- RabbitMQ handles async events
- Admin APIs for bookings and audit logs
- No double booking under concurrency
