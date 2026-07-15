import { useEffect } from 'react'
import { api } from '../lib/api.js'
import { useBookingStore } from '../stores/booking.store.js'

export interface Seat {
  id: string
  seatNo: string
  status: string
}

/**
 * Hook that fetches seats for a showtime and provides loading/error state.
 */
export function useSeats(showtimeId: string | undefined) {
  const { seats, setSeats } = useBookingStore()

  useEffect(() => {
    if (!showtimeId) return
    api.get(`/showtimes/${showtimeId}/seats`)
      .then((res) => {
        if (res.data.success) setSeats(res.data.data)
      })
  }, [showtimeId, setSeats])

  return { seats }
}
