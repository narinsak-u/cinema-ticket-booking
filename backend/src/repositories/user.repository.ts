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
