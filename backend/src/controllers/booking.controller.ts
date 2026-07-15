import type { Request, Response } from "express";
import type { ApiResponse } from "../lib/response.js";
import { createBookingSchema, paymentSchema } from "../lib/validation.js";

export function createBookingController(bookingService: {
  create: (data: {
    userId: string;
    showtimeId: string;
    seatNo: string;
  }) => Promise<ApiResponse>;
  payment: (
    bookingId: string,
    userId: string,
  ) => Promise<ApiResponse>;
}) {
  return {
    async create(req: Request, res: Response) {
      const parsed = createBookingSchema.safeParse(req.body);
      if (!parsed.success) {
        res
          .status(400)
          .json({ success: false, error: parsed.error.errors[0].message });
        return;
      }
      const result = await bookingService.create({
        userId: req.user!.id,
        ...parsed.data,
      });
      res.json(result);
    },
    async payment(req: Request, res: Response) {
      const parsed = paymentSchema.safeParse(req.body);
      if (!parsed.success) {
        res
          .status(400)
          .json({ success: false, error: parsed.error.errors[0].message });
        return;
      }
      const result = await bookingService.payment(
        parsed.data.bookingId,
        req.user!.id,
      );
      res.json(result);
    },
  };
}
