import type { Prisma, User, Movie, Seat, Booking, AuditLog } from '@prisma/client'

export type ShowtimeWithMovie = Prisma.ShowtimeGetPayload<{ include: { movie: true } }>
export type BookingWithSeat = Prisma.BookingGetPayload<{ include: { seat: true } }>
export type BookingWithSeatShowtime = Prisma.BookingGetPayload<{ include: { seat: true; showtime: true } }>
export type BookingWithSeatShowtimeMovie = Prisma.BookingGetPayload<{ include: { seat: true; showtime: { include: { movie: true } } } }>

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
  findAll(limit?: number, offset?: number): Promise<Movie[]>
  findById(id: string): Promise<Movie | null>
}

export interface IShowtimeRepository {
  findAll(limit?: number, offset?: number): Promise<ShowtimeWithMovie[]>
  findById(id: string): Promise<ShowtimeWithMovie | null>
}

export interface ISeatRepository {
  findByShowtime(showtimeId: string): Promise<Seat[]>
  updateStatus(id: string, status: string): Promise<Seat | null>
}

export interface IBookingRepository {
  create(data: {
    userId: string
    showtimeId: string
    seatId: string
    status: string
  }): Promise<BookingWithSeatShowtime>
  findById(id: string): Promise<BookingWithSeat | null>
  findAll(): Promise<BookingWithSeatShowtimeMovie[]>
  findByUser(userId: string): Promise<BookingWithSeatShowtimeMovie[]>
  findExpired(before: Date): Promise<BookingWithSeat[]>
  updateStatus(id: string, status: string, lockOwner?: string | null): Promise<Booking | null>
}

export interface IAuditLogRepository {
  create(data: { event: string; data: string }): Promise<AuditLog>
  findAll(orderBy?: 'asc' | 'desc'): Promise<AuditLog[]>
}
