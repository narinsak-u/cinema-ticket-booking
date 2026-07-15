import { z } from 'zod'

/** Validates user registration payload: email, password (min 6), name. */
export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
})

/** Validates login payload: email and password. */
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

/** Validates booking creation payload: showtimeId and seatNo. */
export const createBookingSchema = z.object({
  showtimeId: z.string().min(1),
  seatNo: z.string().min(1),
})

/** Validates payment payload: bookingId. */
export const paymentSchema = z.object({
  bookingId: z.string().min(1),
})
