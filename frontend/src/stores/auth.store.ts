import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  email: string
  name: string
  role: string
}

interface AuthState {
  token: string | null
  user: User | null
  setAuth: (data: { token: string; user: User }) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (data) => {
        localStorage.setItem('token', data.token)
        set({ token: data.token, user: data.user })
      },
      logout: () => {
        localStorage.removeItem('token')
        set({ token: null, user: null })
      },
    }),
    { name: 'auth-storage' },
  ),
)
