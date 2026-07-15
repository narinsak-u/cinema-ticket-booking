interface BookingSummaryProps {
  bookingId: string
  seatNo: string
  onPay: () => void
}

/**
 * Displays booking details and a pay button after a seat is locked.
 */
export function BookingSummary({ bookingId, seatNo, onPay }: BookingSummaryProps) {
  return (
    <div style={{ marginTop: 16, padding: 16, border: '1px solid #e5e7eb', borderRadius: 8 }}>
      <h3>Booking Summary</h3>
      <p>Seat: {seatNo}</p>
      <p>Booking ID: {bookingId}</p>
      <button onClick={onPay} style={{ marginTop: 8, padding: '8px 16px' }}>
        Pay Now
      </button>
    </div>
  )
}
