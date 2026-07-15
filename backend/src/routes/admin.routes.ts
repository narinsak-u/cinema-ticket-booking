import {
  Router,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import type { createAdminController } from "../controllers/admin.controller.js";

export function createAdminRoutes(
  controller: ReturnType<typeof createAdminController>,
  authMiddleware: (req: Request, res: Response, next: NextFunction) => void,
  adminMiddleware: (req: Request, res: Response, next: NextFunction) => void,
) {
  const router = Router();
  router.use(authMiddleware, adminMiddleware);
  router.get("/bookings", controller.getBookings);
  router.get("/logs", controller.getLogs);
  return router;
}
