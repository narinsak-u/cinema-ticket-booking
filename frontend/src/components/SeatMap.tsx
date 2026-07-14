interface Seat {
  id: string
  seatNo: string
  status: string
}

interface SeatMapProps {
  seats: Seat[]
  selectedSeat?: string | null
  onSelect: (seatNo: string) => void
}

const colorMap: Record<string, string> = {
  AVAILABLE: '#22c55e',
  LOCKED: '#f59e0b',
  BOOKED: '#ef4444',
}

export function SeatMap({ seats, selectedSeat, onSelect }: SeatMapProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 8, padding: 16 }}>
      {seats.map((seat) => (
        <button
          key={seat.id}
          disabled={seat.status === 'BOOKED'}
          onClick={() => onSelect(seat.seatNo)}
          style={{
            backgroundColor: selectedSeat === seat.seatNo ? '#3b82f6' : colorMap[seat.status] ?? '#6b7280',
            color: '#fff',
            padding: 10,
            border: 'none',
            borderRadius: 6,
            cursor: seat.status === 'BOOKED' ? 'not-allowed' : 'pointer',
            opacity: seat.status === 'BOOKED' ? 0.5 : 1,
            fontWeight: 600,
          }}
          title={`${seat.seatNo} - ${seat.status}`}
        >
          {seat.seatNo}
        </button>
      ))}
    </div>
  )
}
