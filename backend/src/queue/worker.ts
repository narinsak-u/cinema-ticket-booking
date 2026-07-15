import type { Server } from "socket.io";
import type { IBookingRepository } from "../repositories/booking.repository.js";
import type { ISeatRepository } from "../repositories/seat.repository.js";
import { broadcastSeatReleased } from "../socket/handlers.js";

const LOCK_TTL_SECONDS = 300;
const INTERVAL_MS = 30_000;

export function startExpirationWorker(
  bookingRepo: IBookingRepository,
  _seatRepo: ISeatRepository,
  redisLock: { release: (key: string, owner: string) => Promise<boolean> },
  io: Server,
) {
  const timer = setInterval(async () => {
    const cutoff = new Date(Date.now() - LOCK_TTL_SECONDS * 1000);
    const expired = await bookingRepo.findExpired(cutoff);

    for (const booking of expired) {
      const showtimeId = booking.showtimeId;
      const seatNo = booking.seat?.seatNo;
      const lockKey = `seat_lock:${showtimeId}:${seatNo}`;

      await bookingRepo.updateStatus(booking.id, "EXPIRED", null);
      await redisLock.release(lockKey, booking.lockOwner ?? "");
      if (seatNo) {
        broadcastSeatReleased(io, showtimeId, seatNo);
      }
    }
  }, INTERVAL_MS);

  return () => clearInterval(timer);
}
