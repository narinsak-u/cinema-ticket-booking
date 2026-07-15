import { z } from 'zod'

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const createBookingSchema = z.object({
  showtimeId: z.string().min(1),
  seatNo: z.string().min(1),
})

export const paymentSchema = z.object({
  bookingId: z.string().min(1),
})
