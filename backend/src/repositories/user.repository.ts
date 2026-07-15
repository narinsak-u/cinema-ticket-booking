import type { PrismaClient, User } from '@prisma/client'

/** Data required to create a new user. */
export interface CreateUserData {
  email: string
  password: string
  name: string
}

/** Repository interface for user data access. */
export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>
  findById(id: string): Promise<User | null>
  create(data: CreateUserData): Promise<User>
}

/**
 * Creates a user repository backed by Prisma.
 */
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
