import { useEffect, useState } from 'react'
import { api } from '../lib/api.js'
import { useAuthStore } from '../stores/auth.store.js'
import { useNavigate } from 'react-router-dom'

interface Booking {
  id: string
  status: string
  createdAt: string
  userId: string
  showtimeId: string
  seat: { seatNo: string }
  showtime: { hall: string; startTime: string; movie: { title: string } }
}

interface AuditLog {
  id: string
  event: string
  data: string
  createdAt: string
}

export function Admin() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [tab, setTab] = useState<'bookings' | 'logs'>('bookings')
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      navigate('/')
      return
    }
    api.get('/admin/bookings').then((res) => {
      if (res.data.success) setBookings(res.data.data)
    })
    api.get('/admin/logs').then((res) => {
      if (res.data.success) setLogs(res.data.data)
    })
  }, [user, navigate])

  if (user?.role !== 'ADMIN') return null

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
      <h1>Admin Dashboard</h1>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button onClick={() => setTab('bookings')} style={{ fontWeight: tab === 'bookings' ? 700 : 400 }}>
          Bookings
        </button>
        <button onClick={() => setTab('logs')} style={{ fontWeight: tab === 'logs' ? 700 : 400 }}>
          Audit Logs
        </button>
      </div>

      {tab === 'bookings' && (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #e5e7eb' }}>ID</th>
              <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #e5e7eb' }}>Movie</th>
              <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #e5e7eb' }}>Seat</th>
              <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #e5e7eb' }}>Status</th>
              <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #e5e7eb' }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id}>
                <td style={{ padding: 8, borderBottom: '1px solid #f3f4f6' }}>{b.id.slice(0, 8)}</td>
                <td style={{ padding: 8, borderBottom: '1px solid #f3f4f6' }}>{b.showtime.movie.title}</td>
                <td style={{ padding: 8, borderBottom: '1px solid #f3f4f6' }}>{b.seat.seatNo}</td>
                <td style={{ padding: 8, borderBottom: '1px solid #f3f4f6' }}>{b.status}</td>
                <td style={{ padding: 8, borderBottom: '1px solid #f3f4f6' }}>{new Date(b.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {tab === 'logs' && (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #e5e7eb' }}>Event</th>
              <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #e5e7eb' }}>Data</th>
              <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #e5e7eb' }}>Time</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id}>
                <td style={{ padding: 8, borderBottom: '1px solid #f3f4f6' }}>{l.event}</td>
                <td style={{ padding: 8, borderBottom: '1px solid #f3f4f6' }}>{l.data}</td>
                <td style={{ padding: 8, borderBottom: '1px solid #f3f4f6' }}>{new Date(l.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
