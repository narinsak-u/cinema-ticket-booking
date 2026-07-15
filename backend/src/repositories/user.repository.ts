import type { PrismaClient, User } from '@prisma/client'

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
