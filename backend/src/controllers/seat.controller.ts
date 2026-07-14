import type { Request, Response } from 'express'

export function createSeatController(seatService: {
  getSeatMap: (showtimeId: string) => Promise<{ success: boolean; data?: any; error?: string }>
}) {
  return {
    async getSeatMap(req: Request, res: Response) {
      const result = await seatService.getSeatMap(req.params.showtimeId as string)
      res.json(result)
    },
  }
}
