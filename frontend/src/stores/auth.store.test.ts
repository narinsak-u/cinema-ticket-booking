import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from './auth.store.js'

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.setState({ token: null, user: null })
    localStorage.clear()
  })

  it('starts unauthenticated', () => {
    const { token, user } = useAuthStore.getState()
    expect(token).toBeNull()
    expect(user).toBeNull()
  })

  it('sets auth state', () => {
    useAuthStore.getState().setAuth({ token: 'abc', user: { id: '1', email: 'a@b.com', name: 'A', role: 'USER' } })
    const { token, user } = useAuthStore.getState()
    expect(token).toBe('abc')
    expect(user?.email).toBe('a@b.com')
  })

  it('clears auth on logout', () => {
    useAuthStore.getState().setAuth({ token: 'abc', user: { id: '1', email: 'a@b.com', name: 'A', role: 'USER' } })
    useAuthStore.getState().logout()
    const { token, user } = useAuthStore.getState()
    expect(token).toBeNull()
    expect(user).toBeNull()
  })
})
