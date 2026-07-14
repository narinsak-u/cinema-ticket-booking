import type { PrismaClient } from '@prisma/client'
import type { IAuditLogRepository } from './interfaces.js'

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
