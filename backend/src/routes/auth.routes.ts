import {
  Router,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import { createAuthController } from "../controllers/auth.controller.js";

/**
 * Creates auth routes: POST /register, POST /login, GET /me (auth required).
 */
export function createAuthRoutes(
  controller: ReturnType<typeof createAuthController>,
  authMiddleware: (req: Request, res: Response, next: NextFunction) => void,
) {
  const router = Router();

  router.post("/register", controller.register);
  router.post("/login", controller.login);
  router.get("/me", authMiddleware, controller.getMe);

  return router;
}
