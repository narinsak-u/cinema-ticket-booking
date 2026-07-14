# Cinema Ticket Booking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-stack cinema ticket booking system with Clean Architecture, Redis distributed locks, Socket.IO real-time updates, RabbitMQ event-driven messaging, and Docker deployment.

**Architecture:** Express 5 backend with Clean Architecture layering (controllers → services → repositories), Prisma ORM on MongoDB, JWT authentication, Redis for distributed seat locks, Socket.IO for real-time seat status, RabbitMQ for async audit logging.

**Tech Stack:** React 19 + Zustand + Zod + Axios (frontend), Express 5 + Prisma + MongoDB (backend), Redis + RabbitMQ + Socket.IO (infrastructure), Vitest (TDD), Docker Compose.

---

## File Structure Mapping

```
backend/
├── prisma/
│   └── schema.prisma                    # Database models
├── src/
│   ├── index.ts                         # Entry point, server bootstrap
│   ├── app.ts                           # Express app setup, middleware wiring
│   ├── config/
│   │   └── env.ts                       # Env var loader
│   ├── controllers/
│   │   ├── auth.controller.ts           # register, login, me
│   │   ├── movie.controller.ts          # list, detail
│   │   ├── showtime.controller.ts       # list, detail
│   │   ├── seat.controller.ts           # seat map by showtime
│   │   ├── booking.controller.ts        # create, payment
│   │   └── admin.controller.ts          # bookings, logs
│   ├── services/
│   │   ├── auth.service.ts              # register, login, JWT
│   │   ├── movie.service.ts             # movie CRUD
│   │   ├── showtime.service.ts          # showtime CRUD
│   │   ├── seat.service.ts              # seat map, status
│   │   ├── booking.service.ts           # booking flow, lock orchestration
│   │   └── admin.service.ts             # admin queries
│   ├── repositories/
│   │   ├── interfaces.ts                # IUserRepo, IMovieRepo, etc.
│   │   ├── user.repository.ts
│   │   ├── movie.repository.ts
│   │   ├── showtime.repository.ts
│   │   ├── seat.repository.ts
│   │   ├── booking.repository.ts
│   │   └── audit-log.repository.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts           # JWT verification
│   │   ├── admin.middleware.ts          # role check
│   │   └── error.middleware.ts          # global error handler
│   ├── redis/
│   │   ├── client.ts                    # Redis connection
│   │   └── lock.ts                      # AcquireLock, ReleaseLock, etc.
│   ├── queue/
│   │   ├── client.ts                    # RabbitMQ connection
│   │   ├── producer.ts                  # publish booking.success/timeout
│   │   └── consumer.ts                  # consume events, save audit logs
│   ├── socket/
│   │   ├── index.ts                     # Socket.IO server setup
│   │   └── handlers.ts                  # seat:select, seat:release handlers
│   └── routes/
│       ├── auth.routes.ts
│       ├── movie.routes.ts
│       ├── showtime.routes.ts
│       ├── seat.routes.ts
│       ├── booking.routes.ts
│       └── admin.routes.ts
├── package.json
└── tsconfig.json

frontend/
├── src/
│   ├── main.tsx                         # Entry point
│   ├── App.tsx                          # Router setup
│   ├── pages/
│   │   ├── Home.tsx                     # Movie listing
│   │   ├── MovieDetail.tsx              # Movie + showtime selection
│   │   ├── Booking.tsx                  # Seat map + booking flow
│   │   └── Admin.tsx                    # Admin dashboard
│   ├── components/
│   │   ├── SeatMap.tsx                  # Seat grid
│   │   ├── MovieCard.tsx                # Movie card
│   │   ├── BookingSummary.tsx           # Booking details + pay
│   │   └── LoginForm.tsx                # Auth form
│   ├── stores/
│   │   ├── auth.store.ts                # Auth state
│   │   ├── movie.store.ts               # Movie/showtime state
│   │   ├── booking.store.ts             # Booking flow state
│   │   └── socket.store.ts              # Socket.IO connection
│   ├── lib/
│   │   ├── api.ts                       # Axios instance
│   │   ├── schemas.ts                   # Zod validation schemas
│   │   └── socket.ts                    # Socket.IO client
│   └── hooks/
│       ├── useAuth.ts
│       ├── useMovies.ts
│       └── useSeats.ts
├── package.json
└── vite.config.ts

docker-compose.yml
```

---

### Phase 1: Project Setup

Set up the backend (Express + Prisma + MongoDB), configure frontend dependencies, and create Docker Compose with all services.

#### Task 1.1: Initialize Backend Project

**Files:**
- Create: `backend/package.json`
- Create: `backend/tsconfig.json`

- [ ] **Create `backend/package.json`**

```json
{
  "name": "backend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "lint": "eslint src/",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  },
  "dependencies": {
    "express": "^5.2.1",
    "@prisma/client": "^7.0.0",
    "jsonwebtoken": "^9.0.0",
    "bcryptjs": "^3.0.0",
    "ioredis": "^5.6.0",
    "amqplib": "^0.10.0",
    "socket.io": "^4.8.0",
    "zod": "^3.24.0",
    "cors": "^2.8.5",
    "dotenv": "^16.4.0"
  },
  "devDependencies": {
    "@types/express": "^5.0.6",
    "@types/node": "^26.1.1",
    "@types/jsonwebtoken": "^9.0.0",
    "@types/bcryptjs": "^3.0.0",
    "@types/amqplib": "^0.10.0",
    "@types/cors": "^2.8.0",
    "@types/ws": "^8.18.0",
    "prisma": "^7.0.0",
    "typescript": "^7.0.2",
    "tsx": "^4.19.0",
    "vitest": "^3.1.0",
    "eslint": "^10.6.0",
    "supertest": "^7.1.0",
    "@types/supertest": "^6.0.0"
  }
}
```

- [ ] **Create `backend/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "es2023",
    "module": "nodenext",
    "rewriteRelativeImportExtensions": true,
    "erasableSyntaxOnly": true,
    "verbatimModuleSyntax": true,
    "noEmit": true,
    "strict": true,
    "skipLibCheck": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "esModuleInterop": true,
    "resolveJsonModule": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Install backend dependencies**

Run: `npm install`

- [ ] **Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Commit**

```bash
git add backend/package.json backend/tsconfig.json backend/package-lock.json
git commit -m "feat: initialize backend project with Express + TypeScript"
```

#### Task 1.2: Initialize Prisma with MongoDB

**Files:**
- Create: `backend/prisma/schema.prisma`

- [ ] **Run Prisma init**

Run: `npx prisma init --datasource-provider mongodb`

- [ ] **Update `backend/prisma/schema.prisma`**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  email     String   @unique
  password  String
  name      String
  role      String   @default("USER")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  bookings  Booking[]
}

model Movie {
  id          String    @id @default(auto()) @map("_id") @db.ObjectId
  title       String
  description String
  posterUrl   String
  duration    Int
  genre       String
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  showtimes   Showtime[]
}

model Showtime {
  id        String    @id @default(auto()) @map("_id") @db.ObjectId
  movieId   String    @db.ObjectId
  movie     Movie     @relation(fields: [movieId], references: [id])
  hall      String
  startTime DateTime
  price     Float
  createdAt DateTime  @default(now())
  seats     Seat[]
  bookings  Booking[]
}

model Seat {
  id         String   @id @default(auto()) @map("_id") @db.ObjectId
  showtimeId String   @db.ObjectId
  showtime   Showtime @relation(fields: [showtimeId], references: [id])
  seatNo     String
  status     String   @default("AVAILABLE")
  version    Int      @default(0)
  createdAt  DateTime @default(now())

  @@unique([showtimeId, seatNo])
}

model Booking {
  id         String   @id @default(auto()) @map("_id") @db.ObjectId
  userId     String   @db.ObjectId
  user       User     @relation(fields: [userId], references: [id])
  showtimeId String   @db.ObjectId
  showtime   Showtime @relation(fields: [showtimeId], references: [id])
  seatId     String   @db.ObjectId
  seat       Seat     @relation(fields: [seatId], references: [id])
  status     String   @default("PENDING")
  lockOwner  String?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@unique([showtimeId, seatId])
}

model AuditLog {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  event     String
  data      String
  createdAt DateTime @default(now())
}
```

- [ ] **Generate Prisma client**

Run: `npx prisma generate`
Expected: Client generated successfully

- [ ] **Commit**

```bash
git add backend/prisma/
git commit -m "feat: add Prisma schema with MongoDB models"
```

#### Task 1.3: Create Docker Compose

**Files:**
- Create: `docker-compose.yml`
- Create: `backend/.env.example`

- [ ] **Create `docker-compose.yml`**

```yaml
services:
  mongodb:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    healthcheck:
      test: echo 'db.runCommand("ping").ok' | mongosh --quiet
      interval: 10s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      retries: 5

  rabbitmq:
    image: rabbitmq:4-management-alpine
    ports:
      - "5672:5672"
      - "15672:15672"
    healthcheck:
      test: ["CMD", "rabbitmqctl", "status"]
      interval: 10s
      retries: 5

  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: "mongodb://mongodb:27017/cinema_booking"
      REDIS_URL: "redis://redis:6379"
      RABBITMQ_URL: "amqp://rabbitmq:5672"
      JWT_SECRET: "change-me-in-production"
      PORT: "3000"
    depends_on:
      mongodb:
        condition: service_healthy
      redis:
        condition: service_healthy
      rabbitmq:
        condition: service_healthy

  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    depends_on:
      - backend

volumes:
  mongodb_data:
```

- [ ] **Create `backend/.env.example`**

```
DATABASE_URL=mongodb://localhost:27017/cinema_booking
REDIS_URL=redis://localhost:6379
RABBITMQ_URL=amqp://localhost:5672
JWT_SECRET=change-me-in-production
PORT=3000
```

- [ ] **Create `backend/Dockerfile`**

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
EXPOSE 3000
CMD ["npm", "run", "dev"]
```

- [ ] **Create `frontend/Dockerfile`**

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]
```

- [ ] **Commit**

```bash
git add docker-compose.yml backend/Dockerfile frontend/Dockerfile backend/.env.example
git commit -m "feat: add Docker Compose with all services"
```

#### Task 1.4: Backend Config Loader

**Files:**
- Create: `backend/src/config/env.ts`

- [ ] **Create `backend/src/config/env.ts`**

```typescript
import 'dotenv/config'

export const env = {
  PORT: Number(process.env.PORT) || 3000,
  DATABASE_URL: process.env.DATABASE_URL ?? 'mongodb://localhost:27017/cinema_booking',
  REDIS_URL: process.env.REDIS_URL ?? 'redis://localhost:6379',
  RABBITMQ_URL: process.env.RABBITMQ_URL ?? 'amqp://localhost:5672',
  JWT_SECRET: process.env.JWT_SECRET ?? 'change-me-in-production',
} as const
```

- [ ] **Verify compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Commit**

```bash
git add backend/src/config/env.ts
git commit -m "feat: add environment config loader"
```

#### Task 1.5: Setup Frontend with React + Zustand + Zod + Axios

**Files:**
- Modify: `frontend/package.json`

- [ ] **Add frontend dependencies**

```json
// Add to frontend/package.json > dependencies:
"zustand": "^5.0.0",
"zod": "^3.24.0",
"axios": "^1.8.0",
"react-router-dom": "^7.5.0",
"socket.io-client": "^4.8.0"

// Add to frontend/package.json > devDependencies:
"@testing-library/react": "^16.3.0",
"@testing-library/jest-dom": "^6.6.0",
"happy-dom": "^17.0.0",
"vitest": "^3.1.0"
```

- [ ] **Install**

Run: `npm install`

- [ ] **Update `frontend/vite.config.ts`**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
      '/socket.io': {
        target: 'http://localhost:3000',
        ws: true,
      },
    },
  },
})
```

- [ ] **Commit**

```bash
git add frontend/package.json frontend/package-lock.json frontend/vite.config.ts
git commit -m "feat: setup frontend with Zustand, Zod, Axios, Socket.IO client"
```

#### Task 1.6: Vitest Config for Backend

**Files:**
- Create: `backend/vitest.config.ts`

- [ ] **Create `backend/vitest.config.ts`**

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/index.ts'],
    },
  },
})
```

- [ ] **Commit**

```bash
git add backend/vitest.config.ts
git commit -m "feat: add Vitest config for backend"
```

---

### Phase 2: Backend Architecture

Set up Express app, error middleware, and the app entry point.

#### Task 2.1: Express App Setup

**Files:**
- Create: `backend/src/app.ts`
- Create: `backend/src/middleware/error.middleware.ts`

- [ ] **Write failing test for app creation**

Create `backend/src/app.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { createApp } from './app.js'

describe('createApp', () => {
  it('returns an Express app', () => {
    const app = createApp()
    expect(app).toBeDefined()
    expect(typeof app.use).toBe('function')
  })
})
```

- [ ] **Run to verify it fails**

Run: `npx vitest run src/app.test.ts`
Expected: FAIL - import error for `createApp`

- [ ] **Create `backend/src/middleware/error.middleware.ts`**

```typescript
import type { Request, Response, NextFunction } from 'express'

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ success: false, error: err.message })
    return
  }
  console.error('Unhandled error:', err)
  res.status(500).json({ success: false, error: 'Internal server error' })
}
```

- [ ] **Create `backend/src/app.ts`**

```typescript
import express from 'express'
import cors from 'cors'
import { errorHandler } from './middleware/error.middleware.js'

export function createApp() {
  const app = express()

  app.use(cors())
  app.use(express.json())

  // Routes will be added in later phases

  app.use(errorHandler)

  return app
}
```

- [ ] **Run test to pass**

Run: `npx vitest run src/app.test.ts`
Expected: PASS

- [ ] **Commit**

```bash
git add backend/src/app.ts backend/src/middleware/error.middleware.ts backend/src/app.test.ts
git commit -m "feat: add Express app with error middleware"
```

#### Task 2.2: Entry Point

**Files:**
- Create: `backend/src/index.ts`

- [ ] **Create `backend/src/index.ts`**

```typescript
import { createApp } from './app.js'
import { env } from './config/env.js'

const app = createApp()

app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`)
})
```

- [ ] **Verify compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Commit**

```bash
git add backend/src/index.ts
git commit -m "feat: add server entry point"
```

---

### Phase 3: Database Seeding

#### Task 3.1: Prisma Seed Script

**Files:**
- Create: `backend/prisma/seed.ts`

- [ ] **Write failing test for seed data structure**

Create `backend/prisma/seed.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { createShowtimeSeats } from './seed.js'

describe('createShowtimeSeats', () => {
  it('generates seat labels for a 5x8 hall', () => {
    const seats = createShowtimeSeats(5, 8)
    expect(seats).toHaveLength(40)
    expect(seats[0]).toBe('A1')
    expect(seats[39]).toBe('E8')
  })

  it('generates seat labels for a 3x4 hall', () => {
    const seats = createShowtimeSeats(3, 4)
    expect(seats).toHaveLength(12)
    expect(seats[0]).toBe('A1')
    expect(seats[11]).toBe('C4')
  })
})
```

- [ ] **Run to verify it fails**

Run: `npx vitest run prisma/seed.test.ts`
Expected: FAIL

- [ ] **Export helper from `backend/prisma/seed.ts`**

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const ROWS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

export function createShowtimeSeats(rows: number, cols: number): string[] {
  const seats: string[] = []
  for (let r = 0; r < rows; r++) {
    for (let c = 1; c <= cols; c++) {
      seats.push(`${ROWS[r]}${c}`)
    }
  }
  return seats
}

async function main() {
  const movies = await Promise.all([
    prisma.movie.create({
      data: {
        title: 'Inception',
        description: 'A thief who steals corporate secrets through dream-sharing technology',
        posterUrl: '/posters/inception.jpg',
        duration: 148,
        genre: 'Sci-Fi',
      },
    }),
    prisma.movie.create({
      data: {
        title: 'The Matrix',
        description: 'A computer hacker learns about the true nature of reality',
        posterUrl: '/posters/matrix.jpg',
        duration: 136,
        genre: 'Action',
      },
    }),
    prisma.movie.create({
      data: {
        title: 'Interstellar',
        description: "A team of explorers travel through a wormhole in space",
        posterUrl: '/posters/interstellar.jpg',
        duration: 169,
        genre: 'Sci-Fi',
      },
    }),
  ])

  const now = new Date()
  for (const movie of movies) {
    for (let day = 0; day < 3; day++) {
      const showtime = await prisma.showtime.create({
        data: {
          movieId: movie.id,
          hall: `Hall ${(day % 3) + 1}`,
          startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + day, 10 + day * 3, 0),
          price: 12.5 + day * 2,
        },
      })

      const seatLabels = createShowtimeSeats(5, 8)
      await prisma.seat.createMany({
        data: seatLabels.map((seatNo) => ({
          showtimeId: showtime.id,
          seatNo,
        })),
      })
    }
  }

  const adminEmail = 'admin@cinema.com'
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } })
  if (!existing) {
    const bcrypt = await import('bcryptjs')
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: await bcrypt.hash('admin123', 10),
        name: 'Admin',
        role: 'ADMIN',
      },
    })
  }

  console.log('Seed complete')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
```

- [ ] **Run test to pass**

Run: `npx vitest run prisma/seed.test.ts`
Expected: PASS

- [ ] **Add seed script to `backend/package.json`**

```json
"prisma": {
  "seed": "tsx prisma/seed.ts"
}
```

- [ ] **Commit**

```bash
git add backend/prisma/seed.ts backend/prisma/seed.test.ts backend/package.json
git commit -m "feat: add database seed script with movies, showtimes, seats, admin"
```

---

### Phase 4: Authentication

#### Task 4.1: Auth Repository

**Files:**
- Create: `backend/src/repositories/interfaces.ts`
- Create: `backend/src/repositories/user.repository.ts`

- [ ] **Write failing test for IUserRepository interface**

Create `backend/src/repositories/user.repository.test.ts`:

```typescript
import { describe, it, expect, vi } from 'vitest'
import type { IUserRepository } from './interfaces.js'

describe('IUserRepository', () => {
  it('defines the contract', () => {
    const repo: IUserRepository = {
      findByEmail: vi.fn(),
      create: vi.fn(),
      findById: vi.fn(),
    }
    expect(repo.findByEmail).toBeDefined()
    expect(repo.create).toBeDefined()
    expect(repo.findById).toBeDefined()
  })
})
```

- [ ] **Run to verify it fails**

Run: `npx vitest run src/repositories/user.repository.test.ts`
Expected: FAIL

- [ ] **Create `backend/src/repositories/interfaces.ts`**

```typescript
import type { User } from '@prisma/client'

export interface CreateUserData {
  email: string
  password: string
  name: string
}

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>
  findById(id: string): Promise<User | null>
  create(data: CreateUserData): Promise<User>
}

export interface IMovieRepository {
  findAll(): Promise<Movie[]>
  findById(id: string): Promise<Movie | null>
}
```

- [ ] **Create `backend/src/repositories/user.repository.ts`**

```typescript
import type { PrismaClient, User } from '@prisma/client'
import type { CreateUserData, IUserRepository } from './interfaces.js'

export function createUserRepository(prisma: PrismaClient): IUserRepository {
  return {
    async findByEmail(email: string): Promise<User | null> {
      return prisma.user.findUnique({ where: { email } })
    },

    async findById(id: string): Promise<User | null> {
      return prisma.user.findUnique({ where: { id } })
    },

    async create(data: CreateUserData): Promise<User> {
      return prisma.user.create({ data })
    },
  }
}
```

- [ ] **Run test to pass**

Run: `npx vitest run src/repositories/user.repository.test.ts`
Expected: PASS

- [ ] **Commit**

```bash
git add backend/src/repositories/interfaces.ts backend/src/repositories/user.repository.ts backend/src/repositories/user.repository.test.ts
git commit -m "feat: add user repository with interface"
```

#### Task 4.2: Auth Service

**Files:**
- Create: `backend/src/services/auth.service.ts`

- [ ] **Write failing test for register + login**

Create `backend/src/services/auth.service.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { IUserRepository } from '../repositories/interfaces.js'
import { createAuthService } from './auth.service.js'

describe('AuthService', () => {
  const mockRepo: IUserRepository = {
    findByEmail: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
  }
  const service = createAuthService(mockRepo, 'test-secret')

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('registers a new user and returns a token', async () => {
    vi.mocked(mockRepo.findByEmail).mockResolvedValue(null)
    vi.mocked(mockRepo.create).mockResolvedValue({
      id: 'user-1',
      email: 'test@test.com',
      password: 'hashed',
      name: 'Test',
      role: 'USER',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const result = await service.register({ email: 'test@test.com', password: 'password123', name: 'Test' })

    expect(result.success).toBe(true)
    expect(result.data).toHaveProperty('token')
    expect(result.data).toHaveProperty('user')
    expect(result.data.user.email).toBe('test@test.com')
  })

  it('rejects duplicate email', async () => {
    vi.mocked(mockRepo.findByEmail).mockResolvedValue({
      id: 'existing',
      email: 'test@test.com',
      password: 'hashed',
      name: 'Test',
      role: 'USER',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const result = await service.register({ email: 'test@test.com', password: 'password123', name: 'Test' })

    expect(result.success).toBe(false)
    expect(result.error).toBe('Email already registered')
  })

  it('logs in with valid credentials', async () => {
    const bcrypt = await import('bcryptjs')
    const hashed = await bcrypt.hash('password123', 10)
    vi.mocked(mockRepo.findByEmail).mockResolvedValue({
      id: 'user-1',
      email: 'test@test.com',
      password: hashed,
      name: 'Test',
      role: 'USER',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const result = await service.login({ email: 'test@test.com', password: 'password123' })

    expect(result.success).toBe(true)
    expect(result.data).toHaveProperty('token')
  })

  it('rejects invalid password', async () => {
    vi.mocked(mockRepo.findByEmail).mockResolvedValue({
      id: 'user-1',
      email: 'test@test.com',
      password: 'hashed',
      name: 'Test',
      role: 'USER',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const result = await service.login({ email: 'test@test.com', password: 'wrong' })

    expect(result.success).toBe(false)
    expect(result.error).toBe('Invalid credentials')
  })

  it('rejects unknown email on login', async () => {
    vi.mocked(mockRepo.findByEmail).mockResolvedValue(null)

    const result = await service.login({ email: 'unknown@test.com', password: 'password123' })

    expect(result.success).toBe(false)
    expect(result.error).toBe('Invalid credentials')
  })
})
```

- [ ] **Run to verify it fails**

Run: `npx vitest run src/services/auth.service.test.ts`
Expected: FAIL

- [ ] **Create `backend/src/services/auth.service.ts`**

```typescript
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import type { IUserRepository } from '../repositories/interfaces.js'
import { AppError } from '../middleware/error.middleware.js'

export interface AuthResult {
  token: string
  user: {
    id: string
    email: string
    name: string
    role: string
  }
}

export function createAuthService(userRepo: IUserRepository, jwtSecret: string) {
  return {
    async register(data: { email: string; password: string; name: string }) {
      const existing = await userRepo.findByEmail(data.email)
      if (existing) {
        return { success: false as const, error: 'Email already registered' }
      }

      const hashed = await bcrypt.hash(data.password, 10)
      const user = await userRepo.create({
        email: data.email,
        password: hashed,
        name: data.name,
      })

      const token = jwt.sign({ id: user.id, role: user.role }, jwtSecret, { expiresIn: '7d' })
      return {
        success: true as const,
        data: { token, user: { id: user.id, email: user.email, name: user.name, role: user.role } },
      }
    },

    async login(data: { email: string; password: string }) {
      const user = await userRepo.findByEmail(data.email)
      if (!user) {
        return { success: false as const, error: 'Invalid credentials' }
      }

      const valid = await bcrypt.compare(data.password, user.password)
      if (!valid) {
        return { success: false as const, error: 'Invalid credentials' }
      }

      const token = jwt.sign({ id: user.id, role: user.role }, jwtSecret, { expiresIn: '7d' })
      return {
        success: true as const,
        data: { token, user: { id: user.id, email: user.email, name: user.name, role: user.role } },
      }
    },

    async getMe(userId: string) {
      const user = await userRepo.findById(userId)
      if (!user) {
        return { success: false as const, error: 'User not found' }
      }
      return {
        success: true as const,
        data: { id: user.id, email: user.email, name: user.name, role: user.role },
      }
    },
  }
}
```

- [ ] **Run test to pass**

Run: `npx vitest run src/services/auth.service.test.ts`
Expected: PASS

- [ ] **Commit**

```bash
git add backend/src/services/auth.service.ts backend/src/services/auth.service.test.ts
git commit -m "feat: add auth service with register, login, getMe"
```

#### Task 4.3: Auth Middleware

**Files:**
- Create: `backend/src/middleware/auth.middleware.ts`
- Create: `backend/src/middleware/admin.middleware.ts`

- [ ] **Write failing test for auth middleware**

Create `backend/src/middleware/auth.middleware.test.ts`:

```typescript
import { describe, it, expect, vi } from 'vitest'
import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { createAuthMiddleware } from './auth.middleware.js'

describe('authMiddleware', () => {
  const middleware = createAuthMiddleware('test-secret')

  it('calls next() with valid token', () => {
    const token = jwt.sign({ id: 'user-1', role: 'USER' }, 'test-secret')
    const req = { headers: { authorization: `Bearer ${token}` } } as unknown as Request
    const next = vi.fn() as NextFunction

    middleware(req, {} as Response, next)

    expect(next).toHaveBeenCalled()
    expect((req as any).user).toBeDefined()
    expect((req as any).user.id).toBe('user-1')
  })

  it('returns 401 without token', () => {
    const req = { headers: {} } as Request
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as unknown as Response
    const next = vi.fn() as NextFunction

    middleware(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
  })
})
```

- [ ] **Run to verify it fails**

Run: `npx vitest run src/middleware/auth.middleware.test.ts`
Expected: FAIL

- [ ] **Create `backend/src/middleware/auth.middleware.ts`**

```typescript
import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface JwtPayload {
  id: string
  role: string
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}

export function createAuthMiddleware(secret: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const header = req.headers.authorization
    if (!header?.startsWith('Bearer ')) {
      res.status(401).json({ success: false, error: 'No token provided' })
      return
    }

    try {
      const payload = jwt.verify(header.slice(7), secret) as JwtPayload
      req.user = payload
      next()
    } catch {
      res.status(401).json({ success: false, error: 'Invalid token' })
    }
  }
}
```

- [ ] **Create `backend/src/middleware/admin.middleware.ts`**

```typescript
import type { Request, Response, NextFunction } from 'express'

export function adminOnly(req: Request, res: Response, next: NextFunction): void {
  if (req.user?.role !== 'ADMIN') {
    res.status(403).json({ success: false, error: 'Admin access required' })
    return
  }
  next()
}
```

- [ ] **Run test to pass**

Run: `npx vitest run src/middleware/auth.middleware.test.ts`
Expected: PASS

- [ ] **Commit**

```bash
git add backend/src/middleware/auth.middleware.ts backend/src/middleware/admin.middleware.ts backend/src/middleware/auth.middleware.test.ts
git commit -m "feat: add auth and admin middleware"
```

#### Task 4.4: Auth Controller + Routes

**Files:**
- Create: `backend/src/controllers/auth.controller.ts`
- Create: `backend/src/routes/auth.routes.ts`

- [ ] **Write failing test for auth controller**

Create `backend/src/controllers/auth.controller.test.ts`:

```typescript
import { describe, it, expect, vi } from 'vitest'
import type { Request, Response } from 'express'
import { createAuthController } from './auth.controller.js'

describe('AuthController', () => {
  const mockService = {
    register: vi.fn(),
    login: vi.fn(),
    getMe: vi.fn(),
  }
  const controller = createAuthController(mockService as any)

  it('calls service.register on register', async () => {
    const req = { body: { email: 'test@test.com', password: 'pass', name: 'Test' } } as Request
    const res = { json: vi.fn() } as unknown as Response
    mockService.register.mockResolvedValue({ success: true, data: { token: 'abc', user: {} } })

    await controller.register(req, res)

    expect(mockService.register).toHaveBeenCalledWith({ email: 'test@test.com', password: 'pass', name: 'Test' })
    expect(res.json).toHaveBeenCalled()
  })
})
```

- [ ] **Run to verify it fails**

Run: `npx vitest run src/controllers/auth.controller.test.ts`
Expected: FAIL

- [ ] **Create `backend/src/controllers/auth.controller.ts`**

```typescript
import type { Request, Response } from 'express'

export function createAuthController(authService: ReturnType<typeof import('../services/auth.service.js')['createAuthService']>) {
  return {
    async register(req: Request, res: Response) {
      const result = await authService.register(req.body)
      res.json(result)
    },

    async login(req: Request, res: Response) {
      const result = await authService.login(req.body)
      res.json(result)
    },

    async getMe(req: Request, res: Response) {
      const result = await authService.getMe(req.user!.id)
      res.json(result)
    },
  }
}
```

- [ ] **Create `backend/src/routes/auth.routes.ts`**

```typescript
import { Router } from 'express'

export function createAuthRoutes(controller: ReturnType<typeof import('../controllers/auth.controller.js')['createAuthController']>, authMiddleware: ReturnType<typeof import('../middleware/auth.middleware.js')['createAuthMiddleware']>) {
  const router = Router()

  router.post('/register', controller.register)
  router.post('/login', controller.login)
  router.get('/me', authMiddleware, controller.getMe)

  return router
}
```

- [ ] **Run test to pass**

Run: `npx vitest run src/controllers/auth.controller.test.ts`
Expected: PASS

- [ ] **Wire routes into `backend/src/app.ts`**

```typescript
import { createAuthController } from './controllers/auth.controller.js'
import { createAuthService } from './services/auth.service.js'
import { createUserRepository } from './repositories/user.repository.js'
import { createAuthMiddleware } from './middleware/auth.middleware.js'
import { createAuthRoutes } from './routes/auth.routes.js'
```

Add route mounting after `app.use(express.json())`.

- [ ] **Commit**

```bash
git add backend/src/controllers/auth.controller.ts backend/src/controllers/auth.controller.test.ts backend/src/routes/auth.routes.ts
git commit -m "feat: add auth controller and routes"
```

---

### Phase 5: Movie Module

#### Task 5.1: Movie Repository

**Files:**
- Create: `backend/src/repositories/movie.repository.ts`

- [ ] **Write failing test**

```typescript
import { describe, it, expect, vi } from 'vitest'
import type { IMovieRepository } from './interfaces.js'

describe('IMovieRepository', () => {
  it('defines the contract', () => {
    const repo: IMovieRepository = {
      findAll: vi.fn(),
      findById: vi.fn(),
    }
    expect(repo.findAll).toBeDefined()
    expect(repo.findById).toBeDefined()
  })
})
```

- [ ] **Run to fail, then implement**

```typescript
// backend/src/repositories/movie.repository.ts
import type { Movie } from '@prisma/client'
import type { PrismaClient } from '@prisma/client'
import type { IMovieRepository } from './interfaces.js'

export function createMovieRepository(prisma: PrismaClient): IMovieRepository {
  return {
    async findAll(): Promise<Movie[]> {
      return prisma.movie.findMany({ orderBy: { createdAt: 'desc' } })
    },
    async findById(id: string): Promise<Movie | null> {
      return prisma.movie.findUnique({ where: { id } })
    },
  }
}
```

- [ ] **Pass test, commit**

```bash
git add backend/src/repositories/movie.repository.ts
git commit -m "feat: add movie repository"
```

#### Task 5.2: Movie Service

**Files:**
- Create: `backend/src/services/movie.service.ts`

- [ ] **Write failing test + implement**

```typescript
// Test
import { describe, it, expect, vi } from 'vitest'
import { createMovieService } from './movie.service.js'

describe('MovieService', () => {
  const mockRepo = { findAll: vi.fn(), findById: vi.fn() }
  const service = createMovieService(mockRepo as any)

  it('returns all movies', async () => {
    mockRepo.findAll.mockResolvedValue([{ id: '1', title: 'Inception' }])
    const result = await service.getAll()
    expect(result.success).toBe(true)
    expect(result.data).toHaveLength(1)
  })
})
```

```typescript
// Implementation
import type { IMovieRepository } from '../repositories/interfaces.js'

export function createMovieService(movieRepo: IMovieRepository) {
  return {
    async getAll() {
      const movies = await movieRepo.findAll()
      return { success: true as const, data: movies }
    },
    async getById(id: string) {
      const movie = await movieRepo.findById(id)
      if (!movie) return { success: false as const, error: 'Movie not found' }
      return { success: true as const, data: movie }
    },
  }
}
```

- [ ] **Pass + commit**

```bash
git add backend/src/services/movie.service.ts
git commit -m "feat: add movie service"
```

#### Task 5.3: Movie Controller + Routes

**Files:**
- Create: `backend/src/controllers/movie.controller.ts`
- Create: `backend/src/routes/movie.routes.ts`

- [ ] **Write failing test + implement**

```typescript
// controller test
import { describe, it, expect, vi } from 'vitest'
import type { Request, Response } from 'express'
import { createMovieController } from './movie.controller.js'

describe('MovieController', () => {
  const mockService = { getAll: vi.fn(), getById: vi.fn() }
  const controller = createMovieController(mockService as any)

  it('lists all movies', async () => {
    const req = {} as Request
    const res = { json: vi.fn() } as unknown as Response
    mockService.getAll.mockResolvedValue({ success: true, data: [] })
    await controller.getAll(req, res)
    expect(res.json).toHaveBeenCalledWith({ success: true, data: [] })
  })
})
```

```typescript
// controller
import type { Request, Response } from 'express'

export function createMovieController(movieService: ReturnType<typeof import('../services/movie.service.js')['createMovieService']>) {
  return {
    async getAll(_req: Request, res: Response) {
      const result = await movieService.getAll()
      res.json(result)
    },
    async getById(req: Request, res: Response) {
      const result = await movieService.getById(req.params.id)
      res.json(result)
    },
  }
}
```

```typescript
// routes
import { Router } from 'express'

export function createMovieRoutes(controller: ReturnType<typeof import('../controllers/movie.controller.js')['createMovieController']>) {
  const router = Router()
  router.get('/', controller.getAll)
  router.get('/:id', controller.getById)
  return router
}
```

- [ ] **Pass test + wire into app.ts, commit**

```bash
git add backend/src/controllers/movie.controller.ts backend/src/routes/movie.routes.ts
git commit -m "feat: add movie controller and routes"
```

---

### Phase 6: Showtime Module

#### Task 6.1: Showtime Repository

**Files:**
- Create: `backend/src/repositories/showtime.repository.ts`

Same pattern — interface `IShowtimeRepository` in `interfaces.ts`, implementation with `findAll()`, `findById()`, `findByMovieId()`.

- [ ] **Implement + commit**

```bash
git commit -m "feat: add showtime repository"
```

#### Task 6.2: Showtime Service

**Files:**
- Create: `backend/src/services/showtime.service.ts`

- [ ] **Implement + commit**

```bash
git commit -m "feat: add showtime service"
```

#### Task 6.3: Showtime Controller + Routes

**Files:**
- Create: `backend/src/controllers/showtime.controller.ts`
- Create: `backend/src/routes/showtime.routes.ts`

- [ ] **Implement + wire into app.ts, commit**

```bash
git commit -m "feat: add showtime controller and routes"
```

---

### Phase 7: Seat Module

#### Task 7.1: Seat Repository

**Files:**
- Create: `backend/src/repositories/seat.repository.ts`
- Extend: `backend/src/repositories/interfaces.ts`

Add to `interfaces.ts`:

```typescript
export interface ISeatRepository {
  findByShowtime(showtimeId: string): Promise<Seat[]>
  updateStatus(id: string, status: string, version: number): Promise<Seat | null>
  bulkCreate(data: { showtimeId: string; seatNo: string }[]): Promise<void>
}
```

- [ ] **Implement + commit**

```bash
git commit -m "feat: add seat repository"
```

#### Task 7.2: Seat Service

**Files:**
- Create: `backend/src/services/seat.service.ts`

- [ ] **Test and implement**

```typescript
export function createSeatService(seatRepo: ISeatRepository) {
  return {
    async getSeatMap(showtimeId: string) {
      const seats = await seatRepo.findByShowtime(showtimeId)
      return { success: true as const, data: seats }
    },
  }
}
```

- [ ] **Commit**

```bash
git commit -m "feat: add seat service"
```

#### Task 7.3: Seat Controller + Routes

**Files:**
- Create: `backend/src/controllers/seat.controller.ts`
- Create: `backend/src/routes/seat.routes.ts`

- [ ] **Implement + wire + commit**

```bash
git commit -m "feat: add seat controller and routes"
```

---

### Phase 8: Booking Baseline (No Redis Lock)

#### Task 8.1: Booking Repository

**Files:**
- Create: `backend/src/repositories/booking.repository.ts`
- Extend: `backend/src/repositories/interfaces.ts`

Add `IBookingRepository` with `create`, `findById`, `findByUser`, `findExpired`, `updateStatus`.

- [ ] **Implement + commit**

#### Task 8.2: Booking Service (Baseline)

**Files:**
- Create: `backend/src/services/booking.service.ts`

- [ ] **Write failing test for create + payment**

```typescript
describe('BookingService', () => {
  it('creates a pending booking')
  it('confirms booking on payment')
  it('rejects booking for already booked seat')
})
```

- [ ] **Implement + commit**

#### Task 8.3: Booking Controller + Routes

**Files:**
- Create: `backend/src/controllers/booking.controller.ts`
- Create: `backend/src/routes/booking.routes.ts`

- [ ] **Implement + wire + commit**

---

### Phase 9: Redis Distributed Lock

#### Task 9.1: Redis Client

**Files:**
- Create: `backend/src/redis/client.ts`

```typescript
import Redis from 'ioredis'
import { env } from '../config/env.js'

export const redis = new Redis(env.REDIS_URL)
```

- [ ] **Implement + commit**

#### Task 9.2: Redis Lock

**Files:**
- Create: `backend/src/redis/lock.ts`

- [ ] **Write failing test**

```typescript
import { describe, it, expect, vi } from 'vitest'
import { createRedisLock } from './lock.js'

describe('RedisLock', () => {
  const mockRedis = {
    set: vi.fn(),
    get: vi.fn(),
    del: vi.fn(),
    expire: vi.fn(),
  }
  const lock = createRedisLock(mockRedis as any, 300)

  it('acquires a lock successfully', async () => {
    vi.mocked(mockRedis.set).mockResolvedValue('OK')
    const result = await lock.acquire('seat_lock:1:A1', 'owner-1')
    expect(result).toBe(true)
    expect(mockRedis.set).toHaveBeenCalledWith('seat_lock:1:A1', 'owner-1', 'NX', 'EX', 300)
  })

  it('fails to acquire when already locked', async () => {
    vi.mocked(mockRedis.set).mockResolvedValue(null)
    const result = await lock.acquire('seat_lock:1:A1', 'owner-2')
    expect(result).toBe(false)
  })

  it('releases lock only for the owner', async () => {
    vi.mocked(mockRedis.get).mockResolvedValue('owner-1')
    vi.mocked(mockRedis.del).mockResolvedValue(1)
    const result = await lock.release('seat_lock:1:A1', 'owner-1')
    expect(result).toBe(true)
  })

  it('refuses release for wrong owner', async () => {
    vi.mocked(mockRedis.get).mockResolvedValue('owner-1')
    const result = await lock.release('seat_lock:1:A1', 'owner-2')
    expect(result).toBe(false)
    expect(mockRedis.del).not.toHaveBeenCalled()
  })
})
```

- [ ] **Run to fail, then implement**

```typescript
import type Redis from 'ioredis'

export function createRedisLock(redis: Redis, ttlSeconds: number) {
  return {
    async acquire(key: string, owner: string): Promise<boolean> {
      const result = await redis.set(key, owner, 'NX', 'EX', ttlSeconds)
      return result === 'OK'
    },

    async release(key: string, owner: string): Promise<boolean> {
      const value = await redis.get(key)
      if (value !== owner) return false
      await redis.del(key)
      return true
    },

    async check(key: string): Promise<string | null> {
      return redis.get(key)
    },

    async extend(key: string, owner: string): Promise<boolean> {
      const value = await redis.get(key)
      if (value !== owner) return false
      await redis.expire(key, ttlSeconds)
      return true
    },
  }
}
```

- [ ] **Pass test + commit**

```bash
git add backend/src/redis/client.ts backend/src/redis/lock.ts
git commit -m "feat: add Redis distributed lock"
```

#### Task 9.3: Integrate Lock into Booking Service

**Files:**
- Modify: `backend/src/services/booking.service.ts`

- [ ] **Update booking service to acquire lock before creating booking, release on payment, validate lockOwner**

- [ ] **Write integration tests + commit**

---

### Phase 10: Payment (Mock)

#### Task 10.1: Payment Endpoint

**Files:**
- Modify: `backend/src/controllers/booking.controller.ts`
- Modify: `backend/src/services/booking.service.ts`

- [ ] **Add `POST /api/bookings/payment`**

Service receives bookingId, sets status to CONFIRMED, releases Redis lock, publishes `booking.success` to RabbitMQ.

```typescript
async payment(bookingId: string, userId: string) {
  const booking = await bookingRepo.findById(bookingId)
  if (!booking) return { success: false, error: 'Booking not found' }
  if (booking.userId !== userId) return { success: false, error: 'Not your booking' }
  if (booking.status !== 'PENDING') return { success: false, error: 'Invalid status' }

  await bookingRepo.updateStatus(bookingId, 'CONFIRMED')
  await redisLock.release(`seat_lock:${booking.showtimeId}:${booking.seatId}`, booking.lockOwner!)
  await seatRepo.updateStatus(booking.seatId, 'BOOKED', booking.seat.version)
  await queueProducer.publish('booking.success', { bookingId, userId, showtimeId: booking.showtimeId })

  return { success: true, data: { id: bookingId, status: 'CONFIRMED' } }
}
```

- [ ] **Test + commit**

---

### Phase 11: Socket.IO

#### Task 11.1: Socket.IO Server Setup

**Files:**
- Create: `backend/src/socket/index.ts`
- Create: `backend/src/socket/handlers.ts`

- [ ] **Write failing test**

```typescript
import { describe, it, expect, vi } from 'vitest'

describe('SocketHandlers', () => {
  it('broadcasts seat:locked on seat:select', () => {
    const mockIo = { to: vi.fn().mockReturnThis(), emit: vi.fn() }
    const { createSocketHandlers } = require('./handlers.js') // will fail — not exported yet

    const handlers = createSocketHandlers(mockIo)
    handlers.handleSeatSelect({ showtimeId: 's1', seatNo: 'A1', userId: 'u1' })

    expect(mockIo.to).toHaveBeenCalledWith('s1')
    expect(mockIo.emit).toHaveBeenCalledWith('seat:locked', {
      showtimeId: 's1', seatNo: 'A1', userId: 'u1',
    })
  })
})
```

- [ ] **Implement**

```typescript
// backend/src/socket/index.ts
import { Server as HttpServer } from 'http'
import { Server } from 'socket.io'
import { createRedisLock } from '../redis/lock.js'
import { redis } from '../redis/client.js'

export function createSocketServer(httpServer: HttpServer) {
  const io = new Server(httpServer, { cors: { origin: '*' } })
  const lock = createRedisLock(redis, 300)

  io.on('connection', (socket) => {
    socket.on('seat:select', async ({ showtimeId, seatNo, userId }) => {
      const key = `seat_lock:${showtimeId}:${seatNo}`
      const acquired = await lock.acquire(key, userId)
      if (acquired) {
        socket.to(showtimeId).emit('seat:locked', { showtimeId, seatNo, userId })
      }
    })

    socket.on('seat:release', async ({ showtimeId, seatNo, userId }) => {
      const key = `seat_lock:${showtimeId}:${seatNo}`
      await lock.release(key, userId)
      socket.to(showtimeId).emit('seat:released', { showtimeId, seatNo })
    })

    socket.on('join', (showtimeId: string) => {
      socket.join(showtimeId)
    })
  })

  return io
}
```

```typescript
// backend/src/socket/handlers.ts
import type { Server } from 'socket.io'

export function broadcastSeatBooked(io: Server, showtimeId: string, seatNo: string, userId: string) {
  io.to(showtimeId).emit('seat:booked', { showtimeId, seatNo, userId })
}

export function broadcastSeatReleased(io: Server, showtimeId: string, seatNo: string) {
  io.to(showtimeId).emit('seat:released', { showtimeId, seatNo })
}
```

- [ ] **Wire into `backend/src/index.ts` + commit**

---

### Phase 12: Lock Expiration Worker

#### Task 12.1: Background Worker

**Files:**
- Create: `backend/src/queue/worker.ts`

- [ ] **Write failing test**

```typescript
import { describe, it, expect, vi } from 'vitest'
import { createExpirationWorker } from '../queue/worker.js'

describe('ExpirationWorker', () => {
  it('processes expired bookings and releases locks', async () => {
    const mockBookingRepo = {
      findExpired: vi.fn().mockResolvedValue([
        { id: 'b1', showtimeId: 's1', seatId: 'seat1', lockOwner: 'u1', seat: { seatNo: 'A1' } },
      ]),
      updateStatus: vi.fn(),
    }
    const mockRedisLock = { release: vi.fn().mockResolvedValue(true) }
    const mockSeatRepo = {}
    const mockIo = { to: vi.fn().mockReturnThis(), emit: vi.fn() }
    const mockProducer = { publish: vi.fn() }

    const { startExpirationWorker } = await import('../queue/worker.js') // will fail
    const cleanup = startExpirationWorker(mockBookingRepo as any, mockRedisLock as any, mockSeatRepo as any, mockIo as any, mockProducer as any)

    // Manually trigger
    // Assertions
    cleanup()
  })
})
```

- [ ] **Implement**

```typescript
export function startExpirationWorker(
  bookingRepo: IBookingRepository,
  redisLock: ReturnType<typeof createRedisLock>,
  seatRepo: ISeatRepository,
  io: Server,
  queueProducer: ReturnType<typeof createQueueProducer>,
) {
  const INTERVAL_MS = 30_000
  const LOCK_TTL_SECONDS = 300

  setInterval(async () => {
    const cutoff = new Date(Date.now() - LOCK_TTL_SECONDS * 1000)
    const expired = await bookingRepo.findExpired(cutoff)

    for (const booking of expired) {
      await bookingRepo.updateStatus(booking.id, 'EXPIRED')
      await redisLock.release(`seat_lock:${booking.showtimeId}:${booking.seatId}`, booking.lockOwner!)
      broadcastSeatReleased(io, booking.showtimeId, booking.seat.seatNo)
      await queueProducer.publish('booking.timeout', { bookingId: booking.id })
    }
  }, INTERVAL_MS)
}
```

- [ ] **Commit**

---

### Phase 13: RabbitMQ

#### Task 13.1: RabbitMQ Client + Producer

**Files:**
- Create: `backend/src/queue/client.ts`
- Create: `backend/src/queue/producer.ts`

- [ ] **Implement**

```typescript
// backend/src/queue/client.ts
import amqp from 'amqplib'
import { env } from '../config/env.js'

export async function createQueueClient() {
  const conn = await amqp.connect(env.RABBITMQ_URL)
  const channel = await conn.createChannel()
  await channel.assertExchange('booking.events', 'topic', { durable: true })
  return { conn, channel }
}
```

```typescript
// backend/src/queue/producer.ts
import type { Channel } from 'amqplib'

export function createQueueProducer(channel: Channel) {
  return {
    async publish(event: string, data: Record<string, unknown>) {
      channel.publish('booking.events', event, Buffer.from(JSON.stringify(data)), { persistent: true })
    },
  }
}
```

- [ ] **Test + commit**

#### Task 13.2: RabbitMQ Consumer

**Files:**
- Create: `backend/src/queue/consumer.ts`

- [ ] **Implement**

```typescript
export async function startConsumers(channel: Channel, auditLogRepo: IAuditLogRepository) {
  const queue = await channel.assertQueue('booking.audit', { durable: true })
  await channel.bindQueue(queue.queue, 'booking.events', 'booking.*')

  channel.consume(queue.queue, async (msg) => {
    if (!msg) return
    const data = JSON.parse(msg.content.toString())
    await auditLogRepo.create({ event: msg.fields.routingKey, data: msg.content.toString() })
    channel.ack(msg)
  })
}
```

- [ ] **Test + commit**

---

### Phase 14: Admin Dashboard

#### Task 14.1: Admin Controller + Routes

**Files:**
- Create: `backend/src/controllers/admin.controller.ts`
- Create: `backend/src/services/admin.service.ts`
- Create: `backend/src/routes/admin.routes.ts`

- [ ] **Test + implement**

Admin endpoints:
- `GET /api/admin/bookings?movieId=&userId=&date=` — list all bookings with filters
- `GET /api/admin/logs` — list audit logs

- [ ] **Wire into app.ts + commit**

---

### Phase 15: Frontend Pages

#### Task 15.1: API Client + Auth Store

**Files:**
- Create: `frontend/src/lib/api.ts`
- Create: `frontend/src/lib/schemas.ts`
- Create: `frontend/src/stores/auth.store.ts`
- Create: `frontend/src/stores/socket.store.ts`

- [ ] **Implement API client**

```typescript
// frontend/src/lib/api.ts
import axios from 'axios'

export const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
```

- [ ] **Implement Zod schemas**

```typescript
// frontend/src/lib/schemas.ts
import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
```

- [ ] **Write failing test for auth store**

```typescript
import { describe, it, expect } from 'vitest'
import { useAuthStore } from './auth.store.js'

describe('authStore', () => {
  it('starts unauthenticated', () => {
    const store = useAuthStore.getState()
    expect(store.token).toBeNull()
    expect(store.user).toBeNull()
  })

  it('sets token and user on login', () => {
    useAuthStore.getState().setAuth({ token: 'abc', user: { id: '1', email: 'a@b.com', name: 'A', role: 'USER' } })
    const store = useAuthStore.getState()
    expect(store.token).toBe('abc')
    expect(store.user?.email).toBe('a@b.com')
  })

  it('clears auth on logout', () => {
    useAuthStore.getState().logout()
    const store = useAuthStore.getState()
    expect(store.token).toBeNull()
  })
})
```

- [ ] **Implement auth store**

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  token: string | null
  user: { id: string; email: string; name: string; role: string } | null
  setAuth: (data: { token: string; user: AuthState['user'] }) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (data) => set({ token: data.token, user: data.user }),
      logout: () => set({ token: null, user: null }),
    }),
    { name: 'auth-storage' },
  ),
)
```

- [ ] **Write failing test for socket store**

```typescript
import { describe, it, expect } from 'vitest'
import { useSocketStore } from './socket.store.js'

describe('socketStore', () => {
  it('starts disconnected', () => {
    expect(useSocketStore.getState().connected).toBe(false)
  })
})
```

- [ ] **Implement socket store**

```typescript
import { create } from 'zustand'
import { io, type Socket } from 'socket.io-client'

interface SocketState {
  socket: Socket | null
  connected: boolean
  connect: () => void
  disconnect: () => void
}

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  connected: false,
  connect: () => {
    const s = io()
    s.on('connect', () => set({ connected: true }))
    s.on('disconnect', () => set({ connected: false }))
    set({ socket: s })
  },
  disconnect: () => {
    get().socket?.close()
    set({ socket: null, connected: false })
  },
}))
```

- [ ] **Run tests, pass, commit**

```bash
git add frontend/src/lib/api.ts frontend/src/lib/schemas.ts frontend/src/stores/auth.store.ts frontend/src/stores/socket.store.ts
git commit -m "feat: add API client, Zod schemas, auth and socket stores"
```

#### Task 15.2: Login Page + Movie Listing

**Files:**
- Create: `frontend/src/pages/Home.tsx`
- Create: `frontend/src/pages/MovieDetail.tsx`
- Create: `frontend/src/components/MovieCard.tsx`
- Create: `frontend/src/components/LoginForm.tsx`
- Create: `frontend/src/stores/movie.store.ts`

- [ ] **Implement + test + commit**

#### Task 15.3: Booking Page with SeatMap

**Files:**
- Create: `frontend/src/pages/Booking.tsx`
- Create: `frontend/src/components/SeatMap.tsx`
- Create: `frontend/src/components/BookingSummary.tsx`
- Create: `frontend/src/stores/booking.store.ts`
- Create: `frontend/src/hooks/useSeats.ts`

- [ ] **Write failing test for SeatMap**

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SeatMap } from './SeatMap.js'

describe('SeatMap', () => {
  const seats = [
    { id: '1', seatNo: 'A1', status: 'AVAILABLE' },
    { id: '2', seatNo: 'A2', status: 'LOCKED' },
    { id: '3', seatNo: 'A3', status: 'BOOKED' },
  ]

  it('renders all seats', () => {
    render(<SeatMap seats={seats as any} onSelect={vi.fn()} />)
    expect(screen.getByText('A1')).toBeDefined()
    expect(screen.getByText('A2')).toBeDefined()
    expect(screen.getByText('A3')).toBeDefined()
  })

  it('disables booked seats', () => {
    render(<SeatMap seats={seats as any} onSelect={vi.fn()} />)
    const bookedBtn = screen.getByText('A3').closest('button')
    expect(bookedBtn?.disabled).toBe(true)
  })
})
```

- [ ] **Implement SeatMap**

```typescript
import type { Seat } from '../lib/schemas.js'

interface SeatMapProps {
  seats: Seat[]
  selectedSeat?: string | null
  onSelect: (seatNo: string) => void
}

export function SeatMap({ seats, selectedSeat, onSelect }: SeatMapProps) {
  const colorMap: Record<string, string> = {
    AVAILABLE: '#22c55e',
    LOCKED: '#f59e0b',
    BOOKED: '#ef4444',
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 8 }}>
      {seats.map((seat) => (
        <button
          key={seat.id}
          disabled={seat.status === 'BOOKED'}
          onClick={() => onSelect(seat.seatNo)}
          style={{
            backgroundColor: selectedSeat === seat.seatNo ? '#3b82f6' : colorMap[seat.status],
            color: '#fff',
            padding: 8,
            border: 'none',
            borderRadius: 4,
            cursor: seat.status === 'BOOKED' ? 'not-allowed' : 'pointer',
            opacity: seat.status === 'BOOKED' ? 0.5 : 1,
          }}
        >
          {seat.seatNo}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Socket.IO client integration for real-time seat updates**

```typescript
// frontend/src/lib/socket.ts
import { io } from 'socket.io-client'

export const socket = io()

export function joinShowtime(showtimeId: string) {
  socket.emit('join', showtimeId)
}
```

- [ ] **Run tests, pass, commit**

```bash
git add frontend/src/components/SeatMap.tsx frontend/src/lib/socket.ts
git commit -m "feat: add SeatMap component and socket client"
```

#### Task 15.4: Admin Page

**Files:**
- Create: `frontend/src/pages/Admin.tsx`

- [ ] **Implement admin bookings list + audit log viewer**

- [ ] **Wire routes in App.tsx with react-router-dom**

- [ ] **Test + commit**

---

### Phase 16: Docker + README

#### Task 16.1: Verify Docker Compose

- [ ] **Run `docker compose up --build` and verify all services start**

Expected: All 5 containers healthy and reachable.

- [ ] **Commit any Dockerfile fixes**

#### Task 16.2: Write README

**Files:**
- Modify: `README.md`

- [ ] **Write full README with architecture, setup, API docs, booking flow, trade-offs**

```markdown
# Cinema Ticket Booking System

## Tech Stack
...

## Quick Start
docker compose up --build

## Architecture
...

## API Reference
...

## Booking Flow
...

## Redis Lock Strategy
...

## Socket.IO Events
...

## RabbitMQ Events
...

## Trade-offs
...
```

- [ ] **Commit**

---

### Phase 17: Concurrency Testing

#### Task 17.1: Concurrency Stress Test

- [ ] **Write concurrency test for double-booking prevention**

Create `backend/src/tests/concurrency.test.ts`:

```typescript
import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'

describe('Concurrency: 100 users booking 1 seat', () => {
  const app = createApp()
  const tokens: string[] = []

  beforeAll(async () => {
    // Register 100 test users and collect their tokens
    for (let i = 0; i < 100; i++) {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: `user${i}@test.com`, password: 'password123', name: `User${i}` })
      if (res.body.success) tokens.push(res.body.data.token)
    }
  })

  it('allows exactly 1 booking for seat A1 under concurrency', async () => {
    const results = await Promise.all(
      tokens.map((token) =>
        request(app)
          .post('/api/bookings')
          .set('Authorization', `Bearer ${token}`)
          .send({ showtimeId: SHOWTIME_ID, seatNo: 'A1' })
          .then((r) => r.body.success),
      ),
    )

    const successes = results.filter(Boolean).length
    expect(successes).toBe(1)
  })
})
```

- [ ] **Run + commit**

---

## Spec Coverage Check

| Spec Requirement | Task |
|---|---|
| JWT auth with USER/ADMIN roles | Phase 4 (all tasks) |
| Movie CRUD APIs | Phase 5 |
| Showtime APIs | Phase 6 |
| Seat map API | Phase 7 |
| Booking flow (create + payment) | Phase 8, 10 |
| Redis distributed lock | Phase 9 |
| Socket.IO real-time updates | Phase 11 |
| Lock expiration worker | Phase 12 |
| RabbitMQ async events | Phase 13 |
| Admin dashboard APIs | Phase 14 |
| Frontend pages | Phase 15 |
| Docker Compose | Task 1.3, Phase 16 |
| TDD with Vitest | All phases (inline test-first) |
| JSDoc on exported functions | All phases (inline) |
| Lint + type-check gate | Todo: configure in Task 16.1 |
| Concurrency testing | Phase 17 |
| README | Phase 16 |
