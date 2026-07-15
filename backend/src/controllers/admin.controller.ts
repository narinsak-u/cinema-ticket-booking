import type { Request, Response } from "express";
import type { ApiResponse } from "../lib/response.js";

/**
 * Creates controller handlers for admin endpoints.
 * Handles listing all bookings with optional filters and fetching audit logs.
 */
export function createAdminController(adminService: {
  getBookings: (filters: {
    movieId?: string;
    userId?: string;
    date?: string;
  }) => Promise<ApiResponse>;
  getLogs: () => Promise<ApiResponse>;
}) {
  return {
    async getBookings(req: Request, res: Response) {
      const result = await adminService.getBookings({
        movieId: req.query.movieId as string,
        userId: req.query.userId as string,
        date: req.query.date as string,
      });
      res.json(result);
    },
    async getLogs(_req: Request, res: Response) {
      const result = await adminService.getLogs();
      res.json(result);
    },
  };
}
