import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api.js'
import { useAuthStore } from '../stores/auth.store.js'

/**
 * Hook for auth actions: login, register, logout.
 */
export function useAuth() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const logout = useAuthStore((s) => s.logout)

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password })
    if (res.data.success) {
      setAuth(res.data.data)
      return { success: true as const }
    }
    return { success: false as const, error: res.data.error }
  }, [setAuth])

  const register = useCallback(async (email: string, password: string, name: string) => {
    const res = await api.post('/auth/register', { email, password, name })
    if (res.data.success) {
      setAuth(res.data.data)
      return { success: true as const }
    }
    return { success: false as const, error: res.data.error }
  }, [setAuth])

  const handleLogout = useCallback(() => {
    logout()
    navigate('/login')
  }, [logout, navigate])

  return { login, register, logout: handleLogout }
}
