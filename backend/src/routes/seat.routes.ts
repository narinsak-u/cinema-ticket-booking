import {
  Router,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import type { createSeatController } from "../controllers/seat.controller.js";

export function createSeatRoutes(
  controller: ReturnType<typeof createSeatController>,
  authMiddleware: (req: Request, res: Response, next: NextFunction) => void,
) {
  const router = Router();
  router.get("/:showtimeId/seats", authMiddleware, controller.getSeatMap);
  return router;
}
