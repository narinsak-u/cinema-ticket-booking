import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/auth.store.js'
import { Home } from './pages/Home.js'
import { Login } from './pages/Login.js'
import { MovieDetail } from './pages/MovieDetail.js'
import { Booking } from './pages/Booking.js'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token)
  if (!token) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/movies/:id" element={<ProtectedRoute><MovieDetail /></ProtectedRoute>} />
        <Route path="/booking/:showtimeId" element={<ProtectedRoute><Booking /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}
