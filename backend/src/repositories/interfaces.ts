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
