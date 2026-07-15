import type { Request, Response } from 'express'
import { registerSchema, loginSchema } from '../lib/validation.js'

export function createAuthController(authService: {
  register: (data: { email: string; password: string; name: string }) => Promise<{ success: boolean; data?: any; error?: string }>
  login: (data: { email: string; password: string }) => Promise<{ success: boolean; data?: any; error?: string }>
  getMe: (userId: string) => Promise<{ success: boolean; data?: any; error?: string }>
}) {
  return {
    async register(req: Request, res: Response) {
      const parsed = registerSchema.safeParse(req.body)
      if (!parsed.success) {
        res.status(400).json({ success: false, error: parsed.error.errors[0].message })
        return
      }
      const result = await authService.register(parsed.data)
      res.json(result)
    },

    async login(req: Request, res: Response) {
      const parsed = loginSchema.safeParse(req.body)
      if (!parsed.success) {
        res.status(400).json({ success: false, error: parsed.error.errors[0].message })
        return
      }
      const result = await authService.login(parsed.data)
      res.json(result)
    },

    async getMe(req: Request, res: Response) {
      const result = await authService.getMe(req.user!.id)
      res.json(result)
    },
  }
}
