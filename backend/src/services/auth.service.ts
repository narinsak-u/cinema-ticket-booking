import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import type { IUserRepository } from '../repositories/user.repository.js'

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
