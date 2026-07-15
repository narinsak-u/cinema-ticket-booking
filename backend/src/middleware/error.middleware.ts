import type { Request, Response, NextFunction } from "express";

/**
 * Typed HTTP error for service layer. Includes status code and error message.
 */
export class AppError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = "AppError";
  }
}

/**
 * Global Express error handler. Handles AppError with its status code,
 * logs unhandled errors, and returns a 500 response for anything else.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ success: false, error: err.message });
    return;
  }
  console.error("Unhandled error:", err);
  res.status(500).json({ success: false, error: "Internal server error" });
}
