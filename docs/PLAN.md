# 🎬 Cinema Ticket Booking System
## AI Coding Agent Implementation Plan

> **Objective**
>
> Build a Cinema Ticket Booking System that satisfies all assignment requirements while following production-level software architecture and engineering practices.
>
> This implementation plan is designed for AI Coding Agents (Claude Code, Codex, Cursor Agent, Gemini CLI, etc.) to execute incrementally.

---

# Project Goals

The system should demonstrate the following engineering capabilities:

- Clean Architecture
- Distributed Lock with Redis
- Event-driven Architecture using RabbitMQ
- Real-time communication using WebSocket
- Dockerized Development Environment
- Role-based Authentication
- Concurrency-safe Booking System
- Production-ready Code Structure

---

# Tech Stack

| Layer | Technology |
|---------|------------|
| Frontend | Vue 3 + Vite + Pinia + TailwindCSS |
| Backend | Go (Gin) |
| Database | MongoDB |
| Cache / Lock | Redis |
| Message Queue | RabbitMQ |
| Authentication | Firebase Authentication |
| Realtime | WebSocket |
| Container | Docker + Docker Compose |

---

# Development Principles

The AI Agent **MUST** follow these principles.

- Follow Clean Architecture
- Never place business logic inside HTTP handlers
- Use dependency injection
- Use interfaces between layers
- Environment variables only
- Consistent JSON response format
- Structured logging
- Proper error handling
- Small and maintainable functions
- Every phase must compile before continuing

---

# Development Workflow

```
Planning
    ↓
Architecture
    ↓
Project Setup
    ↓
Authentication
    ↓
Movie APIs
    ↓
Seat APIs
    ↓
Booking
    ↓
Redis Lock
    ↓
Realtime
    ↓
RabbitMQ
    ↓
Admin Dashboard
    ↓
Docker
    ↓
Testing
    ↓
README
```

---

# Phase 0 — System Design

## Goal

Finish the entire system design before writing any code.

## Deliverables

```
docs/

architecture.md

database.md

api.md

sequence.md

deployment.md
```

## Tasks

- Design system architecture
- Design folder structure
- Design database schema
- Design REST APIs
- Design WebSocket events
- Design RabbitMQ events
- Design Redis Lock strategy
- Draw sequence diagrams
- Identify assumptions
- Document trade-offs

---

# Phase 1 — Project Setup

## Goal

Initialize the entire project.

## Folder Structure

```
cinema-booking/

backend/

frontend/

docker-compose.yml

README.md
```

## Backend

Initialize

- Gin
- MongoDB Driver
- Redis Client
- RabbitMQ Client
- Firebase SDK
- JWT
- WebSocket
- Logger
- Config Loader

## Frontend

Initialize

- Vue 3
- Vite
- Vue Router
- Pinia
- Axios
- TailwindCSS

## Done Criteria

Running

```
docker compose up --build
```

must successfully start

- Backend
- Frontend
- MongoDB
- Redis
- RabbitMQ

---

# Phase 2 — Backend Architecture

## Goal

Create a production-ready Clean Architecture.

```
backend/

cmd/

internal/

config/

domain/

dto/

handler/

service/

repository/

middleware/

database/

redis/

queue/

websocket/

routes/

pkg/

utils/
```

## Rules

- Handler only handles HTTP requests
- Service contains business logic
- Repository handles database
- Infrastructure layer contains Redis, RabbitMQ and WebSocket

---

# Phase 3 — Database Design

Collections

```
users

movies

showtimes

seats

bookings

audit_logs
```

## Required Indexes

### Seats

```
showtimeId + seatNo
```

Unique

### Booking

```
userId

showtimeId

seatId
```

### Audit Log

```
createdAt
```

---

# Phase 4 — Authentication

## Goal

Implement Firebase Authentication.

### APIs

```
POST /auth/login

GET /auth/me
```

### Features

- Firebase ID Token verification
- Generate JWT
- Store User
- Assign USER role
- Middleware
- Admin Middleware

Done

```
USER

ADMIN
```

must be separated.

---

# Phase 5 — Movie Module

Implement

```
GET /movies

GET /movies/:id

GET /showtimes

GET /showtimes/:id
```

No business complexity.

---

# Phase 6 — Seat Module

Implement

```
GET /showtimes/:id/seats
```

Seat Status

```
AVAILABLE

LOCKED

BOOKED
```

Frontend

Render

```
A1

A2

A3
```

---

# Phase 7 — Booking Module

Initial booking flow.

```
User

↓

Booking API

↓

Create Pending Booking

↓

Return Booking ID
```

No Redis Lock yet.

---

# Phase 8 — Redis Distributed Lock

This is the core of the assignment.

Redis Key

```
seat_lock:{showtimeId}:{seatId}
```

TTL

```
300 seconds
```

Functions

```
AcquireLock()

ReleaseLock()

CheckLock()

ExtendLock()
```

Flow

```
Click Seat

↓

SET NX EX

↓

Success ?

↓

Create Pending Booking
```

Requirements

- No Double Booking
- Automatic expiration
- Lock owner validation

---

# Phase 9 — Payment (Mock)

API

```
POST /booking/payment
```

Flow

```
Payment Success

↓

Booking Status

↓

BOOKED

↓

Release Lock

↓

Update Seat
```

Mock payment only.

---

# Phase 10 — WebSocket

Implement WebSocket Hub.

Events

```
seat_locked

seat_released

seat_booked
```

Flow

```
Backend

↓

Broadcast

↓

Frontend

↓

Update Store

↓

UI Updates Automatically
```

---

# Phase 11 — Lock Expiration Worker

Background Worker

Runs every

```
30 seconds
```

Tasks

- Find expired bookings
- Release Redis Lock
- Update booking status
- Broadcast seat update
- Publish timeout event

---

# Phase 12 — RabbitMQ

## Producer

Publish

```
booking.success

booking.timeout
```

## Consumer

Consume

```
booking.success
```

Tasks

- Save Audit Log
- Send Notification (Mock)

Consume

```
booking.timeout
```

Tasks

- Save Audit Log

---

# Phase 13 — Admin Dashboard

Admin APIs

```
GET /admin/bookings

GET /admin/logs
```

Filter

- Movie
- User
- Date

Admin only.

---

# Phase 14 — Docker

Docker Services

```
frontend

backend

mongodb

redis

rabbitmq
```

Requirements

Single command

```
docker compose up --build
```

must start everything.

---

# Phase 15 — Testing

## Functional Testing

- Login
- Seat Selection
- Booking
- Payment
- Admin APIs

## Concurrency Testing

Scenario

```
100 Users

↓

Book A1

↓

Expected

1 Success

99 Failed
```

No Double Booking.

---

# Phase 16 — Documentation

README must include

- Architecture Diagram
- Database Design
- API Overview
- Booking Flow
- Redis Lock Strategy
- RabbitMQ Flow
- WebSocket Flow
- Docker Setup
- Trade-offs
- Future Improvements

---

# AI Coding Agent Rules

The AI Agent MUST follow these instructions throughout development.

## General Rules

- Never skip phases.
- Complete one phase before starting the next.
- Every phase must compile successfully.
- Every feature must be manually testable.
- Do not generate placeholder implementations.
- Prefer maintainability over clever code.
- Keep business logic inside Service layer.
- Use interfaces between Service and Repository.
- Avoid duplicated code.
- Use dependency injection.
- Add comments for exported functions.
- Use structured logging.
- Handle every possible error.
- Validate all user input.
- Never hardcode configuration.
- Read all configuration from environment variables.

## End of Every Phase

Before moving to the next phase, provide:

- Summary
- Files Created
- APIs Added
- Manual Test Steps
- Remaining TODOs

Only after verification should the next phase begin.

---

# Success Criteria

The project is considered complete when it satisfies all of the following:

- ✅ Clean Architecture
- ✅ Docker Compose runs successfully
- ✅ Authentication works
- ✅ Seat Map updates in real time
- ✅ Redis Distributed Lock prevents double booking
- ✅ Booking timeout automatically releases seats
- ✅ RabbitMQ handles asynchronous events
- ✅ Admin Dashboard functions correctly
- ✅ README fully documents the architecture and design decisions
- ✅ Code is production-ready and maintainable
