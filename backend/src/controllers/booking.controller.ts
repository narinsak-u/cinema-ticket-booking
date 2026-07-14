import type { Request, Response } from 'express'

export function createBookingController(bookingService: {
  create: (data: { userId: string; showtimeId: string; seatNo: string }) => Promise<{ success: boolean; data?: any; error?: string }>
  payment: (bookingId: string, userId: string) => Promise<{ success: boolean; data?: any; error?: string }>
}) {
  return {
    async create(req: Request, res: Response) {
      const result = await bookingService.create({
        userId: req.user!.id,
        showtimeId: req.body.showtimeId,
        seatNo: req.body.seatNo,
      })
      res.json(result)
    },
    async payment(req: Request, res: Response) {
      const result = await bookingService.payment(req.body.bookingId, req.user!.id)
      res.json(result)
    },
  }
}
