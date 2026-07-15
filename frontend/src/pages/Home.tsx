import { useNavigate } from 'react-router-dom'
import { useMovies } from '../hooks/useMovies.js'
import { MovieCard } from '../components/MovieCard.js'

export function Home() {
  const { movies, loading } = useMovies()
  const navigate = useNavigate()

  if (loading) return <div style={{ padding: 24 }}>Loading...</div>

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
      <h1>Now Showing</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 16 }}>
        {movies.map((movie) => (
          <MovieCard
            key={movie.id}
            title={movie.title}
            description={movie.description}
            genre={movie.genre}
            onClick={() => navigate(`/movies/${movie.id}`)}
          />
        ))}
      </div>
    </div>
  )
}
