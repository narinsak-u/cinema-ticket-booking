import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../lib/api.js'
import type { Movie, Showtime } from '../stores/movie.store.js'

export function MovieDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [movie, setMovie] = useState<Movie | null>(null)
  const [showtimes, setShowtimes] = useState<Showtime[]>([])

  useEffect(() => {
    api.get(`/movies/${id}`).then((res) => {
      if (res.data.success) setMovie(res.data.data)
    })
    api.get('/showtimes').then((res) => {
      if (res.data.success) {
        const filtered = res.data.data.filter((s: Showtime) => s.movieId === id)
        setShowtimes(filtered)
      }
    })
  }, [id])

  if (!movie) return <div>Loading...</div>

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
      <h1>{movie.title}</h1>
      <p>{movie.description}</p>
      <p>Genre: {movie.genre} | Duration: {movie.duration}min</p>
      <h2>Showtimes</h2>
      {showtimes.map((st) => (
        <div key={st.id} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12, marginBottom: 8 }}>
          <p>{st.hall} — {new Date(st.startTime).toLocaleString()} — ${st.price}</p>
          <button onClick={() => navigate(`/booking/${st.id}`)}>Select Seats</button>
        </div>
      ))}
    </div>
  )
}
