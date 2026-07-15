import { useState } from 'react'
import { api } from '../lib/api.js'
import { loginSchema, registerSchema } from '../lib/schemas.js'
import { useAuthStore } from '../stores/auth.store.js'

interface LoginFormProps {
  onSuccess: () => void
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const setAuth = useAuthStore((s) => s.setAuth)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const endpoint = isRegister ? '/auth/register' : '/auth/login'
    const body = isRegister ? { email, password, name } : { email, password }

    try {
      const schema = isRegister ? registerSchema : loginSchema
      const parsed = schema.parse(body)
      const res = await api.post(endpoint, parsed)
      if (res.data.success) {
        setAuth(res.data.data)
        onSuccess()
      } else {
        setError(res.data.error ?? 'Something went wrong')
      }
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong')
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: '40px auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <h2>{isRegister ? 'Register' : 'Login'}</h2>
      {isRegister && (
        <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
      )}
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button type="submit">{isRegister ? 'Register' : 'Login'}</button>
      <button type="button" onClick={() => setIsRegister(!isRegister)}>
        {isRegister ? 'Already have an account? Login' : "Don't have an account? Register"}
      </button>
    </form>
  )
}
