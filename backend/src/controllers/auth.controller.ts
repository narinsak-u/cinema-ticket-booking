import type { Request, Response } from 'express'

export function createAuthController(authService: {
  register: (data: { email: string; password: string; name: string }) => Promise<{ success: boolean; data?: any; error?: string }>
  login: (data: { email: string; password: string }) => Promise<{ success: boolean; data?: any; error?: string }>
  getMe: (userId: string) => Promise<{ success: boolean; data?: any; error?: string }>
}) {
  return {
    async register(req: Request, res: Response) {
      const result = await authService.register(req.body)
      res.json(result)
    },

    async login(req: Request, res: Response) {
      const result = await authService.login(req.body)
      res.json(result)
    },

    async getMe(req: Request, res: Response) {
      const result = await authService.getMe(req.user!.id)
      res.json(result)
    },
  }
}
