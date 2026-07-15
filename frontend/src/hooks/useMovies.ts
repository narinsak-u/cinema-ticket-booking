import { useEffect } from 'react'
import { api } from '../lib/api.js'
import { useMovieStore } from '../stores/movie.store.js'

/**
 * Hook that fetches movies on mount and provides loading/error state.
 */
export function useMovies() {
  const { movies, loading, error, setMovies, setLoading, setError } = useMovieStore()

  useEffect(() => {
    setLoading(true)
    api.get('/movies')
      .then((res) => {
        if (res.data.success) setMovies(res.data.data)
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load movies')
      })
      .finally(() => setLoading(false))
  }, [setMovies, setLoading, setError])

  return { movies, loading, error }
}
