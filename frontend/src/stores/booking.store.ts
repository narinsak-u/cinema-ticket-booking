import { create } from 'zustand'

interface Seat {
  id: string
  seatNo: string
  status: string
}

interface BookingState {
  selectedSeat: string | null
  showtimeId: string | null
  bookingId: string | null
  seats: Seat[]
  setSeats: (seats: Seat[]) => void
  selectSeat: (seatNo: string | null) => void
  setShowtimeId: (id: string) => void
  setBookingId: (id: string | null) => void
  updateSeatStatus: (seatNo: string, status: string) => void
  reset: () => void
}

export const useBookingStore = create<BookingState>((set) => ({
  selectedSeat: null,
  showtimeId: null,
  bookingId: null,
  seats: [],
  setSeats: (seats) => set({ seats }),
  selectSeat: (seatNo) => set({ selectedSeat: seatNo }),
  setShowtimeId: (id) => set({ showtimeId: id }),
  setBookingId: (id) => set({ bookingId: id }),
  updateSeatStatus: (seatNo, status) =>
    set((state) => ({
      seats: state.seats.map((s) => (s.seatNo === seatNo ? { ...s, status } : s)),
    })),
  reset: () => set({ selectedSeat: null, showtimeId: null, bookingId: null }),
}))
