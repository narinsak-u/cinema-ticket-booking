import type { IBookingRepository } from "../repositories/booking.repository.js";
import type { ISeatRepository } from "../repositories/seat.repository.js";
import type { Server } from "socket.io";
import {
  broadcastSeatLocked,
  broadcastSeatBooked,
} from "../socket/handlers.js";

/**
 * Creates booking service with create and payment operations.
 * Uses a Redis distributed lock to prevent double-booking and broadcasts
 * real-time seat status changes via Socket.IO.
 */
export function createBookingService(
  bookingRepo: IBookingRepository,
  seatRepo: ISeatRepository,
  redisLock?: {
    acquire: (key: string, owner: string) => Promise<boolean>;
    release: (key: string, owner: string) => Promise<boolean>;
  },
  io?: Server,
) {
  return {
    async create(data: { userId: string; showtimeId: string; seatNo: string }) {
      const seats = await seatRepo.findByShowtime(data.showtimeId);
      const seat = seats.find((s) => s.seatNo === data.seatNo);
      if (!seat) return { success: false as const, error: "Seat not found" };

      // Acquire lock BEFORE checking availability
      if (redisLock) {
        const lockKey = `seat_lock:${data.showtimeId}:${data.seatNo}`;
        const acquired = await redisLock.acquire(lockKey, data.userId);
        if (!acquired)
          return {
            success: false as const,
            error: "Seat is locked by another user",
          };
      }

      if (seat.status !== "AVAILABLE")
        return { success: false as const, error: "Seat not available" };

      const booking = await bookingRepo.create({
        userId: data.userId,
        showtimeId: data.showtimeId,
        seatId: seat.id,
        status: "PENDING",
      });

      await seatRepo.updateStatus(seat.id, "LOCKED");

      if (io) {
        broadcastSeatLocked(io, data.showtimeId, data.seatNo, data.userId);
      }

      return { success: true as const, data: booking };
    },

    async payment(bookingId: string, userId: string) {
      const booking = await bookingRepo.findById(bookingId);
      if (!booking)
        return { success: false as const, error: "Booking not found" };
      if (booking.userId !== userId)
        return { success: false as const, error: "Not your booking" };
      if (booking.status !== "PENDING")
        return { success: false as const, error: "Invalid status" };

      await bookingRepo.updateStatus(bookingId, "CONFIRMED");
      await seatRepo.updateStatus(booking.seatId, "BOOKED");

      if (io) {
        broadcastSeatBooked(
          io,
          booking.showtimeId,
          booking.seat.seatNo,
          userId,
        );
      }

      if (redisLock) {
        const lockKey = `seat_lock:${booking.showtimeId}:${booking.seat.seatNo ?? booking.showtimeId}`;
        await redisLock.release(lockKey, userId);
      }

      return {
        success: true as const,
        data: { id: bookingId, status: "CONFIRMED" },
      };
    },
  };
}
