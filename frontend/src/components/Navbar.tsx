import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/auth.store.js'

export function Navbar() {
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 24px', borderBottom: '1px solid #e5e7eb', background: '#fff' }}>
      <Link to="/" style={{ fontWeight: 700, fontSize: 18, textDecoration: 'none', color: '#111827' }}>
        Cinema Booking
      </Link>
      {token && (
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link to="/" style={{ textDecoration: 'none', color: '#374151' }}>Movies</Link>
          {user?.role === 'ADMIN' && (
            <Link to="/admin" style={{ textDecoration: 'none', color: '#374151' }}>Admin</Link>
          )}
        </div>
      )}
      <div style={{ marginLeft: 'auto' }}>
        {token ? (
          <button onClick={handleLogout} style={{ background: 'none', border: '1px solid #d1d5db', borderRadius: 6, padding: '6px 12px', cursor: 'pointer' }}>
            Logout
          </button>
        ) : (
          <Link to="/login" style={{ textDecoration: 'none', color: '#374151' }}>Login</Link>
        )}
      </div>
    </nav>
  )
}
