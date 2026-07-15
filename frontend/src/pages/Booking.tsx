import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../lib/api.js";
import { socket, joinShowtime, leaveShowtime } from "../lib/socket.js";
import { SeatMap } from "../components/SeatMap.js";
import { useBookingStore } from "../stores/booking.store.js";

export function Booking() {
  const { showtimeId } = useParams<{ showtimeId: string }>();
  const navigate = useNavigate();
  const {
    seats,
    selectedSeat,
    bookingId,
    setSeats,
    selectSeat,
    setShowtimeId,
    setBookingId,
    updateSeatStatus,
    reset,
  } = useBookingStore();

  useEffect(() => {
    if (!showtimeId) return;
    setShowtimeId(showtimeId);
    joinShowtime(showtimeId);

    api.get(`/showtimes/${showtimeId}/seats`).then((res) => {
      if (res.data.success) setSeats(res.data.data);
    });

    socket.on("seat:locked", (data: any) =>
      updateSeatStatus(data.seatNo, "LOCKED"),
    );
    socket.on("seat:released", (data: any) =>
      updateSeatStatus(data.seatNo, "AVAILABLE"),
    );
    socket.on("seat:booked", (data: any) =>
      updateSeatStatus(data.seatNo, "BOOKED"),
    );

    return () => {
      leaveShowtime(showtimeId);
      socket.off("seat:locked");
      socket.off("seat:released");
      socket.off("seat:booked");
      reset();
    };
  }, [showtimeId]);

  const handleSeatSelect = async (seatNo: string) => {
    if (bookingId) return;
    selectSeat(seatNo);
    socket.emit("seat:select", {
      showtimeId,
      seatNo,
      userId: localStorage.getItem("token"),
    });
  };

  const handleBooking = async () => {
    if (!selectedSeat || !showtimeId) return;
    const res = await api.post("/bookings", {
      showtimeId,
      seatNo: selectedSeat,
    });
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

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 24 }}>
      <h2>Select Your Seats</h2>
      <SeatMap
        seats={seats}
        selectedSeat={selectedSeat}
        onSelect={handleSeatSelect}
      />
      {selectedSeat && !bookingId && (
        <button onClick={handleBooking} style={{ marginTop: 16 }}>
          Book {selectedSeat}
        </button>
      )}
      {bookingId && (
        <div>
          <p>Booking ID: {bookingId}</p>
          <button onClick={handlePayment}>Pay Now</button>
        </div>
      )}
    </div>
  );
}
