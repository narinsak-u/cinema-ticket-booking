# Cinema Ticket Booking — Workflows

Detailed explanation of every workflow in the system, from user actions to
backend infrastructure processes.

---

## Table of Contents

1. [System Architecture](#system-architecture)
2. [User Workflows](#user-workflows)
   - [Register](#1-register)
   - [Login](#2-login)
   - [Browse Movies](#3-browse-movies)
   - [View Movie Detail & Showtimes](#4-view-movie-detail--showtimes)
   - [Select Seat & Create Booking](#5-select-seat--create-booking)
   - [Payment (Mock)](#6-payment-mock)
3. [Backend Workflows](#backend-workflows)
   - [Redis Distributed Lock](#redis-distributed-lock)
   - [Seat Lock Expiration Worker](#seat-lock-expiration-worker)
   - [RabbitMQ Event System](#rabbitmq-event-system)
   - [Socket.IO Real-time Sync](#socketio-real-time-sync)
4. [Data Model](#data-model)
5. [API Reference](#api-reference)
6. [Middleware Pipeline](#middleware-pipeline)

---

## System Architecture

```
┌─────────────────┐     ┌──────────────────────────────────────────┐
│   Frontend       │────▶│                 Backend                   │
│  React 19        │◀────│           Express 5 + Socket.IO          │
│  Zustand + Zod   │     │                                          │
│  Axios           │     │  Controllers → Services → Repositories   │
└─────────────────┘     └──────┬───────────┬───────────┬────────────┘
                              │           │           │
                         ┌────▼───┐  ┌────▼───┐  ┌───▼──────┐
                         │MongoDB │  │ Redis  │  │ RabbitMQ │
                         │  7     │  │   7    │  │    4     │
                         │ :27017 │  │ :6379  │  │ :5672    │
                         └────────┘  └────────┘  └──────────┘
```

| Service | Role |
|---------|------|
| **Frontend** | React SPA — movie browsing, seat selection, booking UI, admin dashboard |
| **Backend** | REST API, WebSocket server, background expiration worker |
| **MongoDB** | Primary data store (Users, Movies, Showtimes, Seats, Bookings, AuditLogs) |
| **Redis** | Distributed lock for seat reservation (prevents double-booking) |
| **RabbitMQ** | Async event queue for audit logging |

---

## User Workflows

### 1. Register

**Entry point:** `/login` → toggle to "Register" form

**Steps:**

1. User fills in **name**, **email**, **password**.
2. Frontend validates with Zod (`lib/schemas.ts`):
   - Email must be valid format.
   - Password >= 6 characters.
   - Name >= 1 character.
3. Frontend sends `POST /api/auth/register` with `{ email, password, name }`.
4. Backend validates again (server-side Zod in `lib/validation.ts`), hashes
   password with **bcrypt** (10 rounds).
5. Backend creates a `User` record with role `USER`.
6. Backend signs a **JWT** (`jsonwebtoken`) with payload `{ id, role }`,
   7-day expiry.
7. Response `{ success: true, data: { token, user } }` returned.
8. Frontend stores `token` in **localStorage** and **Zustand auth store**.
9. User redirected to `/` (Home).

**Error cases:**
- Duplicate email → 409 Conflict.
- Invalid input → 400 with validation error message.

---

### 2. Login

**Entry point:** `/login`

**Steps:**

1. User enters **email** + **password**.
2. Frontend validates with Zod.
3. Frontend sends `POST /api/auth/login` with `{ email, password }`.
4. Backend looks up user by email, compares bcrypt hash.
5. Backend signs JWT, returns `{ token, user }`.
6. Token stored in localStorage + Zustand.
7. User redirected to `/`.

**Error cases:**
- Invalid credentials → 401 "Invalid email or password".

---

### 3. Browse Movies

**Entry point:** `/` (Home)

**Steps:**

1. `ProtectedRoute` checks for valid JWT; redirects to `/login` if missing.
2. `useMovies()` hook fetches `GET /api/movies` on mount.
3. Movies displayed as a grid of `MovieCard` components, each showing:
   - Title
   - Description
   - Genre
4. Clicking a card navigates to `/movies/:id`.

---

### 4. View Movie Detail & Showtimes

**Entry point:** `/movies/:id`

**Steps:**

1. Frontend fetches `GET /api/movies/:id` for movie details.
2. Frontend fetches `GET /api/showtimes`, filters client-side by `movieId`.
3. Showtime list displays for each showtime:
   - **Hall** name (e.g. "Hall 1")
   - **Start time** (localized)
   - **Price** (e.g. "$14.50")
4. User clicks **"Select Seats"** on a showtime → navigates to `/booking/:showtimeId`.

---

### 5. Select Seat & Create Booking

**Entry point:** `/booking/:showtimeId`

This is the **core workflow** — it coordinates Redis locks, WebSocket
broadcasts, and database writes to prevent double-booking.

**Steps:**

1. Frontend joins a **Socket.IO room** for the showtime (`join` event).
2. `useSeats()` hook fetches `GET /api/showtimes/:showtimeId/seats` — returns all
   seats (40 seats: rows A–E, columns 1–8).
3. **SeatMap** renders an 8-column grid with color-coded status:

   | Color | Status | Selectable? |
   |-------|--------|-------------|
   | Green `#22c55e` | AVAILABLE | Yes |
   | Amber `#f59e0b` | LOCKED (by someone else) | No |
   | Red `#ef4444` | BOOKED | No |
   | Blue `#3b82f6` | Selected by current user | Already selected |

4. **User clicks an AVAILABLE seat:**

   a. Frontend emits `seat:select` via Socket.IO (informational).

   b. Frontend sends `POST /api/bookings` with `{ showtimeId, seatNo }`.

   c. **Backend processes the booking:**

      i. Validates input with Zod (`createBookingSchema`).

      ii. Fetches seats for the showtime, finds matching `seatNo`.

      iii. **Acquires Redis distributed lock:**
      ```
      SET seat_lock:{showtimeId}:{seatNo} {userId} NX EX 300
      ```
      - `NX` = only set if key doesn't exist (atomic).
      - `EX 300` = auto-expire after 300 seconds (5 minutes).

      iv. If lock acquisition **fails** → returns 409 "Seat is locked by another user".

      v. If seat status ≠ `AVAILABLE` → returns 409 "Seat not available".

      vi. Creates `Booking` record with status `PENDING`.

      vii. Updates `Seat` status to `LOCKED`.

      viii. **Broadcasts** `seat:locked` to all clients in the showtime room via Socket.IO.

   d. Response returns `{ bookingId, seatNo }`.

   e. Frontend shows **BookingSummary** component with "Pay Now" button.

5. **All other clients** receive `seat:locked` via WebSocket — their seat
   maps update in real-time (seat turns amber, unselectable).

---

### 6. Payment (Mock)

**Entry point:** "Pay Now" button in BookingSummary

**Steps:**

1. User clicks **"Pay Now"**.
2. Frontend sends `POST /api/bookings/payment` with `{ bookingId }`.
3. **Backend processes payment:**

   a. Validates booking exists, belongs to current user, status is `PENDING`.

   b. Updates booking status → `CONFIRMED`.

   c. Updates seat status → `BOOKED`.

   d. **Broadcasts** `seat:booked` to all clients in the showtime room.

   e. **Releases Redis lock:**
   ```
   GET seat_lock:{showtimeId}:{seatNo}
   → compare owner to userId
   → DEL seat_lock:{showtimeId}:{seatNo}
   ```

   f. **Publishes** `booking.success` event to RabbitMQ exchange.

4. Frontend shows "Booking confirmed!" alert.
5. Frontend resets booking state, navigates to Home.
6. All other clients see the seat turn **red** (BOOKED) in real-time.

---

## Backend Workflows

### Redis Distributed Lock

A distributed lock prevents two users from booking the same seat
simultaneously. Redis `SET NX EX` is atomic — exactly one caller wins.

**Key format:** `seat_lock:{showtimeId}:{seatNo}`

| Operation | Implementation | When Used |
|-----------|---------------|-----------|
| `acquire(key, owner)` | `SET key owner EX 300 NX` | When user clicks a seat |
| `release(key, owner)` | `GET key` → compare owner → `DEL key` | On successful payment |
| `check(key)` | `GET key` | To see who holds the lock |
| `extend(key, owner)` | `GET key` → compare → `EXPIRE key 300` | To extend TTL (not yet used) |

**TTL:** 300 seconds (5 minutes). If a user locks a seat but doesn't pay
within 5 minutes, the lock auto-expires.

**Why Redis?** A database-level row lock alone doesn't prevent race
conditions across multiple backend instances. Redis `SET NX` is a single
atomic operation — it's the simplest correct distributed lock.

---

### Seat Lock Expiration Worker

A background worker runs inside the backend process as a `setInterval`.

**Schedule:** Every 30,000ms (30 seconds).

**Logic:**

1. Query `Booking` for all records where:
   - `status = PENDING`
   - `createdAt < (now - 300s)`
2. For each expired booking:
   a. Update booking status → `EXPIRED`.
   b. Release Redis lock (`seat_lock:{showtimeId}:{seatNo}`).
   c. Broadcast `seat:released` via Socket.IO to the showtime room.
   d. Publish `booking.timeout` to RabbitMQ exchange.
3. All clients see the seat turn **green** (AVAILABLE) again.

**Cleanup:** The worker returns a `clearInterval` function called during
graceful shutdown (`SIGTERM` / `SIGINT`).

---

### RabbitMQ Event System

An async event system for audit logging and (future) notifications.

**Topology:**

```
┌──────────────┐     ┌─────────────────┐     ┌──────────────┐
│  Exchange     │────▶│  Queue          │────▶│  Consumer    │
│ booking.events│     │ booking.audit   │     │  (AuditLog)  │
│  (topic)      │     │  (durable)      │     │              │
└──────────────┘     └─────────────────┘     └──────────────┘
```

| Component | Details |
|-----------|---------|
| Exchange | `booking.events` — topic, durable |
| Queue | `booking.audit` — durable |
| Binding | `booking.*` (matches `booking.success`, `booking.timeout`, etc.) |

**Events published:**

| Event | When | Publisher |
|-------|------|-----------|
| `booking.success` | On confirmed payment | `booking.service.ts` → `payment()` |
| `booking.timeout` | On lock expiration | `queue/worker.ts` → expiration timer |

**Consumer behavior:**
- Each message is saved as an `AuditLog` record (`event` = routing key, `data` = message content).
- Messages ack'd on success, nack'd (no requeue) on failure.
- If RabbitMQ is down, the app still starts — queue connection is async and non-blocking.

---

### Socket.IO Real-time Sync

Socket.IO enables real-time seat map updates across all clients viewing
the same showtime.

**Rooms:** Each showtime has its own room (`showtimeId`). Clients join on
page load, leave on navigation away.

**Client → Server events:**

| Event | Payload | Handler |
|-------|---------|---------|
| `join` | `showtimeId` | Joins the room |
| `leave` | `showtimeId` | Leaves the room |
| `seat:select` | `{ showtimeId, seatNo }` | Informational (booking handled via HTTP) |

**Server → Client events (broadcast to room):**

| Event | Payload | When |
|-------|---------|------|
| `seat:locked` | `{ showtimeId, seatNo, userId }` | Booking created (seat locked) |
| `seat:booked` | `{ showtimeId, seatNo, userId }` | Payment confirmed |
| `seat:released` | `{ showtimeId, seatNo }` | Lock expired (auto-release) |

**Flow:**

```
Client A clicks seat ──▶ POST /api/bookings ──▶ Redis lock acquired
                                                 │
                              ┌──────────────────┘
                              ▼
                    Socket.IO broadcasts
                    seat:locked to room
                              │
                  ┌───────────┴───────────┐
                  ▼                       ▼
            Client B updates        Client C updates
            seat → amber            seat → amber
```

---

## Data Model

```
User
├── id          String   @id @default(auto()) @map("_id")
├── email       String   @unique
├── password    String
├── name        String
├── role        Role     @default(USER)
├── createdAt   DateTime @default(now())
├── updatedAt   DateTime @updatedAt
└── bookings    Booking[]

Movie
├── id          String   @id @default(auto()) @map("_id")
├── title       String
├── description String
├── posterUrl   String?
├── duration    Int
├── genre       String
├── createdAt   DateTime @default(now())
├── updatedAt   DateTime @updatedAt
└── showtimes   Showtime[]

Showtime
├── id          String   @id @default(auto()) @map("_id")
├── movieId     String
├── movie       Movie    @relation(fields: [movieId], references: [id])
├── hall        String
├── startTime   DateTime
├── price       Float
├── createdAt   DateTime @default(now())
├── updatedAt   DateTime @updatedAt
├── seats       Seat[]
└── bookings    Booking[]

Seat
├── id          String   @id @default(auto()) @map("_id")
├── showtimeId  String
├── showtime    Showtime @relation(fields: [showtimeId], references: [id])
├── seatNo      String
├── status      SeatStatus @default(AVAILABLE)
├── version     Int      @default(0)
├── createdAt   DateTime @default(now())
└── @@unique([showtimeId, seatNo])

Booking
├── id          String   @id @default(auto()) @map("_id")
├── userId      String
├── user        User     @relation(fields: [userId], references: [id])
├── showtimeId  String
├── showtime    Showtime @relation(fields: [showtimeId], references: [id])
├── seatId      String
├── seat        Seat     @relation(fields: [seatId], references: [id])
├── status      BookingStatus @default(PENDING)
├── lockOwner   String?
├── createdAt   DateTime @default(now())
├── updatedAt   DateTime @updatedAt
└── @@unique([showtimeId, seatNo])

AuditLog
├── id          String   @id @default(auto()) @map("_id")
├── event       String
├── data        String
└── createdAt   DateTime @default(now())
```

**Enums:**

```
Role:         USER | ADMIN
SeatStatus:   AVAILABLE | LOCKED | BOOKED
BookingStatus: PENDING | CONFIRMED | EXPIRED
```

---

## API Reference

All responses use envelope format: `{ success: boolean, data?: T, error?: string }`

### Auth

| Method | Path | Auth | Body | Description |
|--------|------|------|------|-------------|
| `POST` | `/api/auth/register` | No | `{ email, password, name }` | Register new user |
| `POST` | `/api/auth/login` | No | `{ email, password }` | Login |
| `GET` | `/api/auth/me` | JWT | — | Get current user profile |

Rate limit: 100 requests per 15 minutes on `/api/auth`.

### Movies

| Method | Path | Auth | Query | Description |
|--------|------|------|-------|-------------|
| `GET` | `/api/movies` | No | `?limit=&offset=` | List movies |
| `GET` | `/api/movies/:id` | No | — | Get movie details |

### Showtimes

| Method | Path | Auth | Query | Description |
|--------|------|------|-------|-------------|
| `GET` | `/api/showtimes` | No | `?limit=&offset=` | List showtimes (includes movie) |
| `GET` | `/api/showtimes/:id` | No | — | Get showtime details |

### Seats

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/showtimes/:showtimeId/seats` | JWT | Get all seats for a showtime |

### Bookings

| Method | Path | Auth | Body | Description |
|--------|------|------|------|-------------|
| `POST` | `/api/bookings` | JWT | `{ showtimeId, seatNo }` | Create booking (acquires lock) |
| `POST` | `/api/bookings/payment` | JWT | `{ bookingId }` | Confirm payment |

### Admin

| Method | Path | Auth | Query | Description |
|--------|------|------|-------|-------------|
| `GET` | `/api/admin/bookings` | JWT + ADMIN | `?movieId=&userId=&date=` | List bookings |
| `GET` | `/api/admin/logs` | JWT + ADMIN | — | List audit logs |

---

## Middleware Pipeline

Requests flow through middleware in this order:

```
Request
  │
  ▼
CORS ──────── Allow origin from CORS_ORIGIN env
  │
  ▼
Helmet ────── Security headers
  │
  ▼
JSON Parser ─ express.json()
  │
  ▼
Rate Limit ── /api/auth only: 100 req / 15 min
  │
  ▼
Auth ──────── Validate JWT, attach { id, role } to req.user
  │
  ▼
Admin ─────── Check req.user.role === ADMIN (admin routes only)
  │
  ▼
Route Handler
  │
  ▼
Error Handler ── Global catch (AppError → status code, else 500)
```

---

## Seed Data

Auto-seeded on first server start when database is empty:

| Type | Data |
|------|------|
| **Movies** | Inception (Sci-Fi, 148min), The Matrix (Action, 136min), Interstellar (Sci-Fi, 169min) |
| **Showtimes** | 9 total — 3 per movie, each in Hall 1/2/3, different times, prices ($12.50, $14.50, $16.50) |
| **Seats** | 40 per showtime — rows A–E × columns 1–8, all AVAILABLE |
| **Admin** | `admin@cinema.com` / `admin123` (role: ADMIN) |
