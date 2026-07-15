import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { socket, joinShowtime, leaveShowtime } from "../lib/socket.js";
import { SeatMap } from "../components/SeatMap.js";
import { BookingSummary } from "../components/BookingSummary.js";
import { useBookingStore } from "../stores/booking.store.js";
import { useSeats } from "../hooks/useSeats.js";
import { api } from "../lib/api.js";

interface SocketSeatEvent {
  seatNo: string
}

export function Booking() {
  const { showtimeId } = useParams<{ showtimeId: string }>();
  const navigate = useNavigate();
  const {
    selectedSeat,
    bookingId,
    selectSeat,
    setShowtimeId,
    setBookingId,
    updateSeatStatus,
    reset,
  } = useBookingStore();

  useSeats(showtimeId);

  const seats = useBookingStore((s) => s.seats);

  useEffect(() => {
    if (!showtimeId) return;
    setShowtimeId(showtimeId);
    joinShowtime(showtimeId);

    const onLocked = (data: SocketSeatEvent) => updateSeatStatus(data.seatNo, "LOCKED");
    const onReleased = (data: SocketSeatEvent) => updateSeatStatus(data.seatNo, "AVAILABLE");
    const onBooked = (data: SocketSeatEvent) => updateSeatStatus(data.seatNo, "BOOKED");

    socket.on("seat:locked", onLocked);
    socket.on("seat:released", onReleased);
    socket.on("seat:booked", onBooked);

    return () => {
      leaveShowtime(showtimeId);
      socket.off("seat:locked", onLocked);
      socket.off("seat:released", onReleased);
      socket.off("seat:booked", onBooked);
      reset();
    };
  }, [showtimeId, setShowtimeId, updateSeatStatus, reset]);

  const handleSeatSelect = (seatNo: string) => {
    if (bookingId) return;
    selectSeat(seatNo);
    socket.emit("seat:select", { showtimeId, seatNo });
  };

  const handleBooking = async () => {
    if (!selectedSeat || !showtimeId) return;
    const res = await api.post("/bookings", { showtimeId, seatNo: selectedSeat });
    if (res.data.success) {
      setBookingId(res.data.data.id);
    }
  };

  const handlePayment = async () => {
    if (!bookingId) return;
    const res = await api.post("/bookings/payment", { bookingId });
    if (res.data.success) {
      alert("Booking confirmed!");
      reset();
      navigate("/");
    }
  };

  const selected = seats.find((s) => s.seatNo === selectedSeat);

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 24 }}>
      <h2>Select Your Seats</h2>
      <SeatMap
        seats={seats}
        selectedSeat={selectedSeat}
        onSelect={handleSeatSelect}
      />
      {selectedSeat && selected && !bookingId && (
        <button onClick={handleBooking} style={{ marginTop: 16 }}>
          Book {selectedSeat}
        </button>
      )}
      {bookingId && selected && (
        <BookingSummary
          bookingId={bookingId}
          seatNo={selected.seatNo}
          onPay={handlePayment}
        />
      )}
    </div>
  );
}
