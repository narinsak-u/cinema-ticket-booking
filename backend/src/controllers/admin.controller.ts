import type { Request, Response } from 'express'

export function createAdminController(adminService: {
  getBookings: (filters: { movieId?: string; userId?: string; date?: string }) => Promise<{ success: boolean; data?: any; error?: string }>
  getLogs: () => Promise<{ success: boolean; data?: any; error?: string }>
}) {
  return {
    async getBookings(req: Request, res: Response) {
      const result = await adminService.getBookings({
        movieId: req.query.movieId as string,
        userId: req.query.userId as string,
        date: req.query.date as string,
      })
      res.json(result)
    },
    async getLogs(_req: Request, res: Response) {
      const result = await adminService.getLogs()
      res.json(result)
    },
  }
}
