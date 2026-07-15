import type { PrismaClient } from '@prisma/client'

export interface IAuditLogRepository {
  create(data: { event: string; data: string }): Promise<unknown>
  findAll(orderBy?: 'asc' | 'desc'): Promise<unknown[]>
}

export function createAuditLogRepository(prisma: PrismaClient): IAuditLogRepository {
  return {
    async create(data) {
      return prisma.auditLog.create({ data })
    },
    async findAll(orderBy: 'asc' | 'desc' = 'desc') {
      return prisma.auditLog.findMany({ orderBy: { createdAt: orderBy } })
    },
  }
}
