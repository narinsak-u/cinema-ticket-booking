import { create } from 'zustand'

export interface Movie {
  id: string
  title: string
  description: string
  posterUrl: string
  duration: number
  genre: string
}

export interface Showtime {
  id: string
  movieId: string
  hall: string
  startTime: string
  price: number
  movie: Movie
}

interface MovieState {
  movies: Movie[]
  showtimes: Showtime[]
  loading: boolean
  error: string | null
  setMovies: (movies: Movie[]) => void
  setShowtimes: (showtimes: Showtime[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

export const useMovieStore = create<MovieState>((set) => ({
  movies: [],
  showtimes: [],
  loading: false,
  error: null,
  setMovies: (movies) => set({ movies }),
  setShowtimes: (showtimes) => set({ showtimes }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  reset: () => set({ movies: [], showtimes: [], loading: false, error: null }),
}))
