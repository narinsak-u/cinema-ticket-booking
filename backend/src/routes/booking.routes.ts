import {
  Router,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import type { createBookingController } from "../controllers/booking.controller.js";

export function createBookingRoutes(
  controller: ReturnType<typeof createBookingController>,
  authMiddleware: (req: Request, res: Response, next: NextFunction) => void,
) {
  const router = Router();
  router.post("/", authMiddleware, controller.create);
  router.post("/payment", authMiddleware, controller.payment);
  return router;
}
