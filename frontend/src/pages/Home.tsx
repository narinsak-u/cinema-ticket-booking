import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api.js'
import { MovieCard } from '../components/MovieCard.js'

interface Movie {
  id: string
  title: string
  description: string
  genre: string
}

export function Home() {
  const [movies, setMovies] = useState<Movie[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/api/movies').then((res) => {
      if (res.data.success) setMovies(res.data.data)
    })
  }, [])

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
