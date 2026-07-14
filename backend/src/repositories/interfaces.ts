import type { User, Movie } from '@prisma/client'

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

export interface IShowtimeRepository {
  findAll(): Promise<unknown[]>
  findById(id: string): Promise<unknown | null>
}

export interface ISeatRepository {
  findByShowtime(showtimeId: string): Promise<unknown[]>
  updateStatus(id: string, status: string, version?: number): Promise<unknown | null>
}

export interface IAuditLogRepository {
  create(data: { event: string; data: string }): Promise<unknown>
  findAll(orderBy?: 'asc' | 'desc'): Promise<unknown[]>
}

export interface IBookingRepository {
  create(data: {
    userId: string
    showtimeId: string
    seatId: string
    status: string
  }): Promise<unknown>
  findById(id: string): Promise<unknown | null>
  findByUser(userId: string): Promise<unknown[]>
  findExpired(before: Date): Promise<unknown[]>
  updateStatus(id: string, status: string, lockOwner?: string | null): Promise<unknown | null>
}
