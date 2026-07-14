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
  findAll(): Promise<unknown[]>
  findById(id: string): Promise<unknown | null>
}
