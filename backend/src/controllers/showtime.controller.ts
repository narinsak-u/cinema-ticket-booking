import type { Request, Response } from 'express'

export function createShowtimeController(showtimeService: {
  getAll: () => Promise<{ success: boolean; data?: any; error?: string }>
  getById: (id: string) => Promise<{ success: boolean; data?: any; error?: string }>
}) {
  return {
    async getAll(_req: Request, res: Response) {
      const result = await showtimeService.getAll()
      res.json(result)
    },
    async getById(req: Request, res: Response) {
      const result = await showtimeService.getById(req.params.id as string)
      res.json(result)
    },
  }
}
