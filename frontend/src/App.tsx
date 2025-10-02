import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import SeatMap from './pages/SeatMap'
import MyBookings from './pages/MyBookings'
import AdminPanel from './pages/AdminPanel'
import UserManagement from './pages/UserManagement'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  
  if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  
  return <>{children}</>
}

function SuperAdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  
  if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'superadmin') return <Navigate to="/dashboard" replace />
  
  return <>{children}</>
}

function AppRoutes() {
  const { user, loading } = useAuth()
  
  if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>
  
  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/seats" element={<ProtectedRoute><SeatMap /></ProtectedRoute>} />
      <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
      <Route path="/admin" element={<SuperAdminRoute><AdminPanel /></SuperAdminRoute>} />
      <Route path="/users" element={<SuperAdminRoute><UserManagement /></SuperAdminRoute>} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
